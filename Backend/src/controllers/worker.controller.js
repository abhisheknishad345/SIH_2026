const workerService = require("../services/worker.service");
const {
    validateWorkerProfile, validateWorkerProfileUpdate
} = require("../validator/worker.validator");

const Worker = require("../models/Worker");

const createWorkerProfile = async (req, res) => {
    try {
        validateWorkerProfile(req.body);
        const result = await workerService.createWorkerProfile({
            userId: req.user._id,
            cooperativeId: req.body.cooperativeId,
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
        const {
            skill,
            category
        } = req.query;
        
        const maxDistance = Number(req.query.maxDistance);

        if (!Number.isFinite(maxDistance) || maxDistance <= 0) {
            return res.status(400).json({
                message: "maxDistance must be a positive number"
            });
        }

        const result = await workerService.getNearbyWorkers({
            customerId: req.user._id,
            maxDistance,
            skill,
            category
        });

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getPendingWorkers = async (req, res) => {

    try {

        const workers = await workerService.getPendingWorkers(req.user._id);

        res.status(200).json({
            message: "Pending workers fetched successfully",
            workers
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

const verifyWorker = async (req, res) => {

    try {

        const { workerId } = req.params;

        const worker = await workerService.verifyWorker({
            adminId: req.user._id,
            workerId
        });

        res.status(200).json({
            message: "Worker verified successfully",
            worker
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

const rejectWorker = async (req, res) => {

    try {

        const { workerId } = req.params;

        const worker = await workerService.rejectWorker({
            adminId: req.user._id,
            workerId
        });

        res.status(200).json({
            message: "Worker rejected successfully",
            worker
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

const updateWorkerAvailability = async (req, res) => {
    try {

        const { isAvailable } = req.body;

        const result = await workerService.updateWorkerAvailability(
            req.user._id,
            isAvailable
        );

        res.status(200).json(result);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};




module.exports = {
    createWorkerProfile, getWorkerProfile, updateWorkerProfile,
    getNearbyWorkers, getPendingWorkers, verifyWorker, rejectWorker,
    updateWorkerAvailability
};