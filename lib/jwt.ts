import jwt, { type Jwt, type SignOptions } from "jsonwebtoken";
import { extend } from "zod/mini";
export type JWTData = { user_id: number | string };
interface MyPayload {
  user_id: string | number;
}
interface DecodedJWT extends Jwt {
  payload: MyPayload;
}
const encryptJWT = ({
  data,
  TTL = "5m",
}: {
  data: JWTData;
  TTL?: SignOptions["expiresIn"];
}) => {
  return jwt.sign(data, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: TTL,
    algorithm: "HS256",
  });
};
const verifyJWT = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

const decodeJWT = (token: string): DecodedJWT => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as DecodedJWT;
};
export { encryptJWT, verifyJWT, decodeJWT };
