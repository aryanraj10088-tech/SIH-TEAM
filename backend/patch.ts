import { Request, Response } from 'express';
import { storageService } from '../services/storage/s3.storage';

export const serveImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      res.status(400).json({ message: 'Missing image key' });
      return;
    }
    const url = await storageService.getFileUrl(key);
    
    // Proxy the image to avoid CORS/redirect issues on the frontend
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({ message: 'Failed to fetch image from storage' });
      return;
    }
    
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    if (response.body) {
      // Node.js 18+ native fetch body is a web readable stream
      // We can convert it to a node stream or just use arrayBuffer
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } else {
      res.status(500).json({ message: 'Empty response from storage' });
    }
  } catch (err) {
    console.error('serveImage proxy error:', err);
    res.status(500).json({ message: 'Failed to generate image URL' });
  }
};
