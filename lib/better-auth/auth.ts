import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

export const auth = await (async () => {
  const mongoose = await connectToDatabase()
  const db = mongoose.connection.db

  if (!db) throw new Error("MongoDB database not found")

  return betterAuth({
    adapter: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      disableSignup: false,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true
    },
    plugins: [nextCookies()],
  })
})();