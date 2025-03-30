import { Schema, model, Document } from "mongoose";

export interface User extends Document {
  email: string;
  password: string;
  role: "tenant" | "owner" | "admin";
}

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["tenant", "owner", "admin"], required: true },
});

export const UserModel = model<User>("User", userSchema);