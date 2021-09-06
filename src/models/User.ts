import { model, Schema, Document } from "mongoose";

export interface UserSchema {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    role: "tax-payer" | "tax-accountant" | "admin";
    tokenVersion: number;
};

export interface UserDocument extends UserSchema, Document {
    createdAt: Date;
    updatedAt: Date;
};

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["tax-payer", "tax-accountant", "admin"],
        default: "tax-payer"
    },
    tokenVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default model<UserDocument>("user", userSchema);