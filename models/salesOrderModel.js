const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema(
    {
        challandate: {
            type: String,
        },
        salesdate: {
            type: String,
            required: true,
        },
        challannumber: {
            type: String,
        },
        lastchallannumber: {
            type: String,
        },
        customername: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customername",
        },
        ordernumber: {
            type: String,
            required: true,
        },
        salesperson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salesperson",
            required: true
        },
        package: {
            type: String,
            default: "CRT PKG",
            enum: ["CRT PKG", "CRT Pending", "PKG Done"]
        },
        products: [{
            productname: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true,
                enum: ["Fresh Goods", "Out Cut (<200)", "Odd Cut (200-500)", "Odd Cut (510-999)", "Odd Cut (1000+)"]
            },
            inchsize: {
                type: Number,
                required: true
            },
            rollqty: {
                type: Number,
                required: true
            },
            meterqty: {
                type: Number,
                required: true
            }
        }],
        dispatch: {
            type: String,
            default: "Save as Draft",
            enum: ["Save as Draft", "Part Order Pending", "Order Confirm", "Order Closed"]
        },
        customernotes: {
            type: String,
        },
        totalroll: {
            type: Number,
            required: true
        },
        totalmeter: {
            type: Number,
            required: true
        },
        pendingquality: [{
            type: Object,
        }],
        qualityqrs: [{
            type: Object,
        }],
        cancelpending: [{
            type: Object
        }],
        cancelreason: {
            type: String,
        },
        orderedproduct: [{
            type: Object
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SalesOrder", salesOrderSchema);