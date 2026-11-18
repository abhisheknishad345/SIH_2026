
const Booking = require("../models/Booking");
const Worker = require("../models/Worker");
const Service = require("../models/Service");
const mongoose = require("mongoose");

const validateWorkerWorkingHours = (worker, bookingStart, duration, priceType, quantity) => {
    if (!(bookingStart instanceof Date) || Number.isNaN(bookingStart.getTime()) ||
        !Number.isFinite(Number(duration)) || Number(duration) <= 0) {
        throw new Error("Invalid booking date or duration");
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });
    const partsFor = date => Object.fromEntries(
        formatter.formatToParts(date).map(({ type, value }) => [type, value])
    );
    const minutes = value => {
        const [hours, mins] = value.split(":").map(Number);
        return hours * 60 + mins;
    };
    const start = partsFor(bookingStart);
    const startMinutes = Number(start.hour) * 60 + Number(start.minute);
    const days = priceType === "per_day" ? quantity : 1;
    const dailyMinutes = priceType === "per_day" ? 480 : duration;

    for (let index = 0; index < days; index += 1) {
        const dayDate = new Date(bookingStart.getTime() + index * 86400000);
        const day = partsFor(dayDate).weekday;
        const workingDay = (worker.workingHours || []).find(item => item.day === day);
        if (!workingDay || !workingDay.isWorking) {
            throw new Error(`Worker is not available on ${day}`);
        }
        if (startMinutes < minutes(workingDay.startTime) ||
            startMinutes + dailyMinutes > minutes(workingDay.endTime)) {
            throw new Error(`Worker is available on ${day} only between ${workingDay.startTime} and ${workingDay.endTime}`);
        }
    }
};

const createBooking = async ({
    customerId, workerId, serviceId, quantity, scheduledAt, address, location
}) => {
    const worker = await Worker.findOne({ userId: workerId });
    if (!worker) throw new Error("Worker not found");
    if (!worker.isVerified) throw new Error("Worker is not verified");
    if (!worker.isAvailable) throw new Error("Worker is currently unavailable");

    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) throw new Error("Service not found");
    if (worker.cooperativeId.toString() !== service.cooperativeId.toString()) {
        throw new Error("Worker does not belong to the service cooperative");
    }

    const skill = worker.skills.find(item => item.serviceId.toString() === service._id.toString());
    if (!skill) throw new Error("Selected service is not offered by this worker");

    const priceType = skill.priceType || "negotiable";
    const start = new Date(scheduledAt);
    if (Number.isNaN(start.getTime())) throw new Error("Invalid booking date");
    const indiaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
    if (indiaDate.format(start) < indiaDate.format(new Date())) {
        throw new Error("Booking date must be today or in the future");
    }
    if (priceType !== "per_day" && start <= new Date()) {
        throw new Error("Booking time must be in the future");
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > (priceType === "per_day" ? 30 : 12)) {
        throw new Error(priceType === "per_day"
            ? "Please select between 1 and 30 days"
            : "Please select between 1 and 12 hours");
    }

    let duration;
    let price = null;
    let pricingStatus = "pending";
    if (priceType === "per_day") {
        duration = quantity * 8 * 60;
        price = Number(skill.price) * quantity;
        pricingStatus = "fixed";
    } else if (priceType === "per_hour") {
        duration = quantity * 60;
        price = Number(skill.price) * quantity;
        pricingStatus = "fixed";
    } else if (priceType === "fixed") {
        duration = quantity * 60;
        price = Number(skill.price);
        pricingStatus = "fixed";
    } else if (priceType === "negotiable") {
        duration = quantity * 60;
    } else {
        throw new Error("Invalid worker pricing type");
    }

    if (priceType !== "negotiable" && (!Number.isFinite(price) || price <= 0)) {
        throw new Error("Worker has not configured a valid price for this service");
    }

    validateWorkerWorkingHours(worker, start, duration, priceType, quantity);

    const scheduledEndAt = priceType === "per_day"
        ? new Date(start.getTime() + (quantity - 1) * 86400000 + 8 * 60 * 60000)
        : new Date(start.getTime() + duration * 60000);

    const candidate = {
        scheduledAt: start,
        scheduledEndAt,
        duration,
        priceType,
        quantity
    };
    const existingBookings = await Booking.find({
        workerId,
        status: { $in: ["pending", "accepted", "in_progress"] },
        scheduledAt: { $lt: scheduledEndAt }
    });

    if (existingBookings.some(existing => isBookingOverlapping(candidate, existing))) {
        throw new Error("Worker is already booked during this time");
    }

    const booking = await Booking.create({
        customerId, workerId, serviceId, skillName: skill.name, quantity,
        scheduledAt: start, scheduledEndAt, duration, priceType, pricingStatus,
        address, location, price
    });

    return { message: "Booking created successfully", booking };
};

