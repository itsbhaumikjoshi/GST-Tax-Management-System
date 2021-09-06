import { Router } from "express";
import { getQuery } from "../helpers/getQuery";
import { isAdmin, isLoggedIn, isNotTaxPayer } from "../middlewares/auth";
import TaxDue from "../models/TaxDue";
import { UserDocument } from "../models/User";

const taxRouter = Router();

// get all tax dues
taxRouter.get("/tax-dues", isLoggedIn, async (req, res, next) => {
    const { key, value } = req.query as { key: string; value: string; };
    try {
        const query = getQuery(res.locals as UserDocument, key, value);
        const taxDues = await TaxDue.find(query);
        return res.status(200).json(taxDues);
    } catch (error) {
        next(error);
    }
});

// get a tax dues
taxRouter.get("/tax-dues/:taxId", isLoggedIn, async (req, res, next) => {
    const istaxaccount = res.locals.role === "tax-accountant";
    const { taxId } = req.params;
    try {
        if (istaxaccount) {
            const taxDue = await TaxDue.findById(taxId);
            if (taxDue)
                return res.status(200).json(taxDue);
            return res.status(404).json({ message: "Tax Due not found" });
        } else {
            const taxDue = await TaxDue.findOne({ _id: taxId, userId: res.locals._id });
            if (taxDue)
                return res.status(200).json(taxDue);
            return res.status(404).json({ message: "Tax Due not found" });
        }
    } catch (error) {
        next(error);
    }
});

// marks tax as paid by the tax payer
taxRouter.get("/tax-pay/:taxId", isLoggedIn, async (req, res, next) => {
    const { taxId } = req.params;
    try {
        const taxDue = await TaxDue.updateOne({ _id: taxId, status: { $ne: "PAID" }, userId: res.locals._id }, { $set: { status: "PAID" } });
        if (taxDue.modifiedCount === 1)
            return res.status(200).json({ message: "Tax Paid Successfully" });
        return res.status(404).json({ message: "No Tax Due Found" });
    } catch (error) {
        next(error);
    }
});

// creates tax-dues
taxRouter.post("/", isLoggedIn, isNotTaxPayer, async (req, res, next) => {
    try {
        const taxDue = await TaxDue.create({
            ...req.body,
            createdBy: res.locals._id
        });
        return res.status(201).json(taxDue);
    } catch (error) {
        next(error);
    }
});

// edits tax-dues if not paid && Delete tax-due
taxRouter.route("/:taxId")
    .put(isLoggedIn, isNotTaxPayer, async (req, res, next) => {
        const { taxId } = req.params;
        try {
            const taxDue = await TaxDue.updateOne({ _id: taxId, status: { $ne: "PAID" } }, { $set: req.body });
            if (taxDue.modifiedCount === 1)
                return res.status(200).json({ message: "Tax Updated Successfully" });
            return res.status(404).json({ message: "No Tax Due Found" });
        } catch (error) {
            next(error);
        }
    }).delete(isLoggedIn, isAdmin, async (req, res, next) => {
        const { taxId } = req.params;
        try {
            const taxDue = await TaxDue.findByIdAndRemove(taxId);
            if (taxDue)
                return res.status(200).json({ message: "Tax Due removed successfully" });
            return res.status(404).json({ message: "Tax Due not found" });
        } catch (error) {
            next(error);
        }
    });

export default taxRouter;