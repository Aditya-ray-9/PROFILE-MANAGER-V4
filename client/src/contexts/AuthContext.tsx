import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import bcrypt from 'bcryptjs';

// Role types
export type UserRole = 'admin' | 'viewer' | null;

// Auth context type
interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Password hash for "201099"
const ADMIN_PASSWORD_HASH = '$2a$10$xK.Qi0z.EvMJ.H/4JsvIZOdYgd23vvX0GpaTiH5NOYwCGKyDXBHp6';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  // On mount, check local storage for existing session
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole as UserRole);
      setIsAuthenticated(true);
    } else {
      // Redirect to login if not authenticated
      setLocation('/login');
    }
  }, [setLocation]);

  // Login function
  const login = async (selectedRole: UserRole, password?: string): Promise<boolean> => {
    if (selectedRole === 'viewer') {
      setRole('viewer');
      setIsAuthenticated(true);
      localStorage.setItem('userRole', 'viewer');
      return true;
    } 
    
    if (selectedRole === 'admin') {
      if (!password) {
        toast({
          title: "Password Required",
          description: "Please enter the admin password",
          variant: "destructive",
        });
        return false;
      }

      try {
        // Verify password against hash
        const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        
        if (isMatch) {
          setRole('admin');
          setIsAuthenticated(true);
          localStorage.setItem('userRole', 'admin');
          return true;
        } else {
          toast({
            title: "Invalid Password",
            description: "The password you entered is incorrect",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error("Password verification error:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem with authentication",
          variant: "destructive",
        });
        return false;
      }
    }

    return false;
  };

  // Logout function
  const logout = () => {
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userRole');
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}