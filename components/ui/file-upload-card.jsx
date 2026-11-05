"use client";

import * as React from "react";
import { UploadCloud, X, File as FileIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const FileUploadCard = React.forwardRef(
  (
    {
      className,
      files = [],
      onFilesChange,
      onFileRemove,
      onClose,
      title,
      subtitle,
      hint = "PNG, JPG, WebP, or PDF (Max 15 MB)",
      accept = "image/*,application/pdf",
      multiple = false,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files || []);
      if (droppedFiles.length > 0) {
        onFilesChange(multiple ? droppedFiles : [droppedFiles[0]]);
      }
    };

    const handleFileSelect = (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        onFilesChange(multiple ? selectedFiles : [selectedFiles[0]]);
      }
      if (e.target) e.target.value = "";
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
      <div
        ref={ref}
        className={cn("w-full select-none", className)}
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileSelect}
        />

        {files.length === 0 ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={cn(
              "group relative flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-3.5 text-center transition-all duration-150",
              isDragging
                ? "border-white bg-white/10"
                : "border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]"
            )}
          >
            <div className="flex items-center gap-2 text-white/90">
              <UploadCloud className="h-4 w-4 shrink-0 text-white/70 group-hover:text-white group-hover:scale-110 transition-transform" />
              <span className="text-[13px] font-medium tracking-tight">
                Click to browse or drag &amp; drop
              </span>
            </div>
            <p className="!m-0 mt-1 text-[11px] text-white/45 font-mono">
              {hint}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {files.map((fileObj) => {
                const isImage = fileObj.file.type?.startsWith("image/");
                return (
                  <motion.div
                    key={fileObj.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-[#0e0e0e] p-2.5 sm:p-3 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white">
                        {isImage ? (
                          <UploadCloud className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <FileIcon className="h-5 w-5 text-white/80" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="!m-0 text-xs sm:text-[13px] font-semibold text-white truncate max-w-[220px] sm:max-w-xs">
                          {fileObj.file.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-white/55 mt-0.5 font-mono">
                          <span>{formatFileSize(fileObj.file.size)}</span>
                          <span>•</span>
                          {fileObj.status === "completed" ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-sans font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              Attached
                            </span>
                          ) : fileObj.status === "error" ? (
                            <span className="flex items-center gap-1 text-rose-400 font-sans font-medium">
                              <AlertCircle className="h-3 w-3" />
                              Error
                            </span>
                          ) : (
                            <span className="text-white/70 font-sans">Ready</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={triggerFileSelect}
                        className="h-7 px-2.5 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileRemove(fileObj.id);
                        }}
                        className="h-7 w-7 rounded-md text-white/50 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }
);
FileUploadCard.displayName = "FileUploadCard";
