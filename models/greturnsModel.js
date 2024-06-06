const mongoose = require("mongoose");

const greturnsSchema = new mongoose.Schema(
    {
        partyname: {
            type: String,
            required: true
        },
        uniqueid: {
            type: String,
            required: true
        },
        grdate: {
            type: String,
            required: true,
        },
        grnumber: {
            type: String,
            required: true
        },
        productname: {
            type: String,
            required: true
        },
        inchsize: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true,
            enum: ["Fresh Goods", "Out Cut (<200)", "Odd Cut (200-500)", "Odd Cut (510-999)", "Odd Cut (1000+)"]
        },
        grrollqty: {
            type: String,
            required: true
        },
        grmeterqty: {
            type: String,
            required: true,
        },
        totalmtr: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("Grreturns", greturnsSchema);