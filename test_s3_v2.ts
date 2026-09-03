import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { storageService } from './backend/src/services/storage/s3.storage';

async function test() {
  const url = await storageService.getFileUrl('generated-images/6a988fc9e8be5613ddef2a73-1788399644910-387.jpg');
  console.log("Presigned URL:", url);
  
  const res = await fetch(url);
  console.log("Status:", res.status, res.statusText);
  const text = await res.text();
  console.log("Body:", text.substring(0, 100));
}
test();
