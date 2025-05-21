import { Request, Response, NextFunction } from 'express';

// Simplified middleware functions now that authentication is removed
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  return next();
};

// Simple pass-through middleware (everyone has admin access now)
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  return next();
};

// Dummy login handler
export const login = async (req: Request, res: Response) => {
  return res.status(200).json({ 
    success: true, 
    role: 'admin'
  });
};

// Dummy logout handler
export const logout = (req: Request, res: Response) => {
  return res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
};