import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const checkHealth = (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  
  const statusMap: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isConnected = dbStatus === 1;

  res.status(isConnected ? 200 : 503).json({ 
    status: isConnected ? 'OK' : 'UNAVAILABLE', 
    database: statusMap[dbStatus] || 'unknown',
    timestamp: new Date().toISOString() 
  });
};
