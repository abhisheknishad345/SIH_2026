const serviceService = require("../services/service.service");
const { validateService } = require("../validator/service.validator");

const createPaidService = async (req, res) => {

    try {

        validateService(req.body);

        const {
            name,
            description,
            category,
            price,
            priceType
        } = req.body;

        const service = await serviceService.createPaidService({
            adminId: req.user._id,
            name,
            description,
            category,
            price,
            priceType
        });

        res.status(201).json({
            message: "Paid Service created successfully",
            service
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

const createService = async (req, res) => {

    try {

        validateService(req.body);

        const {
            name,
            description,
            category,
        } = req.body;

        const service = await serviceService.createService({
            adminId: req.user._id,
            name,
            description,
            category
        });

        res.status(201).json({
            message: "Service created successfully",
            service
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

const getActiveServices = async (req, res) => {

    try {

        const services = await serviceService.getActiveServices();

        res.status(200).json({
            message: "Services fetched successfully",
            services
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getServiceWorkers = async (req, res) => {

    try {

        const { serviceId } = req.params;

        const workers = await serviceService.getServiceWorkers({
            serviceId
        });

        res.status(200).json({
            message: "Service workers fetched successfully",
            workers
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};




module.exports = {
    createPaidService, createService, getActiveServices, getServiceWorkers
};