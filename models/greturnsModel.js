const mongoose = require("mongoose");

const greturnsSchema = new mongoose.Schema(
    {
        partyname: {
            type: String
        },
        grdate: {
            type: String,
            required: true,
        },
        grrollqty: {
            type: String,
            required: true
        },
        meterqty: {
            type: String,
            required: true,
        },
        totalmtr: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("Grreturns", greturnsSchema);