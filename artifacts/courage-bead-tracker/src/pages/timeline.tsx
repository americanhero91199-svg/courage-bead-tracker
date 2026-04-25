import { useMemo, useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useBeadStore } from "@/hooks/use-bead-store";
import { BeadIcon } from "@/components/bead";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Calendar, Edit2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import type { Bead } from "@/lib/types";

type Item =
  | { kind: "month"; key: string; label: string; y: number }
  | { kind: "bead"; key: string; bead: Bead; xPct: number; y: number; index: number };

const ROW_HEIGHT = 116;
const MONTH_HEIGHT = 64;
const TOP_PADDING = 56;
const BOTTOM_PADDING = 96;
const X_AMPLITUDE = 32; // % from center
const X_CENTER = 50; // %

export default function Timeline() {
  const { beads } = useBeadStore();
  const [, setLocation] = useLocation();
  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Chronological order (oldest first) so the timeline reads top-to-bottom in time.
  const chronological = useMemo(
    () =>
      [...beads].sort(
        (a, b) =>
          new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime(),
      ),
    [beads],
  );

  const { items, totalHeight, beadPoints } = useMemo(() => {
    const items: Item[] = [];
    let y = TOP_PADDING;
    let lastMonth = "";

    chronological.forEach((bead, index) => {
      const monthKey = format(parseISO(bead.earnedAt), "MMMM yyyy");
      if (monthKey !== lastMonth) {
        items.push({
          kind: "month",
          key: `month-${monthKey}-${index}`,
          label: monthKey,
          y: y + MONTH_HEIGHT / 2,
        });
        y += MONTH_HEIGHT;
        lastMonth = monthKey;
      }

      // Sine-based winding x position. Offset so even single-month strings curve.
      const xPct =
        X_CENTER + Math.sin(index * 0.85 + 0.4) * X_AMPLITUDE;

      items.push({
        kind: "bead",
        key: bead.id,
        bead,
        xPct,
        y: y + ROW_HEIGHT / 2,
        index,
      });
      y += ROW_HEIGHT;
    });

    const beadPoints = items.flatMap((it) =>
      it.kind === "bead" ? [{ x: it.xPct, y: it.y }] : [],
    );

    return {
      items,
      totalHeight: y + BOTTOM_PADDING,
      beadPoints,
    };
  }, [chronological]);

  // Build a smooth path through bead points using quadratic curves toward center.
  const pathD = useMemo(() => {
    if (beadPoints.length === 0) return "";
    if (beadPoints.length === 1) {
      const p = beadPoints[0];
      return `M ${p.x} ${p.y - 30} L ${p.x} ${p.y + 30}`;
    }
    let d = `M ${beadPoints[0].x} ${beadPoints[0].y}`;
    for (let i = 1; i < beadPoints.length; i++) {
      const prev = beadPoints[i - 1];
      const curr = beadPoints[i];
      const midY = (prev.y + curr.y) / 2;
      // Control point pulls the curve toward center for a flowing S-shape.
      d += ` Q ${X_CENTER} ${midY} ${curr.x} ${curr.y}`;
    }
    return d;
  }, [beadPoints]);

  // Show a "scroll to top" pill once the user scrolls down past the first screenful.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => {
      setShowScrollTop(main.scrollTop > 480);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Themed scrollable surface that matches the share card aesthetic */}
      <div
        className="relative min-h-full"
        style={{
          background:
            "linear-gradient(180deg, #FFF8E5 0%, #FFEFD9 35%, #FFE3E2 70%, #FFD6E2 100%)",
          scrollBehavior: "smooth",
        }}
      >
        {/* Soft decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/3 -left-12 w-44 h-44 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="absolute bottom-10 -right-10 w-56 h-56 rounded-full bg-pink-300/25 blur-3xl" />
        </div>

        <div className="relative px-6 pt-6 pb-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Courage Timeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Every bead, every brave step — in order.
          </p>
        </div>

        {chronological.length === 0 ? (
          <div className="relative px-6 py-16">
            <div className="rounded-3xl bg-white/70 border border-white/80 backdrop-blur p-8 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">
                Your path begins here
              </h3>
              <p className="text-muted-foreground mb-6">
                Add a bead and watch the journey wind down the page.
              </p>
              <Button
                onClick={() => setLocation("/add")}
                size="lg"
                className="rounded-2xl"
              >
                Add the first bead
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="relative w-full"
            style={{ height: totalHeight }}
            data-testid="timeline-canvas"
          >
            {/* Winding path */}
            <svg
              aria-hidden
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 100 ${totalHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="timeline-stroke"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#F8B5C5" />
                  <stop offset="100%" stopColor="#ED5773" />
                </linearGradient>
              </defs>
              <path
                d={pathD}
                fill="none"
                stroke="url(#timeline-stroke)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="2 6"
                vectorEffect="non-scaling-stroke"
                opacity={0.7}
              />
            </svg>

            {/* Items overlay */}
            {items.map((it) =>
              it.kind === "month" ? (
                <MonthMarker key={it.key} y={it.y} label={it.label} />
              ) : (
                <BeadDot
                  key={it.key}
                  bead={it.bead}
                  xPct={it.xPct}
                  y={it.y}
                  index={it.index}
                  onTap={() => setSelectedBead(it.bead)}
                />
              ),
            )}
          </div>
        )}

        {/* Scroll to top */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              type="button"
              onClick={scrollToTop}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="fixed bottom-28 right-6 z-30 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <BeadDetailDialog
        bead={selectedBead}
        onOpenChange={(open) => !open && setSelectedBead(null)}
        onEdit={(id) => {
          setSelectedBead(null);
          setLocation(`/add/${id}`);
        }}
      />
    </Layout>
  );
}

