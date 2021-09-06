import { genSalt, hash } from "bcrypt";
import "dotenv/config";
import express, { Request, Response } from "express";
import { connection } from "mongoose";
import connectDB from "./config/connectDB";
import User from "./models/User";

import router from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

interface ResponseError extends Error {
    status?: number;
}

// connect database to server
(async () => {
    await connectDB();

    const adminUser = await User.findOne({ username: "admin" });
    if(!adminUser) {
        const hashedPassword = await hash("test", await genSalt(12));
        await User.create({
            firstName: "admin",
            lastName: "admin",
            username: "admin",
            password: hashedPassword,
            role: "admin"
        });
    }

    console.log(`Default user with username: admin and password: test`);

    app.use(express.json());

    // middleware to check if the server is connected with the database or not
    app.use((req, res, next) => {
        if (connection.readyState === 1)
            return next();
        res.status(503).json({ message: "The server is currently unable to handle the request due to a temporary overloading or maintenance of the server" });
    });

    app.use("/", router);

    app.use((req, res, next) => {
        res.setHeader("Content-Type", "application/json");
        res.status(404).json({ message: "Invalid Route!" });
    });

    app.use((err: ResponseError, req: Request, res: Response) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};
        res.setHeader("Content-Type", "application/json");
        res.status(err.status || 500).json(err);
    });

    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
})();

export default app;