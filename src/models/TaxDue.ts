import { model, Schema } from "mongoose";

const taxDueSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    state: {
        type: String,
        required: true
    },
    stateTax: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    fines: {
        type: Number,
        default: 0
    },
    SGST: Number,
    CGST: Number,
    panCard: {
        type: String,
        required: true
    },
    salaryIncome: {
        type: Number,
        required: true
    },
    stockIncome: Number,
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["NEW", "DELAYED", "PAID"],
        default: "NEW"
    }
}, {
    timestamps: true
});

export default model("tax-due", taxDueSchema);