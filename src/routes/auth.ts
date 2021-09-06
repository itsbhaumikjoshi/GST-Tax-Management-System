import { compare } from "bcrypt";
import { Router } from "express";
import { generateToken } from "../helpers/token";
import { isLoggedIn } from "../middlewares/auth";
import User from "../models/User";

const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "username or password is missing" })
    try {
        const user = await User.findOne({ username }).select("+password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!(await compare(password, user.password)))
            return res.status(400).json({ message: "Password verification failed" })
        const token = generateToken(user);
        res.setHeader("token", token);
        const { _id, firstName, lastName } = user;
        res.status(200).json({
            _id,
            username,
            firstName,
            lastName
        });
    } catch (error) {
        next(error);
    }
});

authRouter.delete("/logout", isLoggedIn, async (req, res, next) => {
    try {
        const userId = res.locals._id;
        await User.updateOne({ _id: userId }, { $set: { tokenVersion: Number(res.locals.tokenVersion) + 1 } });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        next(error);
    }
});

export default authRouter;