const getWorkerBookings = async ({
    workerId,
    upcoming,
    status,
    page = 1,
    limit = 10
}) => {
    const filter = { workerId };

    // Optional status filter
    if (status) {
        filter.status = status;
    }

    // Only future bookings
    if (upcoming) {
    filter.scheduledAt = {
        $gte: new Date(),
    };

    if (status) {
        filter.status = status;
    } else {
        filter.status = {
            $in: ["pending", "accepted", "in_progress"],
        };
    }
} else if (status) {
    filter.status = status;
}

    const skip = (page - 1) * limit;

    const [bookings, totalBookings] = await Promise.all([
        Booking.find(filter)
            .populate("customerId", "fullName email")
            .populate("serviceId", "name category price priceType")
            .sort({ scheduledAt: 1 })
            .skip(skip)
            .limit(limit),

        Booking.countDocuments(filter)
    ]);

    return {
        bookings,
        pagination: {
            totalBookings,
            currentPage: page,
            limit,
            totalPages: Math.ceil(totalBookings / limit),
            hasNextPage: page * limit < totalBookings,
            hasPrevPage: page > 1
        }
    };
};

const getBookingEnd = booking => booking.scheduledEndAt
    ? new Date(booking.scheduledEndAt)
    : new Date(new Date(booking.scheduledAt).getTime() + booking.duration * 60000);

const getBookingIntervals = booking => {
    const start = new Date(booking.scheduledAt);
    if (booking.priceType === "per_day" && Number(booking.quantity) > 1) {
        return Array.from({ length: Number(booking.quantity) }, (_, index) => ({
            start: new Date(start.getTime() + index * 86400000),
            end: new Date(start.getTime() + index * 86400000 + 8 * 60 * 60000)
        }));
    }
    return [{ start, end: getBookingEnd(booking) }];
};

const isBookingOverlapping = (bookingA, bookingB) =>
    getBookingIntervals(bookingA).some(a =>
        getBookingIntervals(bookingB).some(b => a.start < b.end && a.end > b.start)
    );

const updateBookingStatus = async ({
    bookingId,
    workerId,
    status
}) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.workerId.toString() !== workerId.toString()) {
        throw new Error(
            "You are not allowed to update this booking"
        );
    }

    // Generic status updates are only for accepting or rejecting pending requests.
    if (booking.status !== "pending" || !["accepted", "rejected"].includes(status)) {
        throw new Error("Only pending bookings can be accepted or rejected");
    }

    // Manual rejection: only reject selected booking
    if (status === "rejected") {
        booking.status = "rejected";

        await booking.save();

        return {
            message: "Booking rejected successfully",
            booking
        };
    }

    // Lock worker's booking acceptance process
    const worker = await Worker.findOneAndUpdate(
        {
            userId: workerId,
            bookingActionLock: false
        },
        {
            $set: {
                bookingActionLock: true
            }
        },
        {
           returnDocument: 'after'
        }
    );

    if (!worker) {
        const workerExists = await Worker.exists({
            userId: workerId
        });

        if (!workerExists) {
            throw new Error("Worker profile not found");
        }

        throw new Error(
            "Another booking action is in progress. Please try again."
        );
    }

    try {
        // Recheck booking status after acquiring lock
        const currentBooking = await Booking.findById(bookingId);

        if (!currentBooking || currentBooking.status !== "pending") {
            throw new Error(
                "This booking is no longer pending"
            );
        }

        // Check worker verification
        if (!worker.isVerified) {
            throw new Error("Worker is not verified");
        }

        // Check worker availability
        if (!worker.isAvailable) {
            throw new Error("Worker is currently unavailable");
        }

        const bookingStart = new Date(
            currentBooking.scheduledAt
        );

        const bookingEnd = getBookingEnd(currentBooking);

        // Find existing accepted bookings
        const existingAcceptedBookings = await Booking.find({
            workerId,
            status: { $in: ["accepted", "in_progress"] },
            _id: {
                $ne: currentBooking._id
            },
            scheduledAt: {
                $lt: bookingEnd
            }
        });

        // Check accepted booking overlap
        const hasConflict = existingAcceptedBookings.some(
            (existingBooking) =>
                isBookingOverlapping(
                    currentBooking,
                    existingBooking
                )
        );

        if (hasConflict) {
            throw new Error(
                "Worker already has an accepted booking during this time"
            );
        }

        // Validate the full reserved range using the saved pricing type.
        const linkedService = currentBooking.priceType
            ? null
            : await Service.findById(currentBooking.serviceId);
        const bookingPriceType = currentBooking.priceType || linkedService?.priceType;
        validateWorkerWorkingHours(
            worker,
            bookingStart,
            currentBooking.duration,
            bookingPriceType
        );

        // Accept selected booking
        currentBooking.status = "in_progress";
        currentBooking.paymentStatus = currentBooking.price != null && currentBooking.price > 0
            ? "awaiting"
            : "not_due";

        await currentBooking.save();

        // Find overlapping pending bookings
        const pendingBookings = await Booking.find({
            workerId,
            status: "pending",
            _id: {
                $ne: currentBooking._id
            },
            scheduledAt: {
                $lt: bookingEnd
            }
        });

        // Keep only bookings that truly overlap
        const overlappingPendingBookings =
            pendingBookings.filter((pendingBooking) =>
                isBookingOverlapping(
                    currentBooking,
                    pendingBooking
                )
            );

        const overlappingBookingIds =
            overlappingPendingBookings.map(
                (pendingBooking) => pendingBooking._id
            );

        // Automatically reject overlapping pending requests
        if (overlappingBookingIds.length > 0) {
            await Booking.updateMany(
                {
                    _id: {
                        $in: overlappingBookingIds
                    },
                    status: "pending"
                },
                {
                    $set: {
                        status: "rejected"
                    }
                }
            );
        }

        return {
            message: "Booking accepted successfully",
            booking: currentBooking,
            automaticallyRejected:
                overlappingBookingIds.length
        };

    } finally {
        // Always release lock
        await Worker.updateOne(
            {
                userId: workerId
            },
            {
                $set: {
                    bookingActionLock: false
                }
            }
        );
    }
};

