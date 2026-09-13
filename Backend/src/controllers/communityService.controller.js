
const  communityServiceService = require("../services/communityService.service");
const { validateCommunityService } = require("../validator/communityService.validator");

const createCommunityService = async (req, res) => {
    try {

        validateCommunityService(req.body);

        const {
            cooperativeId,
            title,
            description,
            category,
            skillName,
            scheduledAt,
            duration,
            location,
            address
        } = req.body;

        const result = await communityServiceService.createCommunityService({
            adminId: req.user._id,
            cooperativeId,
            title,
            description,
            category,
            skillName,
            scheduledAt,
            duration,
            location,
            address
        });

        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getAvailableCommunityServices = async (req, res) => {

    try {

        const result =
            await communityServiceService.getAvailableCommunityServices({
                workerId: req.user._id
            });

        res.status(200).json({
            message: "Available community services fetched successfully",
            communityServices: result
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    createCommunityService, getAvailableCommunityServices
};