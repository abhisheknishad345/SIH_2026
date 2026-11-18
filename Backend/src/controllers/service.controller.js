const serviceService = require("../services/service.service");
const { validateService } = require("../validator/service.validator");

const createService = async (req, res) => {

    try {

        validateService(req.body);

        const { name, description, category } = req.body;

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
        const { latitude, longitude, radiusKm } = req.query;

        let parsedLatitude;
        let parsedLongitude;
        let parsedRadius;

        if (latitude !== undefined || longitude !== undefined) {
            parsedLatitude = Number(latitude);
            parsedLongitude = Number(longitude);

            if (
                !Number.isFinite(parsedLatitude) ||
                !Number.isFinite(parsedLongitude) ||
                parsedLatitude < -90 ||
                parsedLatitude > 90 ||
                parsedLongitude < -180 ||
                parsedLongitude > 180
            ) {
                return res.status(400).json({
                    message: "Invalid customer location"
                });
            }
        }

        if (radiusKm !== undefined) {
            parsedRadius = Number(radiusKm);

            if (![1, 2, 4, 6, 8, 10, 50].includes(parsedRadius)) {
                return res.status(400).json({
                    message: "Radius must between 1 or 50 KM"
                });
            }

            if (parsedLatitude === undefined || parsedLongitude === undefined) {
                return res.status(400).json({
                    message: "Customer location is required for radius filter"
                });
            }
        }

        const workers = await serviceService.getServiceWorkers({
            serviceId,
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            radiusKm: parsedRadius
        });

        return res.status(200).json({
            message: "Service workers fetched successfully",
            workers
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};





module.exports = {
    createService,
    getActiveServices, getServiceWorkers,
    getServiceCategories
};