const getCustomerBookings = async (customerId) => {
    const bookings = await Booking.find({
        customerId
    })
        .populate("workerId", "fullName email")
        .populate("serviceId", "name category priceType")
        .sort({ createdAt: -1 });

    return {
        bookings
    };
};

const cancelBooking = async ({
    bookingId,
    customerId
}) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Check: kya booking isi customer ki hai?
    if (
        booking.customerId.toString() !==
        customerId.toString()
    ) {
        throw new Error(
            "You are not allowed to cancel this booking"
        );
    }

    // Sirf pending booking cancel hogi
    if (booking.status !== "pending") {
        throw new Error(
            "Only pending bookings can be cancelled"
        );
    }

    booking.status = "cancelled";

    await booking.save();

    return {
        message: "Booking cancelled successfully",
        booking
    };
};

const completeBooking = async ({
    bookingId,
    workerId
}) => {
    const booking = await Booking.findById(bookingId);

    // console.log("Booking workerId:", booking.workerId.toString());
    // console.log("Logged-in workerId:", workerId.toString());

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Check: kya booking isi worker ki hai?
    if (
        booking.workerId.toString() !==
        workerId.toString()
    ) {
        throw new Error(
            "You are not allowed to complete this booking"
        );
    }

    if (booking.status !== "in_progress") {
        throw new Error("Only in-progress bookings can be completed");
    }

    if (!booking.serviceCompletedAt) {
        throw new Error("Mark the service as done before completing the booking");
    }

    if (booking.paymentStatus !== "paid") {
        throw new Error("Customer payment is pending");
    }

    booking.status = "completed";

    await booking.save();

    return {
        message: "Booking completed successfully",
        booking
    };
};


const markServiceDone = async ({ bookingId, workerId }) => {
    const booking = await Booking.findOne({ _id: bookingId, workerId });

    if (!booking) throw new Error("Booking not found or access denied");
    if (booking.status !== "in_progress") {
        throw new Error("Only in-progress bookings can be marked as service done");
    }
    if (booking.serviceCompletedAt) {
        return { message: "Service was already marked as done", booking };
    }

    if (booking.price == null || booking.price <= 0 || booking.pricingStatus === "pending") {
        throw new Error("Final booking price must be set before completing the service");
    }
    booking.serviceCompletedAt = new Date();
    booking.paymentStatus = "awaiting";
    await booking.save();

    return { message: "Service marked as done. Waiting for customer payment.", booking };
};

