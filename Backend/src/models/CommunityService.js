const mongoose = require("mongoose");

const communityServiceSchema = new mongoose.Schema(
    {
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

        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        title: {
            type: String,
            required: true,
            trim: true,
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

        skillName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        scheduledAt: {
            type: Date,
            required: true
        },

        duration: {
            type: Number,
            required: true,
            min: 1
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

        address: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        status: {
            type: String,
            enum: [
                "open",
                "accepted",
                "in_progress",
                "completion_pending",
                "completed",
                "cancelled"
            ],
            default: "open"
        },

        completionProof: {
            description: {
                type: String,
                trim: true,
                maxlength: 500
            },

            actualDuration: {
                type: Number,
                min: 1
            }
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

communityServiceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
    "CommunityService",
    communityServiceSchema
);