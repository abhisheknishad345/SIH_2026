const Customer = require("../models/Customer");

const createCustomerProfile = async ({
    userId,
    phone,
    address,
    location
}) => {
    const existingCustomer = await Customer.findOne({ userId });

    if (existingCustomer) {
        throw new Error("Customer profile already exists");
    }

    const customer = await Customer.create({
        userId,
        phone,
        address,
        location
    });

    return {
        message: "Customer profile created successfully",
        customer
    };
};

const getCustomerProfile = async (userId) => {
    const customer = await Customer.findOne({ userId });

    if (!customer) {
        throw new Error("Customer profile not found");
    }

    return {
        customer
    };
};

const updateCustomerProfile = async (userId, updateData) => {
    const customer = await Customer.findOne({ userId });

    if (!customer) {
        throw new Error("Customer profile not found");
    }

    const allowedFields = [
        "phone",
        "address",
        "location"
    ];

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            customer[field] = updateData[field];
        }
    });

    await customer.save();

    return {
        message: "Customer profile updated successfully",
        customer
    };
};

module.exports = {
    createCustomerProfile,
    getCustomerProfile,
    updateCustomerProfile
};