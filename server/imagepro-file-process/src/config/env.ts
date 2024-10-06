import dotenv from "dotenv";

dotenv.config();

export const env = {
  PINATA_JWT: process.env.PINATA_JWT!,
  PINATA_GATEWAY: process.env.PINATA_GATEWAY!,
};