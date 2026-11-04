const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const mongoose = require("mongoose");
const Cooperative = require("../models/Cooperative");
const { getWorkerRatingSummary } = require("./rating.service");
const CooperativeAdmin = require("../models/CooperativeAdmin");

const createWorkerProfile = async ({
    userId,
    cooperativeId,
    category,
    skills,
    experience,
    certifications,
    location,
    workingHours

}) => {

    // Check if worker profile already exists
    const existingWorker = await Worker.findOne({ userId });
    const cooperative = await Cooperative.findById(cooperativeId);

    if (!cooperative) {
        throw new Error("Cooperative not found");
    }

    if (!cooperative.isActive) {
        throw new Error("Cooperative is not active");
    }

    if (existingWorker) {
        throw new Error("Worker profile already exists");
    }

    workingHours = workingHours.map((item) => ({
        day: item.day,
        isWorking: item.isWorking,
        startTime: item.startTime,
        endTime: item.endTime
    }));

    const worker = await Worker.create({
        userId,
        cooperativeId,
        category,
        skills,
        experience,
        certifications,
        location,
        workingHours
    });

    return {
        message: "Worker profile created successfully",
        worker
    };
};

const getWorkerProfile = async (userId) => {
    const worker = await Worker.findOne({ userId })
        .populate("userId", "fullName email role")
        .populate("cooperativeId", "name registrationNumber contactEmail contactPhone address");

    if (!worker) {
        throw new Error("Worker profile not found");
    }

    return {
        worker
    };
};

const updateWorkerProfile = async (userId, updateData) => {
    const worker = await Worker.findOne({ userId });

    if (!worker) {
        throw new Error("Worker profile not found");
    }


    const allowedFields = [
        "cooperativeId",
        "category",
        "skills",
        "experience",
        "certifications",
        "workingHours",
        "location",
    ];

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            worker[field] = updateData[field];
        }
    });

    if (updateData.workingHours !== undefined) {
        worker.workingHours = updateData.workingHours.map((item) => ({
            day: item.day,
            isWorking: item.isWorking,
            startTime: item.startTime,
            endTime: item.endTime
        }));
    }

    await worker.save();

    return {
        message: "Worker profile updated successfully",
        worker
    };
};

const resubmitWorkerProfile = async (userId) => {
    const worker = await Worker.findOne({ userId });

    if (!worker) {
        throw new Error("Worker profile not found");
    }

    if (worker.verificationStatus !== "rejected") {
        throw new Error("Only rejected profiles can be resubmitted");
    }

    worker.verificationStatus = "pending";

    await worker.save();

    return {
        message: "Profile resubmitted for verification",
        worker
    };
};

const getNearbyWorkers = async ({
    customerId,
    maxDistance,
    skill,
    category
}) => {

    const customer = await Customer.findOne({ userId: customerId });

    if (!customer || !customer.location?.coordinates) {
        throw new Error("Customer location not found");
    }

    const [longitude, latitude] = customer.location.coordinates;

    const query = {
        isVerified: true,
        isAvailable: true,
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance
            }
        }
    };

    if (skill) {
        query["skills.name"] = {
            $regex: new RegExp(`^${skill}$`, "i")
        };
    }

    if (category) {
        query.category = {
            $regex: new RegExp(`^${category}$`, "i")
        };
    }

    const workers = await Worker.find(query)
        .populate("userId", "fullName email");

    const workerIds = workers.map(worker => worker.userId._id);

    const ratingSummaries = await getWorkerRatingSummary(workerIds);
    const ratingMap = new Map(
        ratingSummaries.map(item => [
            item._id.toString(),
            {
                averageRating: Number(item.averageRating.toFixed(1)),
                totalRatings: item.totalRatings
            }
        ])
    );

    const workersWithRatings = workers.map(worker => {
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;

            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) *
                Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        };

        const rating = ratingMap.get(worker.userId._id.toString());

        const [workerLongitude, workerLatitude] = worker.location.coordinates;

        const distance = calculateDistance(
            latitude,
            longitude,
            workerLatitude,
            workerLongitude
        );

        return {
            workerId: worker._id,
            userId: worker.userId._id,
            fullName: worker.userId.fullName,
            category: worker.category,
            skills: worker.skills,
            experience: worker.experience,
            averageRating: rating?.averageRating || 0,
            totalRatings: rating?.totalRatings || 0,
            distance: Number(distance.toFixed(2))
        };
    });

    return {
        workers: workersWithRatings
    };
};

