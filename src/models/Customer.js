const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        phone: {
            type: String,
            trim: true
        },

        address: {
            type: String,
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
        }
    },
    {
        timestamps: true
    }
);

customerSchema.index({ location: "2dsphere" });

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;