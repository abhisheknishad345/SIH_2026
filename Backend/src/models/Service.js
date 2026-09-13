const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        cooperativeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cooperative",
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },

        priceType: {
            type: String,
            enum: ["per_hour", "per_visit", "per_day", "fixed"],
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

serviceSchema.index(
    { cooperativeId: 1, name: 1 },
    { unique: true }
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;