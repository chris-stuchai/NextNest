"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Plus,
  Trash2,
  Download,
  Share2,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";

interface Photo {
  id: string;
  room: string;
  caption: string | null;
  createdAt: string;
}

const roomOptions = [
  "Living Room", "Kitchen", "Bedroom", "Bathroom",
  "Hallway", "Closet", "Garage", "Patio/Balcony",
  "Laundry", "Other",
];

/** Move-out photo/video documentation page. */
export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCapture, setShowCapture] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("Living Room");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchPhotos() {
    try {
      const res = await fetch("/api/photos");
      const json = await res.json();
      if (json.data) setPhotos(json.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchPhotos(); }, []);

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please choose an image under 10 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: selectedRoom,
          caption: caption || null,
          imageData: base64,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error ?? "Upload failed. Please try again.");
        return;
      }

      setCaption("");
      setShowCapture(false);
      fetchPhotos();
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deletePhoto(id: string) {
    await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function exportAll() {
    const data = photos.map((p) => ({
      room: p.room,
      caption: p.caption,
      date: new Date(p.createdAt).toLocaleDateString(),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nextnest-moveout-photos-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const grouped = photos.reduce<Record<string, Photo[]>>((acc, p) => {
    if (!acc[p.room]) acc[p.room] = [];
    acc[p.room].push(p);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Move-Out Documentation</h1>
            <p className="text-sm text-muted-foreground">
              Photograph your place for proof of condition
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {photos.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportAll}>
              <Share2 className="h-3.5 w-3.5" /> Export
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={() => setShowCapture(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Photo
          </Button>
        </div>
      </div>

      {/* Capture modal */}
      <AnimatePresence>
        {showCapture && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">New Photo</h2>
              <button onClick={() => setShowCapture(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Room</p>
                <div className="flex flex-wrap gap-2">
                  {roomOptions.map((room) => (
                    <button
                      key={room}
                      onClick={() => setSelectedRoom(room)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedRoom === room
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                placeholder="Add a caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="h-10"
              />

              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleCapture}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading}
                  className="gap-2 flex-1"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {isUploading ? "Saving..." : "Take Photo"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (fileRef.current) {
                      fileRef.current.removeAttribute("capture");
                      fileRef.current.click();
                      fileRef.current.setAttribute("capture", "environment");
                    }
                  }}
                  disabled={isUploading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  From Gallery
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photos grid grouped by room */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-sm">No photos yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Document the condition of your place before moving out.
            This protects your security deposit.
          </p>
          <Button
            onClick={() => setShowCapture(true)}
            className="mt-4 gap-2 rounded-full"
            size="sm"
          >
            <Camera className="h-3.5 w-3.5" /> Start Documenting
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([room, roomPhotos]) => (
            <div key={room}>
              <h2 className="text-sm font-semibold mb-3">{room}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {roomPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative rounded-2xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Camera className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{photo.room}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(photo.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {photo.caption && (
                      <p className="mt-2 text-xs text-muted-foreground italic">
                        {photo.caption}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
