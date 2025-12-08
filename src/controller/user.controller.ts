import type { Request, Response } from "express";
import { userCreateSchema } from "../../lib/zod-schema.js";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { decodeJWT, encryptJWT, type JWTData } from "../../lib/jwt.js";

const signup = async (req: Request, res: Response) => {
  try {
    console.log("REQBODY", req.body);
    const validation = userCreateSchema.safeParse(req.body);
    console.log(validation);
    if (!validation.success) {
      return res.status(401).json({
        message: "Some Field are missing fill them ",
        error: JSON.stringify(
          validation.error.issues.map((issue) => issue.message).join(", ")
        ),
      });
    }
    const userExists = await prisma.user.findUnique({
      where: {
        email: validation.data.email,
      },
    });
    console.log(userExists);
    if (userExists) {
      return res.status(400).json({
        message:
          "The user with email: " + validation.data.email + "already exist",
      });
    }
    const saltRounds = Number(process.env.SALT_ROUNDS || "10"); // default to 10
    console.log(saltRounds, "SALT");
    const hashedPassword = await bcrypt.hash(
      validation.data.password,
      saltRounds
    );
    console.log(hashedPassword, "hash"); // should log now

    console.log(hashedPassword, "hash");
    const newUser = await prisma.user.create({
      data: {
        email: validation.data.email,
        hashed_password: hashedPassword,
        name: validation.data.email.split("@")[0] as string,
      },
    });
    console.log(newUser);
    if (!newUser) {
      return res.status(400).json({
        message: "The user failed to be created",
      });
    }
    const access_token = encryptJWT({
      data: { user_id: newUser.id },
      TTL: "5m",
    });
    console.log("access_token", access_token);
    const refresh_token = encryptJWT({
      data: { user_id: newUser.id },
      TTL: "60d",
    });
    console.log("Refresh Token", refresh_token);
    return res
      .status(201)
      .cookie("refresh-token", refresh_token, {
        sameSite: "lax",
        httpOnly: true,
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .json({
        message: "User successfully created",
        data: { access_token },
      });
  } catch (error) {
    console.log("Something Went Wrong", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const login = async (req: Request, res: Response) => {
  try {
    const validation = userCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(401).json({
        message: "Some Field are missing fill them ",
        error: JSON.stringify(
          validation.error.issues.map((issue) => issue.message).join(", ")
        ),
      });
    }
    const userDetails = await prisma.user.findUnique({
      where: {
        email: validation.data.email,
      },
    });
    if (!userDetails) {
      return res.status(400).json({
        message:
          "The user with email: " + validation.data.email + "doesnt exist",
      });
    }
    const passwordMatch = bcrypt.compare(
      validation.data.password,
      userDetails.hashed_password
    );
    if (!passwordMatch) {
      return res.status(400).json({
        message: "The Password doesnt match",
      });
    }
    const access_token = encryptJWT({
      data: { user_id: userDetails.id },
      TTL: "5m",
    });
    const refreshToken = encryptJWT({
      data: { user_id: userDetails.id },
      TTL: "60d",
    });
    return res
      .status(201)
      .cookie("refresh-token", refreshToken, {
        sameSite: "lax",
        httpOnly: true,
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .json({
        message: "User successfully created",
        data: { access_token },
      });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200).clearCookie("refresh-token").json({
      message: "User successfully logged out",
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const refreshRecycle = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies["refresh-token"];

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }
    const decodedToken = decodeJWT(refreshToken);
    if (!decodedToken) {
      return res.status(401).json({
        message: "token not able to be decoded",
      });
    }
    const access_token = encryptJWT({
      data: { user_id: decodedToken.payload.user_id },
      TTL: "5m",
    });
    return res.status(200).json({
      message: "Access token refreshed",
      data: { access_token },
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const getUserDetails = async (req: Request, res: Response) => {};
const updateUserDetails = async (req: Request, res: Response) => {};
export { signup, login, logout, refreshRecycle };
