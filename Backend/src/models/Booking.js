const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },
        skillName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
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
        scheduledEndAt: {
            type: Date,
            default: null
        },
        priceType: {
            type: String,
            enum: ["per_hour", "per_day", "fixed", "negotiable"],
            required: true
        },
        pricingStatus: {
            type: String,
            enum: ["fixed", "pending", "proposed", "countered", "agreed", "rejected"],
            default: "fixed"
        },

        counterOfferCount: {
            type: Number,
            default: 0,
            min: 0,
            max: 10
        },

        negotiation: {
            currentOffer: {
                amount: { type: Number, min: 0 },
                proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                proposedAt: { type: Date }
            },
            history: [{
                amount: { type: Number, required: true, min: 0 },
                proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                action: {
                    type: String,
                    enum: ["proposed", "countered", "accepted", "rejected"],
                    required: true
                },
                createdAt: { type: Date, default: Date.now }
            }]
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
                type: [Number],
                required: true
            }
        },

        price: {
            type: Number,
            default: null,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "in_progress",
                "cancelled",
                "completed"
            ],
            default: "pending"
        },

        paymentStatus: {
            type: String,
            enum: ["not_due", "awaiting", "paid"],
            default: "not_due"
        },

        paymentMethod: {
            type: String,
            enum: ["demo", null],
            default: null
        },

        serviceCompletedAt: {
            type: Date,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

bookingSchema.index({
    location: "2dsphere"
});

const Booking = mongoose.model(
    "Booking",
    bookingSchema
);

module.exports = Booking;