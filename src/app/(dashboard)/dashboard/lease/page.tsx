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
  Phone,
  Zap,
  Clock,
  Key,
  Sparkles,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LeaseData {
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  noticeRequired?: string | null;
  moveOutChecklist?: string[];
  cleaningRequirements?: string[];
  penalties?: string[];
  landlordContact?: string | null;
  petDeposit?: number | null;
  utilities?: string[];
  keyReturnInstructions?: string | null;
  importantDates?: { date: string; description: string }[];
  summary?: string | null;
  parseError?: boolean;
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
  const [uploadProgress, setUploadProgress] = useState("");
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
    setUploadProgress("Reading file...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      setUploadProgress("AI is reading your lease...");

      const res = await fetch("/api/lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: base64,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
      } else {
        setUploadProgress("Done! Updating your plan...");
        await fetchDocs();
      }
    } catch {
      setError("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const latestDoc = docs.find((d) => d.status === "completed" && d.extractedData && !d.extractedData.parseError);
  const data = latestDoc?.extractedData;

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
            <p className="text-sm font-medium">{uploadProgress}</p>
            <p className="text-xs text-muted-foreground">
              Extracting dates, costs, and move-out requirements
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium mb-1">Drop your lease here or click to upload</p>
            <p className="text-xs text-muted-foreground mb-4">
              PDF, TXT, or DOC — we'll extract the key details
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
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {/* AI summary */}
            {data.summary && (
              <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">What We Found</h2>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{data.summary}</p>
              </div>
            )}

            {/* Key facts grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.leaseEndDate && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <Calendar className="h-4 w-4 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Lease ends</p>
                  <p className="text-base font-semibold mt-0.5">
                    {new Date(data.leaseEndDate).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              )}
              {data.monthlyRent != null && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <DollarSign className="h-4 w-4 text-emerald-600 mb-2" />
                  <p className="text-xs text-muted-foreground">Monthly rent</p>
                  <p className="text-base font-semibold mt-0.5">{formatCurrency(data.monthlyRent)}</p>
                </div>
              )}
              {data.securityDeposit != null && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-amber-600 mb-2" />
                  <p className="text-xs text-muted-foreground">Security deposit</p>
                  <p className="text-base font-semibold mt-0.5">{formatCurrency(data.securityDeposit)}</p>
                </div>
              )}
              {data.petDeposit != null && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <DollarSign className="h-4 w-4 text-violet-600 mb-2" />
                  <p className="text-xs text-muted-foreground">Pet deposit</p>
                  <p className="text-base font-semibold mt-0.5">{formatCurrency(data.petDeposit)}</p>
                </div>
              )}
            </div>

            {/* Critical alerts */}
            {data.noticeRequired && (
              <div className="rounded-2xl border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20 p-5 flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {data.noticeRequired} notice required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    This has been automatically added to your timeline. Make sure to give written notice.
                  </p>
                </div>
              </div>
            )}

            {data.landlordContact && (
              <div className="rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Landlord / property manager</p>
                  <p className="text-sm font-semibold">{data.landlordContact}</p>
                </div>
              </div>
            )}

            {/* Move-out checklist */}
            {Array.isArray(data.moveOutChecklist) && data.moveOutChecklist.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Move-Out Checklist</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  These tasks have been added to your timeline automatically.
                </p>
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
            {Array.isArray(data.cleaningRequirements) && data.cleaningRequirements.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Cleaning Requirements</h3>
                </div>
                <div className="space-y-2">
                  {data.cleaningRequirements.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/30 px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key return */}
            {data.keyReturnInstructions && (
              <div className="rounded-2xl border bg-card p-5 shadow-sm flex items-start gap-3">
                <Key className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Return</p>
                  <p className="text-sm mt-1">{data.keyReturnInstructions}</p>
                </div>
              </div>
            )}

            {/* Utilities */}
            {Array.isArray(data.utilities) && data.utilities.length > 0 && (
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Utilities You're Responsible For
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.utilities.map((util, i) => (
                    <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {util}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Penalties */}
            {Array.isArray(data.penalties) && data.penalties.length > 0 && (
              <div className="rounded-2xl border-l-4 border-l-destructive bg-destructive/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-destructive">Penalties to Avoid</h3>
                </div>
                <div className="space-y-2">
                  {data.penalties.map((penalty, i) => (
                    <p key={i} className="text-sm text-destructive/80">{penalty}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Data feeds notice */}
            <div className="rounded-2xl bg-muted/30 p-5 flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">This data is powering your entire plan</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lease dates, deposit info, and move-out tasks have been added to your Timeline.
                  Your AI Move Advisor knows your lease obligations and will reference them in advice.
                  Security deposit info has been added to your Budget.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No data state */}
      {!isLoading && !data && docs.length > 0 && docs[0].status === "completed" && docs[0].extractedData?.parseError && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-3" />
          <p className="text-sm font-medium">We couldn't fully parse your lease</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Try uploading a text-based PDF (not a scanned image). You can also copy-paste your lease text into a .txt file and upload that.
          </p>
        </div>
      )}

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
