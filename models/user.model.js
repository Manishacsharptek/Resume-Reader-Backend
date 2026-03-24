import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: "string",
        required: "true"
    },
    email: {
        type: "string",
        required: "true"
    },
    password: {
        type: "string",
        required: "true"
    },
    mobile: {
        type: "string"
    },
    role: {
        type: "string",
        enum: ["user", "owner", "deliveryBoy"],
        default: "user"
    },
    resetotp: {
        type: "string"
    },
    isOtpverified: {
        type: Boolean,
        default: false
    },
    otpexpires: {
        type: Date
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User