
const Cooperative = require("../models/Cooperative");

const createCooperative = async ({
    name,
    registrationNumber,
    contactEmail,
    contactPhone,
    address,
    location
}) => {
    const existingCooperative = await Cooperative.findOne({
        registrationNumber: registrationNumber.trim()
    });

    if (existingCooperative) {
        throw new Error(
            "Cooperative with this registration number already exists"
        );
    }

    const cooperative = await Cooperative.create({
        name: name.trim(),
        registrationNumber: registrationNumber.trim(),
        contactEmail: contactEmail.toLowerCase().trim(),
        contactPhone,
        address: address.trim(),
        location
    });

    return {
        message: "Cooperative created successfully",
        cooperative
    };
};


const getAllCooperatives = async () => {
    const cooperatives = await Cooperative.find({
        isActive: true
    }).sort({
        name: 1
    });

    return {
        cooperatives
    };
};

const getCooperativeById = async (cooperativeId) => {
    const cooperative = await Cooperative.findOne({
        _id: cooperativeId,
        isActive: true
    });

    if (!cooperative) {
        throw new Error("Cooperative not found");
    }

    return {
        cooperative
    };
}; 

/*
const getCooperativeById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid cooperative ID"
            });
        }

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
*/

const updateCooperative = async (
    cooperativeId,
    updateData
) => {
    const cooperative = await Cooperative.findById(
        cooperativeId
    );

    if (!cooperative) {
        throw new Error("Cooperative not found");
    }

    const allowedFields = [
        "name",
        "contactEmail",
        "contactPhone",
        "address",
        "location",
        "isActive"
    ];

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            cooperative[field] = updateData[field];
        }
    });

    await cooperative.save();

    return {
        message: "Cooperative updated successfully",
        cooperative
    };
};


module.exports = {
    createCooperative,
    getAllCooperatives,
    getCooperativeById,
    updateCooperative
};