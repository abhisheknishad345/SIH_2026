const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
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
            // required: true
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
                "Technician",
                "Domestic Helper",
                "Caregivers"
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
                        enum: ["per_hour", "per_day", "per_visit", "fixed"],
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

        verificationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        isAvailable: {
            type: Boolean,
            default: true
        },

        bookingActionLock: {
    type: Boolean,
    default: false
},

        workingHours: {
    type: [
        {
            day: {
                type: String,
                enum: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ],
                required: true
            },

            isWorking: {
                type: Boolean,
                default: true
            },

            startTime: {
                type: String,
                default: "09:00"
            },

            endTime: {
                type: String,
                default: "17:00"
            }
        }
    ],
    default: []
},
    },
    {
        timestamps: true
    }
);

workerSchema.index({ location: "2dsphere" });

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;