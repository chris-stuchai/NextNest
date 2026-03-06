"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface LeaseUploadStepProps {
  onLeaseData: (data: { fileData: string; fileName: string; fileType: string; fileSize: number } | null) => void;
  onNext: () => void;
  onBack: () => void;
  hasLease: boolean;
}

/** Lease upload step within the intake wizard — optional but encouraged. */
export function LeaseUploadStep({ onLeaseData, onNext, onBack, hasLease }: LeaseUploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(hasLease);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large. Please choose a file under 20 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      onLeaseData({
        fileData: base64,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      setFileName(file.name);
      setUploaded(true);
    } catch {
      setError("Failed to read the file. Please try a different format.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Got a lease? Upload it.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Our AI will extract move-out dates, deposit info, and requirements — then build your plan around them. 
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFile}
        className="hidden"
      />

      {uploaded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-8 text-center"
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
          <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">Lease uploaded</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
            {fileName || "Your lease will be analyzed when we build your plan"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-emerald-600"
            onClick={() => fileRef.current?.click()}
          >
            Upload a different file
          </Button>
        </motion.div>
      ) : uploading ? (
        <div className="rounded-2xl border-2 border-dashed border-primary/30 p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Reading your lease...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-card p-8 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <Upload className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-base font-medium">Drop your lease here</p>
            <p className="text-sm text-muted-foreground mt-1">PDF, TXT, or DOC</p>
          </button>

          {/* Benefits list */}
          <div className="rounded-2xl bg-muted/30 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">What we'll extract:</p>
            </div>
            {[
              "Move-out date and notice deadlines",
              "Security deposit amount and recovery requirements",
              "Cleaning and inspection requirements",
              "Penalties to avoid",
              "Key return instructions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <FileText className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3" role="alert">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="gap-2 rounded-full px-6"
        >
          {uploaded ? "Build My Plan" : "Skip for now"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
