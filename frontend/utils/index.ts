import jwt from "jsonwebtoken";

export const decodeAccessToken = (token: string) => {
  try {
    const verified = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    console.log(verified); // Verified payload
    return verified;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
