import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "All Profiles", path: "/", icon: "ri-dashboard-line" },
  { label: "Favorites", path: "/favorites", icon: "ri-star-line" },
  { label: "Archived", path: "/archived", icon: "ri-archive-line" },
  { label: "Settings", path: "/settings", icon: "ri-settings-3-line" },
];

export default function Sidebar({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) {
  const [location] = useLocation();
  const { theme } = useTheme();

  const handleClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

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
            <p className="text-sm text-gray-500 dark:text-gray-400">Organize and manage profiles</p>
          </div>
        </div>

        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
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
        <div className="flex items-center space-x-3 py-3">
          <i className="ri-question-line text-lg text-gray-500 dark:text-gray-400"></i>
          <a href="#" className="text-sm text-neon-600 dark:text-neon-400 hover:underline">View documentation</a>
        </div>
      </div>
    </aside>
  );
}
