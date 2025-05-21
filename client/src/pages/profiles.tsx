import { useState } from "react";
import ProfileList from "@/components/profiles/ProfileList";
import ProfileSearch, { FilterValues } from "@/components/profiles/ProfileSearch";

export default function Profiles() {
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
        <h1 className="text-2xl font-bold">All Profiles</h1>
        <ProfileSearch onSearch={handleSearch} onFilter={handleFilter} />
      </div>
      
      {/* Profile List */}
      <ProfileList 
        apiEndpoint="/api/profiles"
        title="All Profiles"
        emptyStateMessage="No profiles yet"
        query={searchQuery}
        filter={filters}
      />
    </div>
  );
}
