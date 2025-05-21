import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { debounce } from "@/lib/utils";

interface ProfileSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterValues) => void;
}

// Define filter schema
const filterSchema = z.object({
  specialId: z.string().optional(),
  includeArchived: z.boolean().optional()
});

export type FilterValues = z.infer<typeof filterSchema>;

export default function ProfileSearch({ onSearch, onFilter }: ProfileSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Set up form
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      specialId: "",
      includeArchived: false
    }
  });
  
  // Debounced search handler
  const debouncedSearch = debounce((query: string) => {
    onSearch(query);
  }, 300);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };
  
  // Handle filter submit
  const handleFilterSubmit = (values: FilterValues) => {
    onFilter(values);
    setIsFilterOpen(false);
  };
  
  // Handle filter reset
  const handleFilterReset = () => {
    form.reset({
      specialId: "",
      includeArchived: false
    });
    onFilter({});
    setIsFilterOpen(false);
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <i className="ri-search-line text-gray-400"></i>
        </div>
        <Input
          type="text"
          placeholder="Search profiles by name or email..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="flex gap-2">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <i className="ri-filter-line mr-2 text-gray-500 dark:text-gray-400"></i>
              <span>Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Profiles</h4>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFilterSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="specialId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Search by Special ID"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleFilterReset}
                    >
                      Reset
                    </Button>
                    
                    <Button type="submit">Apply Filters</Button>
                  </div>
                </form>
              </Form>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button onClick={() => window.location.href = "/"}>
          <i className="ri-add-line mr-2"></i>
          <span>Add Profile</span>
        </Button>
      </div>
    </div>
  );
}
