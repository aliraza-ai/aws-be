import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface UserRequest extends Request {
  user?: any;
}

const verifyToken = (req: UserRequest, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  const tokenString = token.split(" ")[1];

  jwt.verify(
    tokenString,
    process.env.JWT_SECRET as string,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // If the token is valid, proceed to the next middleware or route handler
      req.user = decoded;
      next();
    }
  );
};

export default verifyToken;
