const superAdminBootstrapService = require("../services/super-admin-bootstrap.service");

const { validateSuperAdmin } = require("../validator/super-admin-bootstrap.validator");

const createSuperAdmin = async (req, res) => {
    try {

        
        validateSuperAdmin(req.body)
        const { fullName, email, password } = req.body;

        const result = await superAdminBootstrapService.createSuperAdmin({
            fullName,
            email,
            password
        });

        res.status(201).json(result);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

module.exports = {
    createSuperAdmin
};