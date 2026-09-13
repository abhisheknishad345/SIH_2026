
const Booking = require("../models/Booking");
const Worker = require("../models/Worker");
const Service = require("../models/Service");

const createBooking = async ({
    customerId,
    workerId,
    serviceId,
    skillName,
    quantity,
    scheduledAt,
    duration,
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
        (item) =>
            item.name.toLowerCase() ===
            skillName.trim().toLowerCase()
    );

    if (!skill) {
        throw new Error(
            "Selected skill is not offered by this worker"
        );
    }

    // 6. Calculate price on backend
    let price;

    switch (service.priceType) {

        case "per_hour":
            price = service.price * quantity;
            break;

        case "per_day":
            price = service.price * quantity;
            break;

        case "per_visit":
            price = service.price * quantity;
            break;

        case "fixed":
            price = service.price;
            break;

        default:
            throw new Error("Invalid service price type");
    }

    const newBookingStart = new Date(scheduledAt);
    const newBookingEnd = new Date(
        newBookingStart.getTime() + duration * 60 * 1000
    );

    const existingBookings = await Booking.find({
        workerId,
        status: {
            $in: ["pending", "accepted"]
        }
    });

    const hasConflict = existingBookings.some((booking) => {
        const existingStart = new Date(booking.scheduledAt);

        const existingEnd = new Date(
            existingStart.getTime() + booking.duration * 60 * 1000
        );

        return (
            newBookingStart < existingEnd &&
            newBookingEnd > existingStart
        );
    });

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
        duration,
        address,
        location,
        price
    });

    return {
        message: "Booking created successfully",
        booking
    };
};

const getWorkerBookings = async (workerId) => {
    const bookings = await Booking.find({
        workerId
    })
        .populate("customerId", "fullName email")
        .populate("serviceId", "name category")
        .sort({ createdAt: -1 });

    return {
        bookings
    };
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

    // Check: kya ye booking isi worker ki hai?
    if (booking.workerId.toString() !== workerId.toString()) {
        throw new Error(
            "You are not allowed to update this booking"
        );
    }

    // Pending → accepted/rejected
    if (booking.status === "pending") {
        if (status !== "accepted" && status !== "rejected") {
            throw new Error(
                "Pending booking can only be accepted or rejected"
            );
        }
    }

    // Accepted → completed
    else if (booking.status === "accepted") {
        if (status !== "completed") {
            throw new Error(
                "Accepted booking can only be completed"
            );
        }
    }

    // Baaki statuses se koi update allowed nahi
    else {
        throw new Error(
            `Booking cannot be updated from ${booking.status} status`
        );
    }

    booking.status = status;

    await booking.save();

    return {
        message: `Booking ${status} successfully`,
        booking
    };
};

const getCustomerBookings = async (customerId) => {
    const bookings = await Booking.find({
        customerId
    })
        .populate("workerId", "fullName email")
        .populate("serviceId", "name category")
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

    // Sirf accepted booking complete ho sakti hai
    if (booking.status !== "accepted") {
        throw new Error(
            "Only accepted bookings can be completed"
        );
    }

    booking.status = "completed";

    await booking.save();

    return {
        message: "Booking completed successfully",
        booking
    };
};


module.exports = {
    createBooking, getWorkerBookings, updateBookingStatus, getCustomerBookings, cancelBooking
    , completeBooking
};