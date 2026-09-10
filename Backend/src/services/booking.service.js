
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

    switch (skill.priceType) {

        case "per_hour":
            price = skill.price * quantity;
            break;

        case "per_day":
            price = skill.price * quantity;
            break;

        case "per_visit":
            price = skill.price;
            break;

        case "fixed":
            price = skill.price;
            break;

        default:
            throw new Error("Invalid skill price type");
    }

    // 7. Create booking
    const booking = await Booking.create({
        customerId,
        workerId,
        serviceId,
        skillName: skill.name,
        quantity,
        scheduledAt,
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

    // Sirf pending booking ko accept/reject kar sakte hain
    if (booking.status !== "pending") {
        throw new Error(
            "Only pending bookings can be accepted or rejected"
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

module.exports = {
    createBooking, getWorkerBookings, updateBookingStatus, getCustomerBookings
};