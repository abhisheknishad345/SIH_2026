const mongoose = require("mongoose");

const cooperativeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        contactEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        contactPhone: {
            type: String,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number]
            }
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

cooperativeSchema.index({ location: "2dsphere" });

const Cooperative = mongoose.model(
    "Cooperative",
    cooperativeSchema
);

module.exports = Cooperative;