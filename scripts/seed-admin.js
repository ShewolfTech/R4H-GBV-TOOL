/**
 * Run ONCE to create the admin user in MongoDB:
 *   node scripts/seed-admin.js
 *
 * Edit name, email, and password below before running.
 * Change the password immediately after first login.
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const name     = "Admin";
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const hashed = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate({ email }, { name, email, password: hashed }, { upsert: true, new: true });

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
