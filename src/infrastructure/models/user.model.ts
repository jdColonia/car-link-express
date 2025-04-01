import mongoose, { Schema, Document } from 'mongoose';
import { User, UserRole } from '../../domain/entities/User';
import bcrypt from 'bcryptjs';

// UserDocument interface extends User, omitting the "id" field and including Document for Mongoose document methods
export interface UserDocument extends Omit<User, 'id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
}

// Mongoose Schema for User
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Username must be unique
      trim: true, // Remove whitespace from the beginning and end of the username
    },
    email: {
      type: String,
      required: true,
      unique: true, // Email must be unique
      trim: true,
      lowercase: true, // Email will be stored in lowercase
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum length for the password is 6 characters
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole), // Roles are based on the UserRole enum
      default: [UserRole.TENANT], // Default role is 'tenant'
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to hash the password before saving to the database
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip hashing if the password is not modified

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt for hashing
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error: any) {
    next(error); // Pass any error to the next middleware
  }
});

// Method to compare the candidate password with the stored password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password); // Compare passwords using bcrypt
};

// Export the User model using UserDocument schema
export default mongoose.model<UserDocument>('User', UserSchema);