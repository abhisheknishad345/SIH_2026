
const Booking = require("../models/Booking");
const Worker = require("../models/Worker");
const Service = require("../models/Service");
const mongoose = require("mongoose");

const validateWorkerWorkingHours = (worker, bookingStart, duration, priceType) => {
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
    const getDateParts = (date) => Object.fromEntries(
        formatter.formatToParts(date).map(({ type, value }) => [type, value])
    );

    // Per-day bookings reserve every selected calendar day.
    if (priceType === "per_day") {
        const days = Number(duration) / (24 * 60);
        for (let index = 0; index < days; index += 1) {
            const parts = getDateParts(new Date(bookingStart.getTime() + index * 86400000));
            const workingDay = (worker.workingHours || []).find(item => item.day === parts.weekday);
            if (!workingDay || !workingDay.isWorking) {
                throw new Error(`Worker is not available on ${parts.weekday}`);
            }
        }
        return;
    }

    const bookingEnd = new Date(bookingStart.getTime() + Number(duration) * 60000);
    const startParts = getDateParts(bookingStart);
    const endParts = getDateParts(bookingEnd);
    if (startParts.weekday !== endParts.weekday) {
        throw new Error("Booking must be within the worker's working day");
    }
    const workingDay = (worker.workingHours || []).find(item => item.day === startParts.weekday);
    if (!workingDay || !workingDay.isWorking) {
        throw new Error(`Worker is not working on ${startParts.weekday}`);
    }
    const startTime = `${startParts.hour}:${startParts.minute}`;
    const endTime = `${endParts.hour}:${endParts.minute}`;
    if (startTime < workingDay.startTime || endTime > workingDay.endTime) {
        throw new Error(`Worker is available on ${startParts.weekday} only between ${workingDay.startTime} and ${workingDay.endTime}`);
    }
};

const createBooking = async ({
    customerId,
    workerId,
    serviceId,
    quantity,
    scheduledAt,
    address,
    location
}) => {

    // 1. Check worker exists
    const worker = await Worker.findOne({
        userId: workerId
    });

    if (!worker) {
        throw new Error("Worker not found");
    }

    // 2. Check worker is verified
    if (!worker.isVerified) {
        throw new Error("Worker is not verified");
    }

    // 3. Check worker is available
    if (!worker.isAvailable) {
        throw new Error("Worker is currently unavailable");
    }

    // 4. Check service exists
    const service = await Service.findOne({
        _id: serviceId,
        isActive: true
    });

    if (!service) {
        throw new Error("Service not found");
    }

    const bookingStartDate = new Date(scheduledAt);
    const indiaDateFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    if (service.priceType === "per_day") {
        if (indiaDateFormatter.format(bookingStartDate) < indiaDateFormatter.format(new Date())) {
            throw new Error("Booking date must be today or in the future");
        }
    } else if (bookingStartDate <= new Date()) {
        throw new Error("Booking time must be in the future");
    }

    if (
        worker.cooperativeId.toString() !==
        service.cooperativeId.toString()
    ) {
        throw new Error(
            "Worker does not belong to the service cooperative"
        );
    }

    // 5. Find selected skill
    
const skill = worker.skills.find(
    item =>
        item.serviceId.toString() === service._id.toString()
);

if (!skill) {
    throw new Error(
        "Selected service is not offered by this worker"
    );
}


    // Calculate the final price and reserved duration on the server.
    let price;
    let bookingDuration;

    switch (service.priceType) {
        case "per_hour":
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 24) {
                throw new Error("Please select between 1 and 24 hours");
            }
            price = service.price * quantity;
            bookingDuration = quantity * 60;
            break;
        case "per_day":
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 30) {
                throw new Error("Please select between 1 and 30 days");
            }
            price = service.price * quantity;
            bookingDuration = quantity * 24 * 60;
            break;
        case "fixed":
            price = service.price;
            bookingDuration = Number(service.estimatedDurationMinutes);
            if (!Number.isInteger(bookingDuration) || bookingDuration <= 0) {
                throw new Error("This fixed-price service has no valid estimated duration. Please contact the cooperative admin.");
            }
            break;
        default:
            throw new Error("Invalid service price type");
    }

    const newBookingStart = new Date(scheduledAt);
    validateWorkerWorkingHours(worker, newBookingStart, bookingDuration, service.priceType);
    const newBookingEnd = new Date(
        newBookingStart.getTime() + bookingDuration * 60 * 1000
    );

//     console.log("Worker ID:", workerId);
// console.log("New Booking Start:", newBookingStart);
// console.log("New Booking End:", newBookingEnd);


const existingBookings = await Booking.find({
        workerId,
        status: {
        $in: ["pending", "accepted", "in_progress"]
        },
        scheduledAt: {
            $lt: newBookingEnd
        }
        
        
    });
    // console.log("Existing Bookings Found:", existingBookings.length);

    const hasConflict = existingBookings.some((booking) => {
        const existingStart = new Date(booking.scheduledAt);

        const existingEnd = new Date(
            existingStart.getTime() + booking.duration * 60 * 1000
        );

        const overlap =
        newBookingStart < existingEnd &&
        newBookingEnd > existingStart;

    //     console.log({
    //     existingStart,
    //     existingEnd,
    //     existingStatus: booking.status,
    //     overlap 
    // });

        return overlap;
               
    });

    // console.log("Has Conflict:", hasConflict);

    if (hasConflict) {
        throw new Error("Worker is already booked during this time");
    }

    // 7. Create booking
    const booking = await Booking.create({
        customerId,
        workerId,
        serviceId,
        skillName: skill.name,
        quantity,
        scheduledAt,
        duration: bookingDuration,
        priceType: service.priceType,
        address,
        location,
        price
    });

    return {
        message: "Booking created successfully",
        booking
    };
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

const getBookingEnd = (booking) => {
    return new Date(
        new Date(booking.scheduledAt).getTime() +
        booking.duration * 60 * 1000
    );
};

const isBookingOverlapping = (bookingA, bookingB) => {
    const startA = new Date(bookingA.scheduledAt);
    const endA = getBookingEnd(bookingA);

    const startB = new Date(bookingB.scheduledAt);
    const endB = getBookingEnd(bookingB);

    return startA < endB && endA > startB;
};

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
        currentBooking.paymentStatus = "awaiting";

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

    booking.serviceCompletedAt = new Date();
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