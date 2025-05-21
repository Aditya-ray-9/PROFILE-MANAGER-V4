import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { insertProfileSchema } from "@shared/schema";
import { z } from "zod";
import ProfileForm from "./ProfileForm";
import DocumentsForm from "@/components/ui/file-uploader";
import MultiStep from "@/components/ui/multi-step";

// Extend profile schema for client-side validation
// Override the email validation to make it optional
const profileFormSchema = insertProfileSchema.extend({
  email: z.string().email("Invalid email address").optional(),
  confirmEmail: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: number | null;
}

export default function AddProfileModal({ 
  isOpen, 
  onClose,
  profileId = null
}: AddProfileModalProps) {
  const [step, setStep] = useState(0);
  const queryClient = useQueryClient();
  const isEditing = profileId !== null;
  
  // Set up form
  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profileId: "",
      specialId: "",
      description: "",
      isFavorite: false,
      isArchived: false
    }
  });
  
  // Fetch profile data if editing
  const { data: profileData, isLoading } = useQuery({
    queryKey: [`/api/profiles/${profileId}`],
    enabled: isEditing && isOpen,
  });
  
  // Update form values when profile data is loaded
  useEffect(() => {
    if (profileData && typeof profileData === 'object') {
      // Reset form with profile data, using type assertion to handle the data
      const profile = profileData as any;
      const formData: ProfileFormValues = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        profileId: profile.profileId || "",
        specialId: profile.specialId || "",
        description: profile.description || "",
        isFavorite: Boolean(profile.isFavorite),
        isArchived: Boolean(profile.isArchived)
      };
      methods.reset(formData);
    }
  }, [profileData, methods]);
  
  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Remove confirmEmail field before submission
      const { confirmEmail, ...profileData } = data;
      const res = await apiRequest("POST", "/api/profiles", profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Profile created",
        description: "The profile has been created successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!profileId) return null;
      
      // Remove confirmEmail field before submission
      const { confirmEmail, ...profileData } = data;
      const res = await apiRequest("PUT", `/api/profiles/${profileId}`, profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
      }
      toast({
        title: "Profile updated",
        description: "The profile has been updated successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (data: ProfileFormValues) => {
    if (isEditing) {
      updateProfileMutation.mutate(data);
    } else {
      createProfileMutation.mutate(data);
    }
  };
  
  // Handle next step
  const handleNextStep = async () => {
    // Validate only fields relevant to the current step
    let fieldsToValidate: string[] = [];
    
    if (step === 0) {
      // Only first and last name are required
      fieldsToValidate = ['firstName', 'lastName'];
    } else if (step === 1) {
      // No required validation for contact details
      fieldsToValidate = [];
    }
    
    // Validate only the relevant fields
    const isValid = fieldsToValidate.length === 0 ? true : await methods.trigger(fieldsToValidate as any);
    
    if (isValid) {
      if (step < 2) {
        setStep(step + 1);
      } else {
        // Submit form on last step
        methods.handleSubmit(onSubmit)();
      }
    } else {
      console.log('Validation errors:', methods.formState.errors);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  // Handle close
  const handleClose = () => {
    methods.reset();
    setStep(0);
    onClose();
  };
  
  // Steps configuration
  const steps = [
    {
      title: "Basic Info",
      description: "Enter profile details",
      content: <ProfileForm />
    },
    {
      title: "Contact Details",
      description: "Add contact information",
      content: <ProfileForm contactDetails />
    },
    {
      title: "Documents",
      description: "Attach relevant files",
      content: <DocumentsForm />
    }
  ];
  
  // Loading state
  if (isEditing && isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Profile" : "Add New Profile"}
          </DialogTitle>
        </DialogHeader>
        
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            {/* Progress Steps */}
            <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded ${step === 0 ? 'bg-neon-100 text-neon-600 dark:bg-neon-900 dark:text-neon-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  Basic Info
                </div>
                <div className={`px-3 py-1 rounded ${step === 1 ? 'bg-neon-100 text-neon-600 dark:bg-neon-900 dark:text-neon-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  Contact Details
                </div>
                <div className={`px-3 py-1 rounded ${step === 2 ? 'bg-neon-100 text-neon-600 dark:bg-neon-900 dark:text-neon-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  Documents
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Step {step + 1} of 3</span>
            </div>
          </div>
            
            {/* Form Content */}
            <div className="overflow-y-auto px-6 flex-1">
              {steps[step].content}
            </div>
            
            {/* Footer Actions */}
            <DialogFooter className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <div className="flex w-full justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                
                <div className="flex space-x-2">
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                    >
                      Previous
                    </Button>
                  )}
                  
                  {step < 2 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => onSubmit(methods.getValues())}
                      disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2"
                    >
                      {isEditing ? "Save Changes" : "Create Profile"}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
