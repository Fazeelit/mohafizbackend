import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }, // ✅ always admin
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  profilePicture: { type: String, default: "default.jpg" },
  address: { type: String, default: "" },
  token: { type: String, default: "" },
  phone: {
    type: String, // use string to preserve formatting
    validate: {
      validator: v => !v || /^[0-9]{10,15}$/.test(v),
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  wishlist: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
  ],
});

const Admin = mongoose.model("Admin", userSchema);

export default Admin;