const getPendingWorkers = async (adminId) => {

    const admin = await CooperativeAdmin.findOne({
        userId: adminId,
        isActive: true
    });

    // console.log("ADMIN:", admin);

    if (!admin) {
        throw new Error("Cooperative admin not found");
    }

    // console.log("ADMIN COOPERATIVE ID:", admin.cooperativeId);

    const workers = await Worker.find({
        cooperativeId: admin.cooperativeId,
        verificationStatus: "pending"
    })
        .populate("userId", "fullName email")
        .populate("cooperativeId", "name registrationNumber");

    // console.log("PENDING WORKERS:", workers);


    return workers;
};

const verifyWorker = async ({ adminId, workerId }) => {

    const admin = await CooperativeAdmin.findOne({
        userId: adminId,
        isActive: true
    });

    if (!admin) {
        throw new Error("Cooperative admin not found");
    }

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
        throw new Error("Invalid worker ID");
    }

    const worker = await Worker.findOne({
        _id: workerId,
        cooperativeId: admin.cooperativeId
    });

    if (!worker) {
        throw new Error("Worker not found in your cooperative");

    }

    if (worker.isVerified) {
        throw new Error("Worker is already verified");
    }

    if (worker.verificationStatus === "approved") {
        throw new Error("Worker is already verified");
    }

    if (worker.verificationStatus === "rejected") {
        throw new Error("Rejected worker cannot be approved directly");
    }

    worker.isVerified = true;
    worker.verificationStatus = "approved";

    await worker.save();

    return worker;
};

const rejectWorker = async ({ adminId, workerId }) => {

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
        throw new Error("Invalid worker ID");
    }

    const admin = await CooperativeAdmin.findOne({
        userId: adminId,
        isActive: true
    });

    if (!admin) {
        throw new Error("Cooperative admin not found");
    }

    const worker = await Worker.findOne({
        _id: workerId,
        cooperativeId: admin.cooperativeId
    });

    if (!worker) {
        throw new Error("Worker not found in your cooperative");
    }

    if (worker.verificationStatus === "approved") {
        throw new Error("Approved worker cannot be rejected");
    }

    if (worker.verificationStatus === "rejected") {
        throw new Error("Worker is already rejected");
    }

    worker.isVerified = false;
    worker.verificationStatus = "rejected";

    await worker.save();

    return worker;
};


const updateWorkerAvailability = async (userId, isAvailable) => {

    const worker = await Worker.findOne({ userId });

    if (!worker) {
        throw new Error("Worker profile not found");
    }

    if (typeof isAvailable !== "boolean") {
        throw new Error("isAvailable must be a boolean");
    }

    // Only approved workers can become available
    if (!worker.isVerified || worker.verificationStatus !== "approved") {
        throw new Error("Your account is not verified yet");
    }

    worker.isAvailable = isAvailable;

    await worker.save();

    return {
        message: "Availability updated successfully",
        isAvailable: worker.isAvailable
    };
};

const updateWorkerSchedule = async (userId, workingHours) => {
    const worker = await Worker.findOne({ userId });

    if (!worker) {
        throw new Error("Worker profile not found");
    }

    if (!Array.isArray(workingHours)) {
        throw new Error("workingHours must be an array");
    }

    const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    const seenDays = new Set();

    for (const schedule of workingHours) {
        const { day, isWorking, startTime, endTime } = schedule;

        if (!validDays.includes(day)) {
            throw new Error(`Invalid day: ${day}`);
        }

        if (seenDays.has(day)) {
            throw new Error(`Duplicate schedule for ${day}`);
        }

        seenDays.add(day);

        if (typeof isWorking !== "boolean") {
            throw new Error(`isWorking must be boolean for ${day}`);
        }

        if (isWorking) {
            const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

            if (
                !timeRegex.test(startTime) ||
                !timeRegex.test(endTime)
            ) {
                throw new Error(`Invalid time format for ${day}. Use HH:mm`);
            }

            if (startTime >= endTime) {
                throw new Error(`Start time must be before end time for ${day}`);
            }
        }
    }

    worker.workingHours = workingHours;

    await worker.save();

    return {
        message: "Working hours updated successfully",
        workingHours: worker.workingHours
    };
};

const getWorkerSchedule = async (userId) => {
    const worker = await Worker.findOne({ userId })
        .select("isAvailable workingHours");

    if (!worker) {
        throw new Error("Worker profile not found");
    }

    return {
        isAvailable: worker.isAvailable,
        workingHours: worker.workingHours
    };
};


module.exports = {
    createWorkerProfile, getWorkerProfile, updateWorkerProfile, updateWorkerSchedule,
    getNearbyWorkers, getPendingWorkers, verifyWorker, rejectWorker, updateWorkerAvailability,
    getWorkerSchedule, resubmitWorkerProfile
};