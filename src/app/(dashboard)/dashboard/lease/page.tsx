"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Calendar,
  DollarSign,
  ClipboardList,
  AlertTriangle,
  Trash2,
  Phone,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LeaseData {
  leaseEndDate?: string | null;
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  noticeRequired?: string | null;
  moveOutChecklist?: string[];
  cleaningRequirements?: string[];
  penalties?: string[];
  landlordContact?: string | null;
  utilities?: string[];
  keyReturnInstructions?: string | null;
  summary?: string | null;
}

interface LeaseDoc {
  id: string;
  fileName: string;
  status: string;
  extractedData: LeaseData | null;
  createdAt: string;
}

/** Lease upload and AI analysis page. */
export default function LeasePage() {
  const [docs, setDocs] = useState<LeaseDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchDocs() {
    try {
      const res = await fetch("/api/lease");
      const json = await res.json();
      if (json.data) setDocs(json.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchDocs(); }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const text = await file.text();

      const res = await fetch("/api/lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
      } else {
        fetchDocs();
      }
    } catch {
      setError("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const latestDoc = docs[0];
  const data = latestDoc?.extractedData as LeaseData | null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Lease Analyzer</h1>
          <p className="text-sm text-muted-foreground">
            Upload your lease and we'll extract everything you need to know
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-card p-8 text-center transition-colors hover:border-primary/30">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
          id="lease-upload"
        />
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Analyzing your lease with AI...</p>
            <p className="text-xs text-muted-foreground">
              Extracting dates, costs, and move-out requirements
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium mb-1">Drop your lease here or click to upload</p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports .txt, .pdf, .doc files
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 rounded-full"
            >
              <Upload className="h-4 w-4" />
              Upload Lease
            </Button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Extracted data display */}
      <AnimatePresence>
        {data && !data.summary?.includes("parseError") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {/* Summary */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  AI Summary
                </h2>
              </div>
              <p className="text-sm leading-relaxed">{data.summary}</p>
            </div>

            {/* Key facts grid */}
            <div className="grid gap-3 sm:grid-cols-3">
              {data.leaseEndDate && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <Calendar className="h-4 w-4 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Lease ends</p>
                  <p className="text-sm font-semibold mt-0.5">{data.leaseEndDate}</p>
                </div>
              )}
              {data.monthlyRent && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <DollarSign className="h-4 w-4 text-emerald-600 mb-2" />
                  <p className="text-xs text-muted-foreground">Monthly rent</p>
                  <p className="text-sm font-semibold mt-0.5">{formatCurrency(data.monthlyRent)}</p>
                </div>
              )}
              {data.securityDeposit && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <DollarSign className="h-4 w-4 text-amber-600 mb-2" />
                  <p className="text-xs text-muted-foreground">Security deposit</p>
                  <p className="text-sm font-semibold mt-0.5">{formatCurrency(data.securityDeposit)}</p>
                </div>
              )}
            </div>

            {data.noticeRequired && (
              <div className="rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Notice required: {data.noticeRequired}</p>
                  <p className="text-xs text-muted-foreground">
                    Make sure to give your landlord proper notice before moving
                  </p>
                </div>
              </div>
            )}

            {data.landlordContact && (
              <div className="rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Landlord contact</p>
                  <p className="text-sm font-medium">{data.landlordContact}</p>
                </div>
              </div>
            )}

            {/* Move-out checklist */}
            {data.moveOutChecklist && data.moveOutChecklist.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Move-Out Checklist (from your lease)</h3>
                </div>
                <div className="space-y-2">
                  {data.moveOutChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/30 px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cleaning requirements */}
            {data.cleaningRequirements && data.cleaningRequirements.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Cleaning Requirements</h3>
                </div>
                <div className="space-y-2">
                  {data.cleaningRequirements.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/30 px-4 py-3">
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="mt-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      )}
    </motion.div>
  );
}
