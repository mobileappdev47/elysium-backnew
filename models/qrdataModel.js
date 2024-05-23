const mongoose = require("mongoose"); // Erase if already required

const qrdataSchema = new mongoose.Schema(
    {
        uniqueid: {
            type: String,
            // required: true,
        },
        qrcodeid: {
            type: String,
            // required: true,
        },
        date: {
            type: String,
            // required: true,
        },
        jobcardnum: {
            type: String,
            // required: true,
        },
        basepaperid: {
            type : String,
        },
        productname: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true,
            enum: ["Fresh Goods", "Out Cut (<200)", "Odd Cut (200-500)", "Odd Cut (510-999)", "Odd Cut (1000+)"]
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
        },
        palsanafactory: {
            type: Boolean,
        },
        pandesraoffice: {
            type: Boolean,
        },
        count: {
            type: Number,
            default: 0,
        },
        user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }        
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("Qrdata", qrdataSchema);