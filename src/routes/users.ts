import { genSalt, hash } from "bcrypt";
import { Router } from "express";
import { isAdmin, isLoggedIn, isNotTaxPayer } from "../middlewares/auth";
import User from "../models/User";

const userRouter = Router();

userRouter.post("/", async (req, res, next) => {
    try {
        delete req.body.role;
        const salts = await genSalt(12);
        const hashedPassword = await hash(req.body.password as string, salts);
        req.body.password = hashedPassword;
        const user = await User.create(req.body);
        return res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

userRouter.get("/tax-payer", isLoggedIn, isNotTaxPayer, async (req, res, next) => {
    try {
        const taxPayers = await User.find({ role: "tax-payer" });
        return res.status(200).json(taxPayers);
    } catch (error) {
        next(error);
    }
});

userRouter.route("/tax-payer/:userId")
    .get(isLoggedIn, isNotTaxPayer, async (req, res, next) => {
        const { userId } = req.params;
        try {
            const taxPayer = await User.findById(userId);
            return res.status(200).json(taxPayer);
        } catch (error) {
            next(error);
        }
    })
    .put(isLoggedIn, isNotTaxPayer, async (req, res, next) => {
        const { userId } = req.params;
        delete req.body.role;
        if (req.body.password)
            req.body.password = await hash(req.body.password, await genSalt(12));
        try {
            const user = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true });
            if (!user)
                return res.status(404).json({ message: "User not found" })
            // if password is updated revoke all refresh tokens
            if (req.body.password)
                user.tokenVersion = user.tokenVersion + 1;
            return res.status(200).json({ message: "User info updated" })
        } catch (error) {
            next(error);
        }
    });

userRouter.get("/make-admin/:userId", isLoggedIn, isAdmin, async (req, res, next) => {
    const { userId } = req.params;
    try {
        await User.updateOne({ _id: userId }, { $set: { role: "admin" } });
        return res.status(200).json({ message: "User info updated" })
    } catch (error) {
        next(error);
    }
});

userRouter.get("/make-tax-accountant/:userId", isLoggedIn, isNotTaxPayer, async (req, res, next) => {
    const { userId } = req.params;
    try {
        await User.updateOne({ _id: userId }, { $set: { role: "tax-accountant" } });
        return res.status(200).json({ message: "User info updated" })
    } catch (error) {
        next(error);
    }
});

userRouter.delete("/:userId", isLoggedIn, isAdmin, async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndRemove(userId);
        if (user)
            return res.status(200).json({ message: "User removed successfully" });
        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        next(error);
    }
});

export default userRouter;