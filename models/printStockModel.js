const mongoose = require("mongoose"); // Erase if already required

const printStockSchema = new mongoose.Schema(
    {
        jobcardnumb: {
            type: String,
            required: true,
        },
        productName: {
            type: String,
            required: true,
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
        challannumber: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("PrintStock", printStockSchema);