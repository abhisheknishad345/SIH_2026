
const CommunityService = require("../models/CommunityService");
const CooperativeAdmin = require("../models/CooperativeAdmin");
const Cooperative = require("../models/Cooperative");
const Worker = require("../models/Worker");



const createCommunityService = async ({
    adminId,
    cooperativeId,
    title,
    description,
    category,
    skillName,
    scheduledAt,
    duration,
    location,
    address
}) => {

    // Check whether admin belongs to this cooperative

    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
        throw new Error("Cooperative not found");

    }

    const matchingWorker = await Worker.findOne({
        category: category,
        isVerified: true,
        "skills.name": {
            $regex: `^${skillName}$`,
            $options: "i"
        }
    });

    if (!matchingWorker) {
        throw new Error(
            "No verified worker is available for this category and skill"
        );
    }

    const admin = await CooperativeAdmin.findOne({
        userId: adminId,
        cooperativeId,
        isActive: true
    });

    if (!admin) {
        throw new Error(
            "You are not authorized to create a service for this cooperative"
        );
    }

    const communityService = await CommunityService.create({
        cooperativeId,
        createdBy: adminId,
        title,
        description,
        category,
        skillName,
        scheduledAt,
        duration,
        location,
        address
    });

    return {
        message: "Community service created successfully",
        communityService
    };
};

const getAvailableCommunityServices = async ({ workerId }) => {

    const worker = await Worker.findOne({ userId: workerId });

    if (!worker) {
        throw new Error("Worker profile not found");
    }

    if (!worker.isVerified) {
        throw new Error("Worker is not verified");
    }

    if (!worker.isAvailable) {
        throw new Error("Worker is currently unavailable");
    }

    const skillNames = worker.skills.map(skill => skill.name);

    const services = await CommunityService.find({
        cooperativeId: worker.cooperativeId,
        category: {
            $regex: `^${worker.category}$`,
            $options: "i"
        },
        skillName: {
            $in: skillNames.map(skill =>
                new RegExp(`^${skill}$`, "i")
            )
        },
        status: "open",
        scheduledAt: { $gte: new Date() }
    }).sort({ scheduledAt: 1 });

    return services;
};

module.exports = {
    createCommunityService,
    getAvailableCommunityServices
};