const confirmDemoPayment = async ({ bookingId, customerId }) => {
    const existingBooking = await Booking.findOne({ _id: bookingId, customerId });

    if (!existingBooking) throw new Error("Booking not found or access denied");
    if (existingBooking.status !== "in_progress") {
        throw new Error("Payment is available only for in-progress bookings");
    }
    if (!existingBooking.serviceCompletedAt) {
        throw new Error("The worker must mark the service as done first");
    }
    if (existingBooking.price == null || existingBooking.price <= 0 || existingBooking.pricingStatus === "pending") {
        throw new Error("Payment is unavailable until the final price is agreed");
    }
    if (existingBooking.paymentStatus === "paid") {
        return { message: "Demo payment was already confirmed", booking: existingBooking };
    }
    if (existingBooking.paymentStatus !== "awaiting") {
        throw new Error("This booking is not awaiting payment");
    }

    // Atomic update prevents two simultaneous confirmations from recording payment twice.
    const booking = await Booking.findOneAndUpdate(
        {
            _id: bookingId,
            customerId,
            status: "in_progress",
            serviceCompletedAt: { $ne: null },
            price: { $gt: 0 },
            pricingStatus: { $ne: "pending" },
            paymentStatus: "awaiting"
        },
        {
            $set: {
                paymentStatus: "paid",
                paymentMethod: "demo",
                paidAt: new Date()
            }
        },
        { new: true, runValidators: true }
    );

    if (!booking) {
        const latestBooking = await Booking.findOne({ _id: bookingId, customerId });
        if (latestBooking?.paymentStatus === "paid") {
            return { message: "Demo payment was already confirmed", booking: latestBooking };
        }
        throw new Error("Payment status changed. Please refresh and try again.");
    }

    return {
        message: "Demo payment confirmed successfully. No real money was transferred.",
        booking
    };
};

const getWorkerDashboard = async (workerId) => {
    const result = await Booking.aggregate([
        {
            $match: {
                workerId: new mongoose.Types.ObjectId(workerId)
            }
        },
        {
            $group: {
                _id: null,

                totalBookings: {
                    $sum: 1
                },

                pendingBookings: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "pending"] },
                            1,
                            0
                        ]
                    }
                },

                activeBookings: {
                    $sum: {
                        $cond: [
                            { $in: ["$status", ["accepted", "in_progress"]] },
                            1,
                            0
                        ]
                    }
                },

                completedBookings: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "completed"] },
                            1,
                            0
                        ]
                    }
                },

                totalEarnings: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "completed"] },
                            "$price",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalBookings: 1,
                pendingBookings: 1,
                activeBookings: 1,
                completedBookings: 1,
                totalEarnings: 1
            }
        }
    ]);

    return result[0] || {
        totalBookings: 0,
        pendingBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalEarnings: 0
    };
};

const getWorkerEarnings = async (workerId) => {
    const workerObjectId = new mongoose.Types.ObjectId(workerId);

    const now = new Date();

    const currentMonthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const nextMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    );

    const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
    );

    const result = await Booking.aggregate([
        {
            $match: {
                workerId: workerObjectId,
                status: "completed"
            }
        },
        {
            $facet: {
                lifetime: [
                    {
                        $group: {
                            _id: null,
                            totalEarnings: {
                                $sum: "$price"
                            },
                            completedBookings: {
                                $sum: 1
                            }
                        }
                    }
                ],

                currentMonth: [
                    {
                        $match: {
                            scheduledAt: {
                                $gte: currentMonthStart,
                                $lt: nextMonthStart
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            earnings: {
                                $sum: "$price"
                            },
                            bookings: {
                                $sum: 1
                            }
                        }
                    }
                ],

                previousMonth: [
                    {
                        $match: {
                            scheduledAt: {
                                $gte: previousMonthStart,
                                $lt: currentMonthStart
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            earnings: {
                                $sum: "$price"
                            },
                            bookings: {
                                $sum: 1
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const data = result[0];

    return {
        lifetime: data.lifetime[0] || {
            totalEarnings: 0,
            completedBookings: 0
        },

        currentMonth: data.currentMonth[0] || {
            earnings: 0,
            bookings: 0
        },

        previousMonth: data.previousMonth[0] || {
            earnings: 0,
            bookings: 0
        }
    };
};


module.exports = {
    createBooking, getWorkerBookings, updateBookingStatus, getCustomerBookings, cancelBooking
    , completeBooking, markServiceDone, confirmDemoPayment, getWorkerDashboard, getWorkerEarnings
};