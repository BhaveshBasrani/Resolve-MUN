"use client";

import React from "react";
import { AuthModal } from "@/components/AuthModal";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  return <AuthModal isOpen={true} onClose={handleClose} />;
}
