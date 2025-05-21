import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export default function Header({ toggleMobileSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { role } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center px-4 h-16">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="h-8 w-8 rounded bg-neon-500 flex items-center justify-center text-white">
            <i className="ri-user-3-line"></i>
          </div>
          <h1 className="text-xl font-semibold text-neon-600 dark:text-neon-400">NeonProfiles</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? (
              <i className="ri-sun-line text-xl"></i>
            ) : (
              <i className="ri-moon-line text-xl"></i>
            )}
          </Button>
          
          {/* Settings Icon (replacing Admin) */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-700">
                <AvatarImage src="/default-avatar.png" alt="User" />
                <AvatarFallback>
                  {role === 'admin' ? 'A' : 'V'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium">
                {role === 'admin' ? 'Admin' : 'Viewer'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
