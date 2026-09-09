const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            maxlength: 100
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

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;