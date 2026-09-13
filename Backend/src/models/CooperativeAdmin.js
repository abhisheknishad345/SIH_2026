const mongoose = require("mongoose");

const cooperativeAdminSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        cooperativeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cooperative",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const CooperativeAdmin = mongoose.model(
    "CooperativeAdmin",
    cooperativeAdminSchema
);

module.exports = CooperativeAdmin;