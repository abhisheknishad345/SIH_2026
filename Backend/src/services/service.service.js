
const Service = require("../models/Service");
const CooperativeAdmin = require("../models/CooperativeAdmin");
const mongoose = require("mongoose")
const Worker = require("../models/Worker");
const { getWorkerRatingSummary } = require("./rating.service");

const createService = async ({
    adminId,
    name,
    description,
    category,
    price,
    priceType
}) => {

    const admin = await CooperativeAdmin.findOne({
        userId: adminId,
        isActive: true
    });

    if (!admin) {
        throw new Error("Cooperative admin not found");
    }

    const existingService = await Service.findOne({
        cooperativeId: admin.cooperativeId,
        name: name.trim()
    });

    if (existingService) {
        throw new Error("Service already exists");
    }

    const serviceData = {
        cooperativeId: admin.cooperativeId,
        createdBy: adminId,
        name: name.trim(),
        description,
        category: category.trim()
    };

    // Add pricing only when provided
    if (price !== undefined && price !== null) {
        serviceData.price = price;
        serviceData.priceType = priceType;
    }

    const service = await Service.create(serviceData);

    return {
        message: "Service created successfully",
        service
    };
};



const getActiveServices = async ({ cooperativeId, category } = {}) => {

    const query = {
        isActive: true
    };

    // Apply filters only when supplied
    if (cooperativeId) {
        if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
            throw new Error("Invalid cooperative ID");
        }

        query.cooperativeId = cooperativeId;
    }

    if (category !== undefined) {
        if (typeof category !== "string" || !category.trim()) {
            throw new Error("Invalid category");
        }

        query.category = category.trim();
    }

    const services = await Service.find(query)
        .populate("cooperativeId", "name registrationNumber")
        .sort({ name: 1 });

    return services;
};


const getServiceCategories = async (cooperativeId) => {

    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        throw new Error("Invalid cooperative ID");
    }

    const categories = await Service.distinct("category", {
        cooperativeId,
        isActive: true
    });

    return categories.sort((a, b) => a.localeCompare(b));
};



const getAllServices = async () => {
    const services = await Service.find({
        isActive: true
    }).sort({
        name: 1
    });

    return {
        services
    };
};


const getServiceById = async (serviceId) => {
    const service = await Service.findOne({
        _id: serviceId,
        isActive: true
    });

    if (!service) {
        throw new Error("Service not found");
    }

    return {
        service
    };
};


const updateService = async (
    serviceId,
    updateData
) => {
    const service = await Service.findById(serviceId);

    if (!service) {
        throw new Error("Service not found");
    }

    const allowedFields = [
        "name",
        "description",
        "category",
        "isActive"
    ];

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            service[field] = updateData[field];
        }
    });

    await service.save();

    return {
        message: "Service updated successfully",
        service
    };
};

const getServiceWorkers = async ({ serviceId }) => {

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new Error("Invalid service ID");
    }

    const service = await Service.findOne({
        _id: serviceId,
        isActive: true
    });

    if (!service) {
        throw new Error("Service not found or inactive");
    }

    const workers = await Worker.find({
        cooperativeId: service.cooperativeId,
        "skills.serviceId": service._id,
        isVerified: true,
        isAvailable: true
    }).populate("userId", "fullName email");

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

    return workers.map(worker => {

        const rating = ratingMap.get(
            worker.userId._id.toString()
        );

        const matchedSkill = worker.skills.find(
            skill => skill.serviceId.toString() === service._id.toString()
        );

        return {
            workerId: worker._id,
            userId: worker.userId._id,
            fullName: worker.userId.fullName,
            category: worker.category,
            skill: matchedSkill,
            skills: [matchedSkill],
            averageRating: rating?.averageRating || 0,
            totalRatings: rating?.totalRatings || 0
        };
    });

}





module.exports = {
    createService, getServiceCategories,
    getAllServices,
    getServiceById,
    updateService,
    getActiveServices,
    getServiceWorkers
};