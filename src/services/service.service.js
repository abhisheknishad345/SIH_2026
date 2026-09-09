const Service = require("../models/Service");

const createService = async ({
    name,
    description,
    category
}) => {
    const existingService = await Service.findOne({
        name: name.trim()
    });

    if (existingService) {
        throw new Error("Service already exists");
    }

    const service = await Service.create({
        name: name.trim(),
        description,
        category: category.trim()
    });

    return {
        message: "Service created successfully",
        service
    };
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


module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService
};