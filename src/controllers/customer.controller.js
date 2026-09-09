const customerService = require("../services/customer.service");

const {
    validateCustomerProfile
} = require("../validator/customer.validator");


const createCustomerProfile = async (req, res) => {
    try {
        validateCustomerProfile(req.body);

        const result = await customerService.createCustomerProfile({
            userId: req.user._id,
            phone: req.body.phone,
            address: req.body.address,
            location: req.body.location
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


const getCustomerProfile = async (req, res) => {
    try {
        const result = await customerService.getCustomerProfile(
            req.user._id
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};


const updateCustomerProfile = async (req, res) => {
    try {
        validateCustomerProfile(req.body);

        const result = await customerService.updateCustomerProfile(
            req.user._id,
            req.body
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


module.exports = {
    createCustomerProfile,
    getCustomerProfile,
    updateCustomerProfile
};