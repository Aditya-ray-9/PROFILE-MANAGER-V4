import { useQuery } from "@tanstack/react-query";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const authContext = useAuthContext();
  
  // Get the current authenticated user from the server
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: authContext.isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...authContext,
    currentUser,
    isLoading,
  };
}