const mongoose = require("mongoose"); // Erase if already required

const salespersonSchema = new mongoose.Schema(
    {
        salesname: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model("Salesperson", salespersonSchema);