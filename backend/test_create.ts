import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import Project from './src/models/Project';

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  try {
    const project = await Project.create({
      title: 'Test',
      description: 'Test',
      ownerId: new mongoose.Types.ObjectId()
    });
    console.log('Project created:', project);
  } catch (err: any) {
    console.error('Validation error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
