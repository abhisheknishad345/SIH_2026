const serviceService = require("../services/service.service");
const { validateService } = require("../validator/service.validator");

const createService = async (req, res) => {

    try {

        validateService(req.body);

        const {
            name,
            description,
            category,
            price,
            priceType
        } = req.body;

        const service = await serviceService.createService({
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


const getServiceCategories = async (req, res) => {

    try {
        const { cooperativeId } = req.query;

        const categories = await serviceService.getServiceCategories(
            cooperativeId
        );

        res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};




const getActiveServices = async (req, res) => {

    try {
        const { cooperativeId, category } = req.query;

        const services = await serviceService.getActiveServices({
            cooperativeId,
            category
        });

        res.status(200).json({
            message: "Services fetched successfully",
            services
        });

    } catch (error) {
        res.status(400).json({
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
    createService,
    getActiveServices, getServiceWorkers,
    getServiceCategories
};