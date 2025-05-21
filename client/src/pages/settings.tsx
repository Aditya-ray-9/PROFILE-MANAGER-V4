import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/hooks/use-theme";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [defaultSort, setDefaultSort] = useState("name-asc");
  
  // Settings mutation
  const settingsMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const res = await apiRequest("PUT", `/api/settings/${key}`, { value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle settings change
  const updateSetting = (key: string, value: any) => {
    settingsMutation.mutate({ key, value });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="appearance">
        <TabsList className="mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={theme === 'dark'}
                  onCheckedChange={() => toggleTheme()}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="accent-color" className="text-base mb-2 block">Accent Color</Label>
                <Select 
                  defaultValue="blue" 
                  onValueChange={(value) => updateSetting('accentColor', value)}
                >
                  <SelectTrigger id="accent-color" className="w-[200px]">
                    <SelectValue placeholder="Select accent color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Profile Settings */}
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Configure how profiles are displayed and managed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="items-per-page" className="text-base mb-2 block">Default Items Per Page</Label>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={itemsPerPage}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        const customValue = prompt("Enter custom number of items per page (minimum 6):");
                        if (customValue) {
                          const numValue = parseInt(customValue);
                          if (!isNaN(numValue) && numValue >= 6) {
                            setItemsPerPage(String(numValue));
                            updateSetting('defaultItemsPerPage', numValue);
                          } else {
                            toast({
                              title: "Invalid value",
                              description: "Please enter a number 6 or greater.",
                              variant: "destructive"
                            });
                          }
                        }
                      } else {
                        setItemsPerPage(value);
                        updateSetting('defaultItemsPerPage', parseInt(value));
                      }
                    }}
                  >
                    <SelectTrigger id="items-per-page" className="w-[150px]">
                      <SelectValue placeholder="Select items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 items</SelectItem>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="20">20 items</SelectItem>
                      <SelectItem value="30">30 items</SelectItem>
                      <SelectItem value="50">50 items</SelectItem>
                      <SelectItem value="custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {itemsPerPage !== "custom" ? `(${itemsPerPage} items per page)` : "(Custom value)"}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="default-sort" className="text-base mb-2 block">Default Sort Order</Label>
                <Select 
                  value={defaultSort}
                  onValueChange={(value) => {
                    setDefaultSort(value);
                    updateSetting('defaultSortOrder', value);
                  }}
                >
                  <SelectTrigger id="default-sort" className="w-[200px]">
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="date-added">Date Added</SelectItem>
                    <SelectItem value="last-updated">Last Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-archived" className="text-base">Show Archived by Default</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Include archived profiles in search results
                  </p>
                </div>
                <Switch 
                  id="show-archived" 
                  onCheckedChange={(checked) => updateSetting('showArchivedByDefault', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch 
                  id="email-notifications"
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium mb-2">Data Export</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Download all your profile data as a backup
                </p>
                <Button variant="outline">
                  <i className="ri-download-2-line mr-2"></i>
                  Export Data
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium mb-2 text-red-500 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Permanently delete all profiles and data
                </p>
                <Button variant="destructive">
                  <i className="ri-delete-bin-line mr-2"></i>
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
