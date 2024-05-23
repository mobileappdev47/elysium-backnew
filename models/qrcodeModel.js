const mongoose = require("mongoose"); // Erase if already required

const qrcodeSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        jobcardnum: {
            type: String,
            required: true,
        },
        basepaperid: {
            type: String,
            required: true
        },
        productname: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            enum: ["Fresh Goods","Out Cut (<200)", "Odd Cut (200-500)", "Odd Cut (510-999)", "Odd Cut (1000+)"]
        },
        meterqty: {
            type: Number,
            required: true
        },
        rollqty: {
            type: Number,
            required: true
        },
        inchsize: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("Qrcode", qrcodeSchema);