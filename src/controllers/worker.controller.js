const workerService = require("../services/worker.service");
const {
    validateWorkerProfile, validateWorkerProfileUpdate
} = require("../validator/worker.validator");

const createWorkerProfile = async (req, res) => {
    try {
         validateWorkerProfile(req.body);
        const result = await workerService.createWorkerProfile({
            userId: req.user._id,
            category: req.body.category,
            skills: req.body.skills,
            experience: req.body.experience,
            certifications: req.body.certifications,
            location: req.body.location
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getWorkerProfile = async (req, res) => {
    try {
        const result = await workerService.getWorkerProfile(
            req.user._id
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateWorkerProfile = async (req, res) => {
    try {
        validateWorkerProfileUpdate(req.body);
        const result = await workerService.updateWorkerProfile(
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

const getNearbyWorkers = async (req, res) => {
    try {
        const longitude = Number(req.query.longitude);
        const latitude = Number(req.query.latitude);
        const maxDistance = Number(req.query.maxDistance);
        const skill = req.query.skill;

        const result = await workerService.getNearbyWorkers({
            longitude,
            latitude,
            maxDistance,
            skill
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


module.exports = {
    createWorkerProfile, getWorkerProfile, updateWorkerProfile, getNearbyWorkers
};