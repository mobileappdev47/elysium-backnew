const mongoose = require("mongoose"); // Erase if already required

const addstockSchema = new mongoose.Schema(
    {
        date: {
            type: String,
        },
        // jobcardnum: {
        //     type: Number,
        //     required: true,
        // },
        productname: {
            type: String,
            required: true,
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
        meterqty: {
            type: Number,
            required: true
        },
        rollqty: {
            type: Number,
            required: true
        },
        totalmtr: {
            type: Number,
            required: true
        },
        palsanafactory: {
            type: Boolean,
            required: true,
            default: true
        },
        pandesraoffice: {
            type: Boolean,
            required: true,
            default: false
        },
        rollwisenumber: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

addstockSchema.pre('save', function(next) {
    this.totalmtr = this.rollqty * this.meterqty;
    next();
});

addstockSchema.pre('findOneAndUpdate', function(next) {
    // `this` refers to the query object
    const updateData = this.getUpdate();
    // Calculate totalmtr based on the updated rollqty and meterqty
    if (updateData.rollqty !== undefined || updateData.meterqty !== undefined) {
        updateData.totalmtr = (updateData.rollqty || this._update.rollqty) * (updateData.meterqty || this._update.meterqty);
    }
    // Move to the next middleware
    next();
});


module.exports = mongoose.model("Addstock", addstockSchema);