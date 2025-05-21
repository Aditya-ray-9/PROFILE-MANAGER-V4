import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [_, setLocation] = useLocation();
  
  // Redirect to profiles page
  useEffect(() => {
    setLocation("/");
  }, [setLocation]);
  
  return null;
}
