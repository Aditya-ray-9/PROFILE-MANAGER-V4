import { useState } from "react";
import ProfileList from "@/components/profiles/ProfileList";
import ProfileSearch, { FilterValues } from "@/components/profiles/ProfileSearch";

export default function Archived() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilter = (filterValues: FilterValues) => {
    setFilters(filterValues);
  };
  
  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Archive</h1>
        <ProfileSearch onSearch={handleSearch} onFilter={handleFilter} />
      </div>
      
      {/* Archived Profiles */}
      <ProfileList 
        apiEndpoint="/api/profiles/archived"
        title="Archived Profiles"
        emptyStateMessage="No archived profiles"
        query={searchQuery}
        filter={{ ...filters, includeArchived: true }}
      />
    </div>
  );
}
