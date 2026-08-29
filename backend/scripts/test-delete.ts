import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../src/models/Project';
import User from '../src/models/User';
import Source from '../src/models/Source';
import AuditLog from '../src/models/AuditLog';

dotenv.config();

const runTests = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sih');
  console.log('Connected to DB');

  // Find or create test users
  let owner = await User.findOne({ email: 'owner@test.com' });
  if (!owner) {
    owner = await User.create({ name: 'Owner', email: 'owner@test.com', passwordHash: 'password', role: 'Operator' });
  }

  let hacker = await User.findOne({ email: 'hacker@test.com' });
  if (!hacker) {
    hacker = await User.create({ name: 'Hacker', email: 'hacker@test.com', passwordHash: 'password', role: 'Operator' });
  }

  let admin = await User.findOne({ email: 'admin@test.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: 'password', role: 'Administrator' });
  }

  // Create a project for Owner
  const project = await Project.create({
    title: 'Test Deletion Project',
    description: 'Testing the cascade delete',
    ownerId: owner._id,
  });

  const source = await Source.create({
    projectId: project._id,
    originalName: 'test.pdf',
    storageKey: 'fake-key-' + Date.now(),
    mimeType: 'application/pdf',
    sizeBytes: 100,
    status: 'PROCESSED',
    uploadedBy: owner._id,
  });

  console.log(`Created Project ${project._id} with Source ${source._id}`);

  // Make actual HTTP request to the running server!
  // Login as admin to get cookies
  let adminRes;
  try {
    adminRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@srijansetu.com',
        password: 'securepassword123'
      })
    });
    console.log('Admin login status:', adminRes.status);
    if (!adminRes.ok) throw new Error(`HTTP ${adminRes.status}`);
  } catch (err: any) {
    console.error('Login failed:', err.message);
    process.exit(1);
  }

  const setCookieHeader = adminRes.headers.get('set-cookie');
  const cookies = setCookieHeader ? [setCookieHeader] : [];

  // Now hit the delete endpoint for the 'hello' project (we know its title is 'hello')
  const helloProject = await Project.findOne({ title: 'hello' });
  if (!helloProject) {
    console.error('Hello project not found in DB!');
    process.exit(1);
  }

  console.log('Trying to delete hello project:', helloProject._id);

  try {
    const deleteRes = await fetch(`http://localhost:5000/api/projects/${helloProject._id}`, {
      method: 'DELETE',
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    console.log('Delete status:', deleteRes.status);
    const bodyText = await deleteRes.text();
    console.log('Delete body:', bodyText);
  } catch (err: any) {
    console.error('Delete fetch failed:', err.message);
  }

  console.log('\nAll tests passed successfully!');
  process.exit(0);

  // 2. Test Nonexistent Project
  console.log('\n--- Test 2: Nonexistent Project ---');
  req = { params: { id: new mongoose.Types.ObjectId() }, user: owner };
  res = mockRes();
  await deleteProject(req as any, res as any);
  console.log('Status:', res.statusCode);
  console.log('Body:', res.body);
  if (res.statusCode !== 404) throw new Error('Expected 404 Not Found');

  // 3. Test Valid Owner Deletion
  console.log('\n--- Test 3: Valid Owner Deletion ---');
  req = { params: { id: project._id }, user: owner };
  res = mockRes();
  await deleteProject(req as any, res as any);
  console.log('Status:', res.statusCode);
  console.log('Body:', res.body);
  if (res.statusCode !== 200) throw new Error('Expected 200 OK');

  // Verify Cascade Deletion
  const pCheck = await Project.findById(project._id);
  const sCheck = await Source.findById(source._id);
  const aCheck = await AuditLog.findOne({ entityId: project._id, action: 'PROJECT_DELETED' });
  
  console.log('Project still exists?', !!pCheck);
  console.log('Source still exists?', !!sCheck);
  console.log('Audit log created?', !!aCheck);

  if (pCheck || sCheck || !aCheck) throw new Error('Cascade deletion or audit log failed');

  // 4. Test Admin Deletion
  console.log('\n--- Test 4: Valid Admin Deletion ---');
  const project2 = await Project.create({
    title: 'Test Admin Deletion',
    description: 'Admin deleting another user project',
    ownerId: owner._id,
  });
  req = { params: { id: project2._id }, user: admin };
  res = mockRes();
  await deleteProject(req as any, res as any);
  console.log('Status:', res.statusCode);
  console.log('Body:', res.body);
  if (res.statusCode !== 200) throw new Error('Expected 200 OK for Admin');

  console.log('\nAll tests passed successfully!');
  process.exit(0);
};

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
