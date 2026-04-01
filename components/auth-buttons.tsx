"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function SignIn() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (provider: "github" | "google" | "apple") => {
    setLoading(true);
    try {
      await authClient.signIn.social({ provider });
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  return (
    <Button
      onClick={() => handleSignIn("github")}
      disabled={loading}
      className={cn("w-40")}
    >
      {loading ? "Signing in" : "Sign in with Github"}
    </Button>
  );
}

export function SignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      window.location.reload();
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSignOut} disabled={loading} className={cn("w-28")}>
      {loading ? "Signing out" : "Sign out"}
    </Button>
  );
}
