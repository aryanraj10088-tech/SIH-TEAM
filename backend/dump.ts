import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Project from './src/models/Project';
import User from './src/models/User';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string || process.env.MONGO_URI as string);
  try {
    const users = await User.find({}, '_id email role');
    console.log('Users:', users);
    
    const projects = await Project.find({});
    console.log('Projects count:', projects.length);
    for (const p of projects) {
      console.log(`Project: ${p.title} | Owner: ${p.ownerId}`);
    }
  } catch (err: any) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
