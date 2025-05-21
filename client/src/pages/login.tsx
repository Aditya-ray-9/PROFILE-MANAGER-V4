import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleViewerLogin = async () => {
    setIsLoading(true);
    try {
      const success = await login("viewer");
      if (success) {
        toast({
          title: "Login Successful",
          description: "You are now logged in as a Viewer",
        });
        setLocation("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login("admin", adminPassword);
      if (success) {
        toast({
          title: "Admin Login Successful",
          description: "You now have full access to the system",
        });
        setLocation("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <div className="h-12 w-12 rounded-full bg-neon-500 flex items-center justify-center text-white mb-2">
              <i className="ri-user-3-line text-xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Profile Manager</CardTitle>
          <CardDescription className="text-center">
            Choose how you want to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="viewer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="viewer">Viewer Access</TabsTrigger>
              <TabsTrigger value="admin">Admin Access</TabsTrigger>
            </TabsList>
            <TabsContent value="viewer">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Viewer access allows you to browse profiles but not make any changes
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleViewerLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Continue as Viewer"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin access gives you full control to add, edit, and delete profiles
                  </p>
                </div>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isLoading || !adminPassword}
                >
                  {isLoading ? "Verifying..." : "Login as Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            By continuing, you agree to the terms of service and privacy policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}