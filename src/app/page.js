"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Loader from "@/components/Loader";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth to finish loading before allowing redirect
  useEffect(() => {
    if (!loading) {
      setAuthReady(true);
    }
  }, [loading]);

  const handleLoaderFinish = useCallback(() => {
    setShowLoader(false);
  }, []);

  // Redirect after loader finishes AND auth is ready
  useEffect(() => {
    if (!showLoader && authReady) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [showLoader, authReady, user, router]);

  if (showLoader || loading) {
    return <Loader message="Initializing TasksPro..." onFinish={handleLoaderFinish} />;
  }

  return null;
}
