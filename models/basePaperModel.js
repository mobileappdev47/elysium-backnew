const mongoose = require("mongoose"); // Erase if already required

const basePaperSchema = new mongoose.Schema(
    {
        inwarddate: {
            type: String,
            required: true,
        },
        place: {
            type: String,
            required: true,
        },
        reelnum: {
            type: String,
            required: true
        },
        weight: {
            type: String,
            required: true,
        },
        millname: {
            type: String,
            required: true,
        },
        qualityname: {
            type: String,
            required: true
        },
        idnumber: {
            type: String,
            required: true
        },
        basepaperid: {
            type: String,
            required: true
        },
        gsm: {
            type: String,
            required: true
        },
        uniqueid: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("BasePaper", basePaperSchema);