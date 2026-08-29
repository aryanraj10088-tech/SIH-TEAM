import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../src/models/Project';
import User from '../src/models/User';

dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sih');
  const project = await Project.findOne({ title: 'hello' });
  console.log('Project:', project);
  
  if (project) {
    const owner = await User.findById(project.ownerId);
    console.log('Owner:', owner);
  }

  const allUsers = await User.find({}, 'email role name');
  console.log('All Users:', allUsers);
  
  process.exit(0);
};

check().catch(console.error);
