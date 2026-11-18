
const Service = require("../models/Service");
const CooperativeAdmin = require("../models/CooperativeAdmin");
const mongoose = require("mongoose")
const Worker = require("../models/Worker");
const { getWorkerRatingSummary } = require("./rating.service");

const createService = async ({
    adminId,
    name,
    description,
    category
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


const getServiceWorkers = async ({ serviceId, latitude, longitude, radiusKm }) => {
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

    const hasLocation =
        latitude !== undefined &&
        longitude !== undefined;

    const workers = await Worker.find({
        cooperativeId: service.cooperativeId,
        "skills.serviceId": service._id,
        isVerified: true,
        isAvailable: true
    }).populate("userId", "fullName email");

    // Haversine formula: distance between two GPS coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (degree) => degree * (Math.PI / 180);
        const earthRadiusKm = 6371;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadiusKm * c;
    };

    let workerResults = workers.map(worker => {
        const rating = null;

        const matchedSkill = worker.skills.find(
            skill => skill.serviceId.toString() === service._id.toString()
        );

        let distanceKm = null;

        if (
            hasLocation &&
            worker.location?.coordinates?.length === 2
        ) {
            const [workerLongitude, workerLatitude] =
                worker.location.coordinates;

            distanceKm = calculateDistance(
                Number(latitude),
                Number(longitude),
                workerLatitude,
                workerLongitude
            );
        }

        return {
            workerId: worker._id,
            userId: worker.userId?._id,
            fullName: worker.userId?.fullName || "Worker",
            category: worker.category,
            shopName: worker.shopName || "",
            shopAddress: worker.shopAddress || "",
            skill: matchedSkill,
            skills: worker.skills,
            certifications: worker.certifications || [],
            workingHours: worker.workingHours || [],
            isVerified: worker.isVerified,
            isAvailable: worker.isAvailable,
            distanceKm
        };
    });

    // Apply radius filter only when customer selects 1 KM or 2 KM
    if (hasLocation && radiusKm !== undefined) {
        workerResults = workerResults.filter(
            worker =>
                worker.distanceKm !== null &&
                worker.distanceKm <= Number(radiusKm)
        );
    }

    // Nearest workers first when customer location is available
    if (hasLocation) {
        workerResults.sort((a, b) => {
            if (a.distanceKm === null) return 1;
            if (b.distanceKm === null) return -1;
            return a.distanceKm - b.distanceKm;
        });
    }

    const workerIds = workers.map(worker => worker.userId?._id).filter(Boolean);
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

    return workerResults.map(worker => {
        const rating = ratingMap.get(worker.userId?.toString());

        return {
            ...worker,
            averageRating: rating?.averageRating || 0,
            totalRatings: rating?.totalRatings || 0
        };
    });
};





module.exports = {
    createService, getServiceCategories,
    getAllServices,
    getServiceById,
    updateService,
    getActiveServices,
    getServiceWorkers
};