import { Router } from "express";
import authRouter from "./auth";
import taxRouter from "./taxs";
import userRouter from "./users";

const router = Router();

// health checkup route
router.get("/", (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ message: "Service available." });
});

router.use("/api", authRouter);
router.use("/api/users", userRouter);
router.use("/api/taxs", taxRouter);

export default router;