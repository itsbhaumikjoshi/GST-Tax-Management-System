import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/token";
import User from "../models/User";

export const isNotTaxPayer = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.role !== "tax-payer")
        return next();
    return res.status(403).json({ message: "Forbidden Route" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.role === "admin")
        return next();
    return res.status(403).json({ message: "Forbidden Route" });
};

export const isTaxAccountant = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.role === "tax-accountant")
        return next();
    return res.status(403).json({ message: "Forbidden Route" });
};

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers['authorization'];
    if (token) {
        try {
            token = token.split(" ")[1];
            const { userId, tokenVersion } = verifyToken(token);
            const user = await User.findById(userId);
            if (user && (user.tokenVersion === tokenVersion)) {
                res.locals = user;
                return next();
            }
            return res.status(404).json({ message: "User not found" });
        } catch (error) {
            return next(error);
        }
    }
    return res.status(403).json({ message: "Forbidden Route" });
};