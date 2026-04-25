import React, { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBeadStore } from "@/hooks/use-bead-store";
import { ShareCard } from "@/components/share-card";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareCardDialog({ open, onOpenChange }: Props) {
  const { child, beads } = useBeadStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isWorking, setIsWorking] = useState<"download" | "share" | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date>(() => new Date());
  const { toast } = useToast();

  // Refresh the generated date every time the dialog opens.
  useEffect(() => {
    if (open) setGeneratedAt(new Date());
  }, [open]);

  const cardData = useMemo(() => {
    const totalBeads = beads.length;
    const recentBead = beads[0] ?? null;

    const colorCounts = beads.reduce(
      (acc, bead) => {
        const key = bead.colorName;
        if (!acc[key]) {
          acc[key] = {
            count: 0,
            color: bead.color,
            colorName: bead.colorName,
            isGlow: bead.colorName === "Glow",
          };
        }
        acc[key].count++;
        return acc;
      },
      {} as Record<
        string,
        {
          count: number;
          color: string;
          colorName: string;
          isGlow: boolean;
        }
      >,
    );

    const favoriteBead =
      Object.values(colorCounts).sort((a, b) => b.count - a.count)[0] ?? null;

    const uniqueByColor = new Map<
      string,
      { color: string; isGlow: boolean }
    >();
    for (const bead of beads) {
      if (!uniqueByColor.has(bead.color)) {
        uniqueByColor.set(bead.color, {
          color: bead.color,
          isGlow: bead.colorName === "Glow",
        });
      }
    }
    const scatterBeads =
      uniqueByColor.size > 0
        ? Array.from(uniqueByColor.values())
        : [
            { color: "#e81c24", isGlow: false },
            { color: "#ffe600", isGlow: false },
            { color: "#005baa", isGlow: false },
            { color: "#1fa12e", isGlow: false },
            { color: "#8a2be2", isGlow: false },
          ];

    return { totalBeads, recentBead, favoriteBead, scatterBeads };
  }, [beads]);

  const childName = child?.name ?? "";
  const fileName = useMemo(() => {
    const safeName = childName.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "courage";
    return `${safeName}-courage-beads.png`;
  }, [childName]);

  async function generatePng(): Promise<{ dataUrl: string; blob: Blob } | null> {
    if (!cardRef.current) return null;
    // Wait a tick so the freshly mounted card has finished layout/paint.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 1,
      cacheBust: true,
      skipFonts: true,
      backgroundColor: "#FFF8E5",
      width: 1080,
      height: 1350,
      style: {
        transform: "none",
      },
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { dataUrl, blob };
  }

  async function handleDownload() {
    try {
      setIsWorking("download");
      const result = await generatePng();
      if (!result) return;
      const link = document.createElement("a");
      link.href = result.dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Card saved",
        description: "Your share card was downloaded.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Couldn't create the card",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWorking(null);
    }
  }

  async function handleShare() {
    try {
      setIsWorking("share");
      const result = await generatePng();
      if (!result) return;

      const file = new File([result.blob], fileName, { type: "image/png" });
      const shareData: ShareData = {
        title: "Courage Beads",
        text: childName
          ? `${childName} has earned ${cardData.totalBeads} Beads of Courage.`
          : "Beads of Courage progress.",
        files: [file],
      };

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare(shareData) &&
        typeof navigator.share === "function"
      ) {
        await navigator.share(shareData);
      } else {
        // Fallback to download
        const link = document.createElement("a");
        link.href = result.dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Sharing not supported",
          description: "Card downloaded instead so you can share it manually.",
        });
      }
    } catch (e) {
      const err = e as { name?: string };
      if (err?.name === "AbortError") {
        // User cancelled — no toast needed.
      } else {
        console.error(e);
        toast({
          title: "Couldn't share the card",
          description: "Please try downloading it instead.",
          variant: "destructive",
        });
      }
    } finally {
      setIsWorking(null);
    }
  }

  if (!child) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 max-w-[95vw] sm:max-w-[480px] max-h-[92dvh] overflow-hidden rounded-3xl border-0"
      >
        <DialogTitle className="sr-only">Share courage card</DialogTitle>
        <DialogDescription className="sr-only">
          Preview, download, or share a card celebrating {childName}'s Beads of
          Courage progress.
        </DialogDescription>

        <div className="flex items-center justify-between px-5 pt-4 pb-2 pr-12">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Share their courage
            </h2>
            <p className="text-xs text-muted-foreground">
              A keepsake to send to family.
            </p>
          </div>
        </div>

        {/* Visible preview (scaled down) */}
        <div className="px-5 pb-3 overflow-y-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border/40 bg-muted/30 mx-auto"
            style={{ width: "100%", aspectRatio: "1080 / 1350" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 1080,
                  height: 1350,
                  transform: "scale(var(--share-card-scale, 0.4))",
                  transformOrigin: "top left",
                }}
                ref={(node) => {
                  if (!node) return;
                  const update = () => {
                    const parent = node.parentElement;
                    if (!parent) return;
                    const scale = parent.clientWidth / 1080;
                    node.style.setProperty("--share-card-scale", String(scale));
                    node.style.width = `${1080 * scale}px`;
                    node.style.height = `${1350 * scale}px`;
                  };
                  update();
                  const ro = new ResizeObserver(update);
                  ro.observe(node.parentElement!);
                  (node as unknown as { __ro?: ResizeObserver }).__ro = ro;
                }}
              >
                <ShareCard
                  ref={cardRef}
                  childName={childName}
                  totalBeads={cardData.totalBeads}
                  favoriteBead={cardData.favoriteBead}
                  recentBead={cardData.recentBead}
                  generatedAt={generatedAt}
                  scatterBeads={cardData.scatterBeads}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-3 bg-card">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDownload}
            disabled={isWorking !== null}
            className="rounded-2xl text-base h-14"
          >
            {isWorking === "download" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Download
          </Button>
          <Button
            size="lg"
            onClick={handleShare}
            disabled={isWorking !== null}
            className="rounded-2xl text-base h-14"
          >
            {isWorking === "share" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5 mr-2" />
            )}
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
