import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProfileCard from "./ProfileCard";
import AddProfileModal from "./AddProfileModal";
import EmptyState from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileListProps {
  apiEndpoint: string;
  title: string;
  emptyStateMessage: string;
  query?: string;
  filter?: Record<string, any>;
}

export default function ProfileList({
  apiEndpoint,
  title,
  emptyStateMessage,
  query = "",
  filter = {}
}: ProfileListProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProfileId, setEditProfileId] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  
  // All users are considered admins now
  const isAdmin = true;
  
  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString()
    });
    
    if (query) params.append("query", query);
    
    // Add filter parameters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  };
  
  // Fetch profiles data
  interface ProfilesResponse {
    profiles: Array<{
      id: number;
      profileId: string;
      specialId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      description?: string;
      profilePicUrl?: string;
      isFavorite: boolean;
      isArchived: boolean;
      createdAt: string;
    }>;
    total: number;
  }
  
  const { data, isLoading, isError } = useQuery<ProfilesResponse>({
    queryKey: [`${apiEndpoint}?${buildQueryParams()}`]
  });
  
  // Handle pagination change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Handle per page change
  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value));
    setPage(1); // Reset to first page when changing items per page
  };
  
  // Handle edit profile
  const handleOpenEdit = (id: number) => {
    setEditProfileId(id);
    setIsAddModalOpen(true);
  };
  
  // Close modal and reset edit state
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditProfileId(null);
  };
  
  // Loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-red-500 text-4xl mb-4">
          <i className="ri-error-warning-line"></i>
        </div>
        <h3 className="text-xl font-medium mb-2">Error Loading Profiles</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          We encountered a problem while loading the profiles. Please try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-neon-500 text-white rounded-lg hover:bg-neon-600"
        >
          Refresh
        </button>
      </div>
    );
  }
  
  // Determine if we have profiles or need to show empty state
  const profiles = data?.profiles || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / perPage);
  const showEmptyState = profiles.length === 0;
  
  // Calculate pagination values
  const startIndex = (page - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + perPage - 1, total);
  
  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-neon-500 hover:bg-neon-600 text-white rounded-lg transition-colors"
          >
            <i className="ri-add-line mr-2"></i>
            <span>Add Profile</span>
          </button>
        )}
      </div>
      
      {/* Profiles List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* View options and sort */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewType("grid")}
              className={`p-1.5 rounded ${viewType === "grid" ? "bg-gray-100 dark:bg-gray-700 text-neon-600 dark:text-neon-400" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
            >
              <i className="ri-layout-grid-line text-lg"></i>
            </button>
            <button 
              onClick={() => setViewType("list")}
              className={`p-1.5 rounded ${viewType === "list" ? "bg-gray-100 dark:bg-gray-700 text-neon-600 dark:text-neon-400" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
            >
              <i className="ri-list-check text-lg"></i>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            <Select defaultValue="name-asc" onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="text-sm bg-transparent border-0 focus:ring-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="date-added">Date Added</SelectItem>
                <SelectItem value="last-updated">Last Modified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Profiles or Empty State */}
        {showEmptyState ? (
          <EmptyState 
            message={emptyStateMessage}
            icon="ri-user-search-line"
            actionLabel={isAdmin ? "Add Your First Profile" : "No Profiles Available"}
            onAction={isAdmin ? () => setIsAddModalOpen(true) : () => {}}
            description={isAdmin ? "Create a new profile to get started" : "There are no profiles to view at this time"}
          />
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {profiles.map((profile: any) => (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                profileId={profile.profileId}
                specialId={profile.specialId}
                firstName={profile.firstName}
                lastName={profile.lastName}
                email={profile.email}
                phone={profile.phone}
                description={profile.description}
                profilePicUrl={profile.profilePicUrl || "/default-avatar.png"}
                isFavorite={profile.isFavorite}
                isArchived={profile.isArchived}
                createdAt={profile.createdAt}
                onOpenEdit={isAdmin ? handleOpenEdit : undefined}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!showEmptyState && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
              Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{total}</span> profiles
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    // Handle pagination display logic
                    let pageNumber: number;
                    if (totalPages <= 3) {
                      pageNumber = i + 1;
                    } else if (page <= 2) {
                      pageNumber = i + 1;
                    } else if (page >= totalPages - 1) {
                      pageNumber = totalPages - 2 + i;
                    } else {
                      pageNumber = page - 1 + i;
                    }
                    
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={page === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
      
      {/* Add/Edit Profile Modal */}
      <AddProfileModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        profileId={editProfileId}
      />
    </div>
  );
}
