const cooperativeService = require("../services/cooperative.service");

const {
    validateCooperative
} = require("../validator/cooperative.validator");


const createCooperative = async (req, res) => {
    try {
        validateCooperative(req.body);

        const result = await cooperativeService.createCooperative(
            req.body
        );

        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


const getAllCooperatives = async (req, res) => {
    try {
        const result =
            await cooperativeService.getAllCooperatives();

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getCooperativeById = async (req, res) => {
    try {
        const result =
            await cooperativeService.getCooperativeById(
                req.params.id
            );

        res.status(200).json(result);

    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};


module.exports = {
    createCooperative,
    getAllCooperatives,
    getCooperativeById
};