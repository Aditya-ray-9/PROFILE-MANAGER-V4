import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "All Profiles", path: "/", icon: "ri-dashboard-line" },
  { label: "Favorites", path: "/favorites", icon: "ri-star-line" },
  { label: "Archived", path: "/archived", icon: "ri-archive-line" },
  { label: "Settings", path: "/settings", icon: "ri-settings-3-line", adminOnly: true },
];

export default function Sidebar({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) {
  const [location] = useLocation();
  const { theme } = useTheme();
  const { role, logout } = useAuth();

  const handleClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Filter menu items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <aside className={cn(
      "w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
      isMobile ? "fixed inset-y-0 left-0 z-50 w-72 transition-all transform duration-300 ease-in-out shadow-2xl" : "hidden md:block"
    )}>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-neon-100 dark:bg-neon-900 flex items-center justify-center">
            <i className="ri-user-3-line text-neon-600 dark:text-neon-400 text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Profile Manager</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {role === 'admin' ? 'Admin Access' : 'Viewer Access'}
            </p>
          </div>
        </div>

        <nav>
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a
                    onClick={handleClick}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg",
                      location === item.path
                        ? "bg-neon-50 dark:bg-gray-700 text-neon-600 dark:text-neon-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <i className={cn(item.icon, "text-lg")}></i>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="px-4 py-2 absolute bottom-0 w-64 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <i className="ri-logout-box-line text-lg text-gray-500 dark:text-gray-400"></i>
            <button 
              onClick={logout}
              className="text-sm text-neon-600 dark:text-neon-400 hover:underline"
            >
              Logout
            </button>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {role === 'admin' ? 'Admin' : 'Viewer'}
          </div>
        </div>
      </div>
    </aside>
  );
}
