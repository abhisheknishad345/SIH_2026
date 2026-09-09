const Worker = require("../models/Worker");

const createWorkerProfile = async ({
    userId,
    category,
    skills,
    experience,
    certifications,
    location,
    
}) => {

    // Check if worker profile already exists
    const existingWorker = await Worker.findOne({ userId });

    if (existingWorker) {
        throw new Error("Worker profile already exists");
    }

    const worker = await Worker.create({
        userId,
        category,
        skills,
        experience,
        certifications,
        location
    });

    return {
        message: "Worker profile created successfully",
        worker
    };
};

const getWorkerProfile = async (userId) => {
    const worker = await Worker.findOne({ userId });

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
        "skills",
        "experience",
        "certifications",
        "location",
        "isAvailable"
    ];

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            worker[field] = updateData[field];
        }
    });

    await worker.save();

    return {
        message: "Worker profile updated successfully",
        worker
    };
};

const getNearbyWorkers = async ({
    longitude,
    latitude,
    maxDistance,
    skill,
    category
}) => {
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

    return {
        workers
    };
};


module.exports = {
    createWorkerProfile, getWorkerProfile, updateWorkerProfile, getNearbyWorkers
};