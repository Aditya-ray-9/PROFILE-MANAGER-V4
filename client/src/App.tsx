import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/home";
import Profiles from "./pages/profiles";
import Favorites from "./pages/favorites";
import Archived from "./pages/archived";
import Settings from "./pages/settings";
import Login from "./pages/login";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  return isAuthenticated ? <Component /> : null;
}

function Router() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Don't wrap login page in MainLayout
  if (location === "/login") {
    return (
      <Switch>
        <Route path="/login" component={Login} />
      </Switch>
    );
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={() => <ProtectedRoute component={Profiles} />} />
        <Route path="/favorites" component={() => <ProtectedRoute component={Favorites} />} />
        <Route path="/archived" component={() => <ProtectedRoute component={Archived} />} />
        <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
