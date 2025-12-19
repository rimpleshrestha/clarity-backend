import CryptoJS from "crypto-js";

const getCryptoKey = (): string => {
  const key = process.env.CRYPTO_AES_KEY;
  if (!key) {
    throw new Error(
      "CRYPTO_AES_KEY is not defined in the environment variables"
    );
  }
  return key;
};
const encryptAES = ({ data }: { data: string }): string => {
  const key = getCryptoKey();
  return CryptoJS.AES.encrypt(data, key).toString();
};
const decryptAES = ({ data }: { data: string }): string => {
  const key = getCryptoKey();
  return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
};

export { encryptAES, decryptAES };
