const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true
        },
        loginId: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        generalqr: {
            type: Boolean,
            required: true,
        },
        specificqr: {
            type: Boolean,
            required: true,
        },
        qrdatamaster: {
            type: Boolean,
            required: true,
        },
        duplicateqr: {
            type: Boolean,
            required: true,
        },
        cuttingroll: {
            type: Boolean,
            required: true,
        },
        namechangeqr: {
            type: Boolean,
            required: true,
        },
        grprint: {
            type: Boolean,
            required: true,
        },
        availablestock: {
            type: Boolean,
            required: true,
        },
        locationchange: {
            type: Boolean,
            required: true,
        },
        addquality: {
            type: Boolean,
            required: true,
        },
        allsalesorder: {
            type: Boolean,
            required: true,
        },
        orderdispatch: {
            type: Boolean,
            required: true,
        },
        orderpending: {
            type: Boolean,
            required: true,
        },
        role: {
            type: String,
            default: "user",
        },
        isactive: {
            type: Boolean,
            default: true
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) {
//         next();
//     }
//     const salt = await bcrypt.genSaltSync(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });
// userSchema.methods.isPasswordMatched = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };
// userSchema.methods.createPasswordResetToken = async function () {
//     const resettoken = crypto.randomBytes(32).toString("hex");
//     this.passwordResetToken = crypto
//         .createHash("sha256")
//         .update(resettoken)
//         .digest("hex");
//     this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
//     return resettoken;
// };



module.exports = mongoose.model("User", userSchema);