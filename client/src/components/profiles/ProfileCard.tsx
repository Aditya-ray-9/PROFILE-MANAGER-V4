import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export interface ProfileCardProps {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileType: string;
  status: string;
  profilePicUrl?: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  documentCount?: number;
  onOpenEdit?: (id: number) => void;
}

export default function ProfileCard({
  id,
  firstName,
  lastName,
  email,
  phone,
  profileType,
  status,
  profilePicUrl,
  isFavorite,
  isArchived,
  createdAt,
  documentCount = 0,
  onOpenEdit
}: ProfileCardProps) {
  const queryClient = useQueryClient();
  
  // Format dates nicely
  const formattedDate = () => {
    try {
      const date = new Date(createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) return "Today";
      if (daysDiff === 1) return "Yesterday";
      if (daysDiff < 7) return `${daysDiff} days ago`;
      if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
      
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Unknown date";
    }
  };
  
  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/profiles/${id}/favorite`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/favorites"] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${firstName} ${lastName} has been ${isFavorite ? "removed from" : "added to"} your favorites.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update favorite status: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Toggle archive mutation
  const toggleArchiveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/profiles/${id}/archive`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/archived"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/favorites"] });
      toast({
        title: isArchived ? "Restored from archive" : "Moved to archive",
        description: `${firstName} ${lastName} has been ${isArchived ? "restored from archive" : "archived"}.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update archive status: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/archived"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/favorites"] });
      toast({
        title: "Profile deleted",
        description: `${firstName} ${lastName}'s profile has been permanently deleted.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete ${firstName} ${lastName}'s profile? This action cannot be undone.`)) {
      deleteProfileMutation.mutate();
    }
  };

  // Generate initials for avatar fallback
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  
  // Determine status badge color
  const getStatusBadgeVariant = () => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'outline';
      default: return 'secondary';
    }
  };
  
  // Determine profile type badge color
  const getProfileTypeBadgeVariant = () => {
    switch (profileType.toLowerCase()) {
      case 'client': return 'info';
      case 'partner': return 'indigo';
      case 'employee': return 'violet';
      default: return 'secondary';
    }
  };
  
  return (
    <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-0 rounded-none shadow-none border-b border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-700 shadow-sm">
              <AvatarImage src={profilePicUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-medium">{firstName} {lastName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: PRF-{id} • Added {formattedDate()}
                </p>
              </div>
              
              <div className="flex items-center space-x-1">
                <Badge variant={getStatusBadgeVariant() as any}>
                  {status}
                </Badge>
                <Badge variant={getProfileTypeBadgeVariant() as any}>
                  {profileType}
                </Badge>
              </div>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                <i className="ri-mail-line mr-1"></i>
                {email}
              </div>
              
              {phone && (
                <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <i className="ri-phone-line mr-1"></i>
                  {phone}
                </div>
              )}
              
              <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                <i className="ri-file-list-line mr-1"></i>
                {documentCount} Document{documentCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleToggleFavorite}
            >
              {isFavorite ? (
                <i className="ri-star-fill text-lg text-yellow-500"></i>
              ) : (
                <i className="ri-star-line text-lg text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"></i>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <i className="ri-more-2-fill text-lg text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"></i>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpenEdit && onOpenEdit(id)}>
                  <i className="ri-edit-line mr-2"></i> Edit
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => toggleArchiveMutation.mutate()}>
                  {isArchived ? (
                    <>
                      <i className="ri-inbox-unarchive-line mr-2"></i> Restore
                    </>
                  ) : (
                    <>
                      <i className="ri-archive-line mr-2"></i> Archive
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-400"
                >
                  <i className="ri-delete-bin-line mr-2"></i> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
