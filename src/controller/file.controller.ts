import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import S3 from "../../lib/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const generatePresignedURL = async (req: Request, res: Response) => {
  try {
    const { file }: { file: File } = req.body;
    if (!file || !(file instanceof File)) {
      return res.status(400).json({
        message: "Invalid file provided",
      });
    }
    const uniqueKeyForFileUpload = `${file.name}-${uuidv4()}`;
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME as string,
      Key: uniqueKeyForFileUpload,
      ContentType: file.type,
      ContentLength: file.size,
    });
    const presignUrl = await getSignedUrl(S3, command, {
      expiresIn: 1 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      message: "Succesfully generated a Presigned URL ",
      data: {
        "presigned-url": presignUrl,
        key: uniqueKeyForFileUpload,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const deletePresignedURL = async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({
        message: "Key is required to delete",
      });
    }
    const command = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME as string,
      Key: key,
    });
    await S3.send(command);
    return res.status(200).json({
      message: "Successfully deleted an image",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};

export { deletePresignedURL, generatePresignedURL };
