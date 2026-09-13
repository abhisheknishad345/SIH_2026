const cooperativeAdminService = require("../services/cooperative-admin.service");
const adminBootstrapService = require("../services/admin-bootstrap.service");
const {
    validateBootstrapAdmin
} = require("../validator/admin-bootstrap.validator");

const { validateCooperativeAdmin } = require("../validator/cooperative-admin.validator");


const createCooperativeAdmin = async (req, res) => {
    try {
            validateCooperativeAdmin(req.body);
        const {
            fullName,
            email,
            cooperativeId
        } = req.body;

        const result =
            await cooperativeAdminService.createCooperativeAdmin({
                fullName,
                email,
                cooperativeId
            });

        res.status(201).json(result);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};


const createBootstrapAdmin = async (req, res) => {
    try {
        validateBootstrapAdmin(req.body);

        const {
            fullName,
            email,
            password,
            cooperativeId
        } = req.body;

        const result =
            await adminBootstrapService.createBootstrapAdmin({
                fullName,
                email,
                password,
                cooperativeId
            });

        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


module.exports = {
    createCooperativeAdmin,
    createBootstrapAdmin
};