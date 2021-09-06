import { decode, JwtPayload, sign, verify } from "jsonwebtoken";
import { UserDocument } from "../models/User";

export interface TokenPayload extends JwtPayload {
    userId: string;
    tokenVersion: number;
};

export const generateToken = (user: UserDocument) => sign({ userId: user._id, tokenVersion: user.tokenVersion }, process.env.TOKEN_SECRET! + user.tokenVersion, { expiresIn: '30d' });

export const verifyToken = (token: string) => {
    const { tokenVersion } = decode(token) as TokenPayload;
    return verify(token, process.env.TOKEN_SECRET! + tokenVersion) as TokenPayload;
};