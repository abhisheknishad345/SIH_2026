const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        category: {
            type: String,
            required: true,
            trim: true,
            enum: [
                "Plumber",
                "Electrician",
                "Carpenter",
                "Painter",
                "Cleaner",
                "Gardener",
                "Driver",
                "Caregiver",
                "Technician"
            ]
        },

        skills: {
            type: [
                {
                    name: {
                        type: String,
                        required: true,
                        trim: true
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
                    }
                }
            ],
            required: true,
            validate: {
                validator: function (skills) {
                    return skills.length > 0;
                },
                message: "At least one skill is required"
            }
        },

        experience: {
            type: Number,
            required: true,
            min: 0
        },

        certifications: {
            type: [String],
            default: []
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

workerSchema.index({ location: "2dsphere" });

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;