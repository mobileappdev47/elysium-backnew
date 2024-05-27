const mongoose = require("mongoose"); // Erase if already required

const customernameSchema = new mongoose.Schema(
    {
        customername: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model("Customername", customernameSchema);