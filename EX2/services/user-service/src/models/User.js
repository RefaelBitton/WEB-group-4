import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["parent", "child"],
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      minlength: 3,
      maxlength: 40,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    pinHash: {
      type: String,
      select: false,
    },
    age: {
      type: Number,
      min: 6,
      max: 12,
    },
    englishLevel: {
      type: String,
      enum: ["beginner", "basic", "intermediate"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.pinHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre("validate", function validateRoleFields(next) {
  if (this.role === "parent" && !this.email) {
    this.invalidate("email", "Parent users require an email");
  }

  if (this.role === "parent" && !this.passwordHash) {
    this.invalidate("passwordHash", "Parent users require a password");
  }

  if (this.role === "child" && !this.parentId) {
    this.invalidate("parentId", "Child users require a parentId");
  }

  if (this.role === "child" && !this.username) {
    this.invalidate("username", "Child users require a username");
  }

  if (this.role === "child" && !this.pinHash) {
    this.invalidate("pinHash", "Child users require a PIN");
  }

  next();
});

export const User = mongoose.model("User", userSchema);
