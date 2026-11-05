"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from "lucide-react";

export default function DynamicIslandAlert() {
  const [currentAlert, setCurrentAlert] = useState(null);
  const timerRef = useRef(null);

  const dismissAlert = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentAlert(null);
  }, []);

  const triggerAlert = useCallback((message, type = "info", duration = 4000, title = null) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Map common type strings to alertVariants
    let variant = "mono";
    let alertTitle = title;

    const lowerType = (type || "").toLowerCase();
    if (lowerType === "success") {
      variant = "success";
      if (!alertTitle) alertTitle = "Success";
    } else if (lowerType === "error" || lowerType === "destructive") {
      variant = "destructive";
      if (!alertTitle) alertTitle = "Notice";
    } else if (lowerType === "warning") {
      variant = "warning";
      if (!alertTitle) alertTitle = "Attention";
    } else if (lowerType === "info") {
      variant = "info";
      if (!alertTitle) alertTitle = "Update";
    } else {
      variant = "mono";
      if (!alertTitle) alertTitle = "Resolve MUN";
    }

    setCurrentAlert({
      id: Date.now(),
      message,
      title: alertTitle,
      type: lowerType,
      variant,
    });

    timerRef.current = setTimeout(() => {
      dismissAlert();
    }, duration || 4200);
  }, [dismissAlert]);

  useEffect(() => {
    // Bind globally so all existing alert triggers across the site seamlessly route here
    if (typeof window !== "undefined") {
      window.showCustomAlert = (msg, type, duration, title) => {
        triggerAlert(msg, type, duration, title);
      };
      window.showAlert = (msg, type, duration, title) => {
        triggerAlert(msg, type, duration, title);
      };

      const handleEvent = (e) => {
        if (e.detail) {
          triggerAlert(
            e.detail.message || e.detail.msg || "Notification",
            e.detail.type || "info",
            e.detail.duration,
            e.detail.title
          );
        }
      };

      window.addEventListener("resolve-alert", handleEvent);
      return () => {
        window.removeEventListener("resolve-alert", handleEvent);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [triggerAlert]);

  // Determine icon based on variant
  const getIcon = (variant) => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="size-4 text-emerald-400 stroke-[2.2]" />;
      case "destructive":
        return <AlertCircle className="size-4 text-red-400 stroke-[2.2]" />;
      case "warning":
        return <AlertTriangle className="size-4 text-amber-400 stroke-[2.2]" />;
      case "info":
        return <Info className="size-4 text-indigo-400 stroke-[2.2]" />;
      default:
        return <Sparkles className="size-4 text-zinc-300 stroke-[2.2]" />;
    }
  };

  return (
    <div
      id="dynamic-island-container"
      /* Anchored below the Notch Navigation Bar (Notch height is 44px, positioned at 52px so it never overlaps nav items) */
      className="fixed top-[48px] sm:top-[54px] left-1/2 -translate-x-1/2 z-[100000] pointer-events-none flex flex-col items-center justify-start select-none w-full max-w-lg px-4"
    >
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            key={currentAlert.id}
            initial={{
              opacity: 0,
              y: -24,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 440,
                damping: 28,
                mass: 0.8,
              },
            }}
            exit={{
              opacity: 0,
              y: -18,
              scale: 0.94,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }}
            className="pointer-events-auto relative w-full sm:w-auto min-w-[280px] max-w-md"
          >
            {/* Dynamic Island Pill Shell - 100% opaque obsidian so nothing behind bleeds through */}
            <div className="relative overflow-hidden rounded-[20px] bg-[#07080c] border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.96),0_4px_16px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] px-4 py-2.5">
              <Alert
                variant={currentAlert.variant}
                appearance="solid"
                size="sm"
                close={true}
                onClose={dismissAlert}
                className="border-none !bg-transparent p-0 text-white gap-3 items-center shadow-none"
              >
                <AlertIcon className="flex items-center justify-center p-1.5 rounded-full bg-white/[0.08] border border-white/10 shrink-0">
                  {getIcon(currentAlert.variant)}
                </AlertIcon>

                <AlertContent className="grow space-y-0.5 pr-2">
                  {currentAlert.title && (
                    <AlertTitle className="text-[11px] uppercase font-extrabold tracking-wider text-white">
                      {currentAlert.title}
                    </AlertTitle>
                  )}
                  <AlertDescription className="text-xs text-zinc-300 leading-snug font-medium font-sans">
                    {currentAlert.message}
                  </AlertDescription>
                </AlertContent>
              </Alert>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