function MonthMarker({ y, label }: { y: number; label: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ top: y }}
    >
      <div className="flex items-center gap-2 bg-white/85 backdrop-blur px-4 py-1.5 rounded-full border border-primary/15 shadow-sm">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          {label}
        </span>
      </div>
    </div>
  );
}

function BeadDot({
  bead,
  xPct,
  y,
  index,
  onTap,
}: {
  bead: Bead;
  xPct: number;
  y: number;
  index: number;
  onTap: () => void;
}) {
  const isGlow = bead.colorName === "Glow";
  const dateLabel = format(parseISO(bead.earnedAt), "MMM d");
  // Alternate label side based on which side of the curve the bead is on.
  const labelSide = xPct >= X_CENTER ? "left" : "right";

  return (
    <motion.button
      type="button"
      onClick={onTap}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 18,
        delay: Math.min(index * 0.03, 0.5),
      }}
      whileTap={{ scale: 0.92 }}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
      style={{ left: `${xPct}%`, top: y }}
      aria-label={`${bead.colorName} bead — ${bead.reason}, ${format(parseISO(bead.earnedAt), "MMMM d, yyyy")}`}
    >
      <span className="block transition-transform group-hover:scale-110">
        <BeadIcon color={bead.color} size={56} isGlow={isGlow} />
      </span>
      {/* Date pill floating beside the bead */}
      <span
        className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-semibold text-foreground/70 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full border border-white shadow-sm ${
          labelSide === "left"
            ? "right-full mr-2"
            : "left-full ml-2"
        }`}
      >
        {dateLabel}
      </span>
    </motion.button>
  );
}

function BeadDetailDialog({
  bead,
  onOpenChange,
  onEdit,
}: {
  bead: Bead | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
}) {
  const isOpen = !!bead;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] sm:max-w-[400px] rounded-3xl border-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {bead ? `${bead.colorName} bead details` : "Bead details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {bead ? `${bead.reason} on ${bead.earnedAt}` : ""}
        </DialogDescription>

        {bead && (
          <>
            <div
              className="px-6 pt-7 pb-6 text-center"
              style={{
                background:
                  "linear-gradient(160deg, #FFF8E5 0%, #FFE3E2 100%)",
              }}
            >
              <div className="flex justify-center mb-4">
                <BeadIcon
                  color={bead.color}
                  size={96}
                  isGlow={bead.colorName === "Glow"}
                />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                {bead.colorName}
              </div>
              <h2 className="text-xl font-display font-bold text-foreground leading-tight">
                {bead.reason}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {format(parseISO(bead.earnedAt), "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            <div className="px-6 py-4 bg-card">
              {bead.notes ? (
                <p className="text-sm text-foreground/80 italic leading-relaxed text-center">
                  "{bead.notes}"
                </p>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  No notes for this bead.
                </p>
              )}
            </div>

            <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3 bg-card">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="rounded-2xl h-12"
              >
                Close
              </Button>
              <Button
                size="lg"
                onClick={() => onEdit(bead.id)}
                className="rounded-2xl h-12"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
