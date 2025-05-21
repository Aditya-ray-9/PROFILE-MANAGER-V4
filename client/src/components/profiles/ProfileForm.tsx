import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileFormValues } from "./AddProfileModal";
import { Separator } from "@/components/ui/separator";

interface ProfileFormProps {
  contactDetails?: boolean;
}

export default function ProfileForm({ contactDetails = false }: ProfileFormProps) {
  const { control, watch } = useFormContext<ProfileFormValues>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // Watch first and last name for avatar display
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  
  // Create initials for avatar fallback
  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  
  // Preview URL for uploaded photo
  const photoPreviewUrl = photoFile ? URL.createObjectURL(photoFile) : undefined;
  
  // Handle file change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };
  
  // Render basic info form
  if (!contactDetails) {
    return (
      <div className="space-y-6">
        {/* Profile Photo */}
        <div>
          <FormLabel>Profile Photo</FormLabel>
          <div className="flex items-center space-x-4 mt-2">
            <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-gray-700">
              <AvatarImage src={photoPreviewUrl} alt="Profile avatar" />
              <AvatarFallback className="text-3xl">{initials || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <label htmlFor="photo-upload">
                <Button type="button" variant="outline" asChild>
                  <span className="cursor-pointer">
                    <i className="ri-upload-2-line mr-2"></i>
                    Upload Photo
                  </span>
                </Button>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or GIF up to 2MB
              </p>
            </div>
          </div>
        </div>
        
        {/* First and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter first name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Last Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter last name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Profile ID and Special ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="profileId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Profile ID <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter profile ID" value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Custom ID for information purposes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="specialId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Special ID <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter special ID (min 2 chars)" value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Used for searching (minimum 2 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Description */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Add a description for this profile..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }
  
  // Render contact details form
  return (
    <div className="space-y-6">
      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email@example.com" value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="confirmEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Confirm email address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="(555) 123-4567" />
            </FormControl>
            <FormDescription>
              Optional - Include country code for international numbers
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <Separator />
      
      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Add a description for this profile..."
                rows={3}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
