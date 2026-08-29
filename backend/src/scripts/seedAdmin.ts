import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import connectDB from '../config/db';
// Need to ensure the user.model.ts path is correct. Let's assume it's ../models/User or ../models/user.model.ts
import User from '../models/User';

const seedAdmin = async () => {
  try {
    await connectDB();

    const { ADMIN_EMAIL, ADMIN_PASSWORD, TEST_OPERATOR_EMAIL, TEST_OPERATOR_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Check if admin already exists
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    if (adminExists) {
      adminExists.passwordHash = adminHashedPassword;
      await adminExists.save();
      console.log('⚠️ Admin user already existed. Password has been forcefully updated.');
    } else {
      const admin = await User.create({
        name: 'System Administrator',
        email: ADMIN_EMAIL,
        passwordHash: adminHashedPassword,
        role: 'Administrator',
      });
      console.log(`✅ Administrator account created successfully for: ${admin.email}`);
    }

    // Seed Operator if variables are present
    if (TEST_OPERATOR_EMAIL && TEST_OPERATOR_PASSWORD) {
      const operatorHashedPassword = await bcrypt.hash(TEST_OPERATOR_PASSWORD, salt);
      const operatorExists = await User.findOne({ email: TEST_OPERATOR_EMAIL });
      
      if (operatorExists) {
        operatorExists.passwordHash = operatorHashedPassword;
        await operatorExists.save();
        console.log('⚠️ Operator user already existed. Password has been forcefully updated.');
      } else {
        const operator = await User.create({
          name: 'Test Operator',
          email: TEST_OPERATOR_EMAIL,
          passwordHash: operatorHashedPassword,
          role: 'Operator',
        });
        console.log(`✅ Operator account created successfully for: ${operator.email}`);
      }
    }

    // Seed Reviewer if variables are present
    const { TEST_REVIEWER_EMAIL, TEST_REVIEWER_PASSWORD } = process.env;
    if (TEST_REVIEWER_EMAIL && TEST_REVIEWER_PASSWORD) {
      const reviewerHashedPassword = await bcrypt.hash(TEST_REVIEWER_PASSWORD, salt);
      const reviewerExists = await User.findOne({ email: TEST_REVIEWER_EMAIL });
      
      if (reviewerExists) {
        reviewerExists.passwordHash = reviewerHashedPassword;
        await reviewerExists.save();
        console.log('⚠️ Reviewer user already existed. Password has been forcefully updated.');
      } else {
        const reviewer = await User.create({
          name: 'Test Reviewer',
          email: TEST_REVIEWER_EMAIL,
          passwordHash: reviewerHashedPassword,
          role: 'Reviewer',
        });
        console.log(`✅ Reviewer account created successfully for: ${reviewer.email}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
