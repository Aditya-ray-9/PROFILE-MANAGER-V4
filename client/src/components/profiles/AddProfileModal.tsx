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
const profileFormSchema = insertProfileSchema.extend({
  confirmEmail: z.string().email("Invalid email")
    .optional()
    .refine(data => !data || data === insertProfileSchema.shape.email, {
      message: "Emails don't match",
    }),
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
    if (profileData) {
      // Reset form with profile data
      methods.reset({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone || "",
        profileId: profileData.profileId || "",
        specialId: profileData.specialId || "",
        description: profileData.description || "",
        isFavorite: profileData.isFavorite,
        isArchived: profileData.isArchived
      });
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
    // Validate current step
    const isValid = await methods.trigger();
    if (isValid) {
      if (step < 2) {
        setStep(step + 1);
      } else {
        // Submit form on last step
        methods.handleSubmit(onSubmit)();
      }
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
            <MultiStep 
              steps={steps.map(s => ({ title: s.title, description: s.description }))} 
              currentStep={step} 
              className="mb-8 px-6"
            />
            
            {/* Form Content */}
            <div className="overflow-y-auto px-6 flex-1">
              {steps[step].content}
            </div>
            
            {/* Footer Actions */}
            <DialogFooter className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Previous
                </Button>
              )}
              
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
              >
                {step < 2 ? "Next Step" : (isEditing ? "Save Changes" : "Create Profile")}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
