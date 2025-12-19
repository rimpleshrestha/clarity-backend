import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { decodeJWT, encryptJWT, verifyJWT } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { userCreateSchema } from "../../lib/zod-schema.js";

const signup = async (req: Request, res: Response) => {
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
    const userExists = await prisma.user.findUnique({
      where: {
        email: validation.data.email,
      },
    });

    if (userExists) {
      return res.status(400).json({
        message:
          "The user with email: " + validation.data.email + " already exist",
      });
    }
    const saltRounds = Number(process.env.SALT_ROUNDS || "10"); // default to 10

    const hashedPassword = await bcrypt.hash(
      validation.data.password,
      saltRounds
    );

    const newUser = await prisma.user.create({
      data: {
        email: validation.data.email,
        hashed_password: hashedPassword,
        name: validation.data.email.split("@")[0] as string,
      },
    });

    if (!newUser) {
      return res.status(400).json({
        message: "The user failed to be created",
      });
    }
    const access_token = encryptJWT({
      data: { user_id: newUser.id },
      TTL: "5m",
    });

    const refresh_token = encryptJWT({
      data: { user_id: newUser.id },
      TTL: "60d",
    });

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
    const passwordMatch = await bcrypt.compare(
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
        message: "User successfully Logged In",
        data: { access_token },
      });
  } catch (error) {
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
    const decodedToken = verifyJWT(refreshToken) as { user_id: number } | null;
    if (!decodedToken) {
      return res.status(401).json({
        message: "token not able to be decoded",
      });
    }
    const access_token = encryptJWT({
      data: { user_id: decodedToken.user_id },
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
const upsertUserPin = async (req: Request, res: Response) => {
  try {
    const user_id = req.user;
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({
        message: "The Pin must be Sent",
      });
    }
    const saltRounds = Number(process.env.SALT_ROUNDS || "10");
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    if (!hashedPin) {
      return res.status(400).json({
        message: "There was error hashing the pin",
      });
    }
    const entry = await prisma.pin.upsert({
      where: {
        user_id: Number(user_id),
      },
      update: { code: hashedPin },
      create: {
        code: hashedPin,
        user_id: Number(user_id),
      },
    });
    if (!entry) {
      return res.status(400).json({
        message: "Failed to Create Pin",
      });
    }
    return res.status(201).json({
      message: "Succesfully created the pin",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Succesfully failed created the pin",
      error: JSON.stringify(error),
    });
  }
};

const updateUserDetails = async (req: Request, res: Response) => {};
export { login, logout, refreshRecycle, signup, upsertUserPin };
