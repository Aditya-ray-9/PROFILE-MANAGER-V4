import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export default function Header({ toggleMobileSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center px-4 h-16">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <button 
            onClick={toggleMobileSidebar}
            className="md:hidden h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm"
          >
            <i className="ri-menu-line"></i>
          </button>
          <div className="h-8 w-8 flex items-center justify-center bg-blue-600 text-white rounded shadow-sm">
            <i className="ri-user-line text-xl"></i>
          </div>
          <h1 className="text-xl font-semibold text-neon-600 dark:text-neon-400">Profile Manager</h1>
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
          
          {/* User Avatar */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-700">
                <AvatarImage src="/default-avatar.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium">
                User
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
