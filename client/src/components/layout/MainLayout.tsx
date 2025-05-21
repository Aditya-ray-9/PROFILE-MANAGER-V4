import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased transition-colors">
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 border-r border-gray-200 dark:border-gray-700">
            <Sidebar isMobile onClose={() => setIsMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-10">
          <Button 
            onClick={toggleMobileSidebar} 
            className="rounded-full p-3 bg-neon-500 hover:bg-neon-600 text-white shadow-lg"
          >
            <i className="ri-menu-line text-xl"></i>
          </Button>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
