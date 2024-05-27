const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema(
    {
        challandate: {
            type: String,
            required: true,
        },
        salesdate: {
            type: String,
            required: true,
        },
        challannumber: {
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
            enum: ["CRT PKG", "Done"]
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
            default: "Draft",
            enum: ["Draft", "Done", "Pending", "Cancel", "Hold"]
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
        }]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SalesOrder", salesOrderSchema);