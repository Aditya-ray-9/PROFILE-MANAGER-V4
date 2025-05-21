import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import session from 'express-session';

// Extend express session with our user type
declare module 'express-session' {
  interface SessionData {
    user: {
      id?: number;
      username?: string;
      role: 'admin' | 'viewer';
    };
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Check if user is already authenticated in session
  if (req.session && req.session.user) {
    return next();
  }
  
  // If no user in session, return unauthorized
  return res.status(401).json({ message: 'Unauthorized' });
};

// Admin role middleware
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and has admin role
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  // If not admin, return forbidden
  return res.status(403).json({ message: 'Forbidden: Admin access required' });
};

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    
    // For viewer role, no authentication needed
    if (role === 'viewer') {
      // Create session for viewer
      req.session.user = {
        role: 'viewer'
      };
      return res.status(200).json({ 
        success: true, 
        role: 'viewer'
      });
    }
    
    // For admin role, verify password
    if (role === 'admin') {
      // Get admin user from database
      const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
      
      if (adminUser.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminUser[0].password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Create session for admin
      req.session.user = {
        id: adminUser[0].id,
        username: adminUser[0].username,
        role: 'admin'
      };
      
      return res.status(200).json({ 
        success: true, 
        role: 'admin'
      });
    }
    
    // Invalid role
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid role' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Logout handler
export const logout = (req: Request, res: Response) => {
  // Clear session
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to logout' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
};