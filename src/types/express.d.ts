import "express-serve-static-core";

declare module "http" {
  interface IncomingHttpHeaders {
    "x-journal-token"?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    unlock?: {
      user_id: number | string;
    };
  }
}
