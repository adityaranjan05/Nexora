
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';

const email = 'student@example.com';
const password = 'Password@123';

async function createStudent() {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== 'student') {
        throw new Error(
          `${email} already exists with role "${existingUser.role}". No changes made.`
        );
      }

      console.log('Student account already exists:', email);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      name: 'Demo Student',
      email,
      passwordHash,
      role: 'student',
      isActive: true,
    });

    console.log('Demo student created successfully.');
    console.log('Email:', email);
    console.log('Password:', password);
  } finally {
    await disconnectDB();
  }
}

createStudent().catch((error) => {
  console.error('Could not create demo student:', error.message);
  process.exitCode = 1;
});
frontend/src/pages/StudentComplaintsPage.jsx