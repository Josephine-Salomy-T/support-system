import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";
import bcrypt from 'bcryptjs';

dotenv.config();


async function seedEmployee() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    
    const existing = await User.findOne({ email: 'employee@test.com' });
    if (existing) {
      console.log('Employee already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('1234', 12);
    
    await User.create({
      name: 'John Employee',
      email: 'employee@test.com',
      password: hashedPassword,
      role: 'employee'
    });
    
    console.log('✅ Employee user created: employee@test.com / 1234');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding employee:', err);
    process.exit(1);
  }
}

seedEmployee();

