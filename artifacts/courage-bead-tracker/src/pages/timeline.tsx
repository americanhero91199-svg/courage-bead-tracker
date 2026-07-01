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
import { JournalNoteDialog } from "@/components/journal-note-dialog";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Calendar,
  Edit2,
  Printer,
  Sparkles,
  BookHeart,
  Plus,
} from "lucide-react";
import { useLocation } from "wouter";
import type { Bead, JournalNote } from "@/lib/types";

type Item =
  | { kind: "month"; key: string; label: string; y: number }
  | {
      kind: "bead";
      key: string;
      bead: Bead;
      xPct: number;
      y: number;
      index: number;
    }
  | {
      kind: "note";
      key: string;
      note: JournalNote;
      xPct: number;
      y: number;
      index: number;
    };

const ROW_HEIGHT_BEAD = 116;
const ROW_HEIGHT_NOTE = 76;
const MONTH_HEIGHT = 64;
const TOP_PADDING = 56;
const BOTTOM_PADDING = 96;
const X_AMPLITUDE = 32; // % from center
const X_CENTER = 50; // %

type Entry =
  | { kind: "bead"; bead: Bead; date: number }
  | { kind: "note"; note: JournalNote; date: number };

export default function Timeline() {
  const { beads, notes, child } = useBeadStore();
  const [, setLocation] = useLocation();

  const handlePrint = () => { window.print(); };

  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);
  const [activeNote, setActiveNote] = useState<JournalNote | null>(null);
  const [editingNote, setEditingNote] = useState<JournalNote | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Combine beads + notes in chronological order (oldest first).
  const entries: Entry[] = useMemo(() => {
    const beadEntries: Entry[] = beads.map((b) => ({
      kind: "bead",
      bead: b,
      date: new Date(b.earnedAt).getTime(),
    }));
    const noteEntries: Entry[] = notes.map((n) => ({
      kind: "note",
      note: n,
      date: new Date(n.date).getTime(),
    }));
    return [...beadEntries, ...noteEntries].sort((a, b) => {
      if (a.date !== b.date) return a.date - b.date;
      // Tie-break: notes after beads on same day so the bead anchors the spot.
      if (a.kind !== b.kind) return a.kind === "bead" ? -1 : 1;
      return 0;
    });
  }, [beads, notes]);

  const { items, totalHeight, beadPoints } = useMemo(() => {
    const items: Item[] = [];
    let y = TOP_PADDING;
    let lastMonth = "";

    entries.forEach((entry, index) => {
      const dateIso =
        entry.kind === "bead" ? entry.bead.earnedAt : entry.note.date;
      const monthKey = format(parseISO(dateIso), "MMMM yyyy");
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

      const xPct = X_CENTER + Math.sin(index * 0.85 + 0.4) * X_AMPLITUDE;

      if (entry.kind === "bead") {
        items.push({
          kind: "bead",
          key: entry.bead.id,
          bead: entry.bead,
          xPct,
          y: y + ROW_HEIGHT_BEAD / 2,
          index,
        });
        y += ROW_HEIGHT_BEAD;
      } else {
        items.push({
          kind: "note",
          key: entry.note.id,
          note: entry.note,
          xPct,
          y: y + ROW_HEIGHT_NOTE / 2,
          index,
        });
        y += ROW_HEIGHT_NOTE;
      }
    });

    // Path connects through every interactive item (beads + notes) so notes
    // sit naturally on the winding line between beads.
    const beadPoints = items.flatMap((it) =>
      it.kind === "bead" || it.kind === "note"
        ? [{ x: it.xPct, y: it.y }]
        : [],
    );

    return {
      items,
      totalHeight: y + BOTTOM_PADDING,
      beadPoints,
    };
  }, [entries]);

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
      d += ` Q ${X_CENTER} ${midY} ${curr.x} ${curr.y}`;
    }
    return d;
  }, [beadPoints]);

  const dateRange = useMemo(() => {
    if (entries.length === 0) return null;
    const first = entries[0];
    const last = entries[entries.length - 1];
    const firstDate = first.kind === "bead" ? parseISO(first.bead.earnedAt) : parseISO(first.note.date);
    const lastDate = last.kind === "bead" ? parseISO(last.bead.earnedAt) : parseISO(last.note.date);
    if (firstDate.getFullYear() === lastDate.getFullYear() && firstDate.getMonth() === lastDate.getMonth()) {
      return format(firstDate, "MMMM yyyy");
    }
    return `${format(firstDate, "MMM yyyy")} – ${format(lastDate, "MMM yyyy")}`;
  }, [entries]);

  const printGroups = useMemo(() => {
    const groups: { label: string; entries: Entry[] }[] = [];
    let lastKey = "";
    for (const entry of entries) {
      const dateStr = entry.kind === "bead" ? entry.bead.earnedAt : entry.note.date;
      const key = format(parseISO(dateStr), "MMMM yyyy");
      if (key !== lastKey) {
        groups.push({ label: key, entries: [] });
        lastKey = key;
      }
      groups[groups.length - 1].entries.push(entry);
    }
    return groups;
  }, [entries]);

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

  const isEmpty = beads.length === 0 && notes.length === 0;

  return (
    <Layout>
      <div
        className="relative min-h-full print:hidden"
        style={{
          background:
            "linear-gradient(180deg, #FFF8E5 0%, #FFEFD9 35%, #FFE3E2 70%, #FFD6E2 100%)",
          scrollBehavior: "smooth",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/3 -left-12 w-44 h-44 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="absolute bottom-10 -right-10 w-56 h-56 rounded-full bg-pink-300/25 blur-3xl" />
        </div>

        <div className="relative px-6 pt-6 pb-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Courage Timeline
            </h1>
            <p className="text-muted-foreground mt-1">
              Beads and reflections, in order.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="rounded-full h-10 px-4 shrink-0"
              title="Print Timeline"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreatingNote(true)}
              className="rounded-full h-10 px-4 shrink-0 shadow-md shadow-primary/20"
              data-testid="add-note-button"
            >
              <Plus className="w-4 h-4 mr-1" />
              Note
            </Button>
          </div>
        </div>

        {isEmpty ? (
          <div className="relative px-6 py-16">
            <div className="rounded-3xl bg-white/70 border border-white/80 backdrop-blur p-8 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">
                Your path begins here
              </h3>
              <p className="text-muted-foreground mb-6">
                Add a bead or write a reflection to start the journey.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingNote(true)}
                  size="lg"
                  className="rounded-2xl"
                >
                  <BookHeart className="w-4 h-4 mr-2" />
                  Reflection
                </Button>
                <Button
                  onClick={() => setLocation("/add")}
                  size="lg"
                  className="rounded-2xl"
                >
                  Add bead
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative w-full"
            style={{ height: totalHeight }}
            data-testid="timeline-canvas"
          >
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

            {items.map((it) => {
              if (it.kind === "month") {
                return (
                  <MonthMarker key={it.key} y={it.y} label={it.label} />
                );
              }
              if (it.kind === "bead") {
                return (
                  <BeadDot
                    key={it.key}
                    bead={it.bead}
                    xPct={it.xPct}
                    y={it.y}
                    index={it.index}
                    onTap={() => setSelectedBead(it.bead)}
                  />
                );
              }
              return (
                <NoteDot
                  key={it.key}
                  note={it.note}
                  xPct={it.xPct}
                  y={it.y}
                  index={it.index}
                  onTap={() => setActiveNote(it.note)}
                />
              );
            })}
          </div>
        )}

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

      {/* ── Keepsake Print View (hidden on screen, shown only when printing) ── */}
      <div
        className="hidden print:block"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1a1a1a", padding: "0" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #ED5773", paddingBottom: "28px", marginBottom: "36px" }}>
          <div style={{ fontSize: "13px", letterSpacing: "4px", textTransform: "uppercase", color: "#ED5773", fontFamily: "Helvetica Neue, Arial, sans-serif", marginBottom: "10px" }}>✦ Courage Bead Tracker ✦</div>
          <div style={{ fontSize: "30px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "6px" }}>Courage Bead Timeline</div>
          {child?.name && (
            <div style={{ fontSize: "20px", color: "#ED5773", marginBottom: "4px" }}>{child.name}'s Journey of Courage</div>
          )}
          {dateRange && (
            <div style={{ fontSize: "14px", color: "#888", fontFamily: "Helvetica Neue, Arial, sans-serif", marginTop: "4px" }}>{dateRange}</div>
          )}
          <div style={{ fontSize: "13px", color: "#aaa", fontFamily: "Helvetica Neue, Arial, sans-serif", marginTop: "6px" }}>
            {beads.length} bead{beads.length !== 1 ? "s" : ""} earned
            {notes.length > 0 ? ` · ${notes.length} reflection${notes.length !== 1 ? "s" : ""} recorded` : ""}
          </div>
        </div>

        {/* Entries by month */}
        {printGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: "28px" }}>
            <div style={{
              fontSize: "10px", fontWeight: "bold", textTransform: "uppercase",
              letterSpacing: "3px", color: "#ED5773",
              fontFamily: "Helvetica Neue, Arial, sans-serif",
              borderBottom: "1px solid #FBD0DA", paddingBottom: "6px", marginBottom: "14px",
            }}>
              {group.label}
            </div>
            {group.entries.map((entry) =>
              entry.kind === "bead" ? (
                <div key={entry.bead.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px", pageBreakInside: "avoid" }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    backgroundColor: entry.bead.color, flexShrink: 0,
                    marginTop: "3px", border: "1px solid rgba(0,0,0,0.12)",
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: "bold", color: "#1a1a1a", lineHeight: "1.3" }}>{entry.bead.reason}</div>
                    <div style={{ fontSize: "12px", color: "#ED5773", fontFamily: "Helvetica Neue, Arial, sans-serif", marginTop: "2px" }}>
                      {entry.bead.colorName} Bead · {format(parseISO(entry.bead.earnedAt), "MMMM d, yyyy")}
                    </div>
                    {entry.bead.notes && (
                      <div style={{ fontSize: "13px", fontStyle: "italic", color: "#555", marginTop: "4px", lineHeight: "1.5" }}>"{entry.bead.notes}"</div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={entry.note.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px", pageBreakInside: "avoid" }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "5px",
                    backgroundColor: "#FBD0DA", flexShrink: 0,
                    marginTop: "3px", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "12px", color: "#ED5773",
                  }}>✏</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ED5773", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
                      Reflection · {format(parseISO(entry.note.date), "MMMM d, yyyy")}
                    </div>
                    <div style={{ fontSize: "13px", color: "#333", marginTop: "3px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{entry.note.text}</div>
                  </div>
                </div>
              )
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: "48px", borderTop: "1px solid #FBD0DA", paddingTop: "18px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontStyle: "italic", color: "#888" }}>Every bead tells a story of courage and love. 💙</div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "6px", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
            Printed {format(new Date(), "MMMM d, yyyy")} · Courage Bead Tracker
          </div>
        </div>
      </div>

      <BeadDetailDialog
        bead={selectedBead}
        onOpenChange={(open) => !open && setSelectedBead(null)}
        onEdit={(id) => {
          setSelectedBead(null);
          setLocation(`/add/${id}`);
        }}
      />

      <NoteViewDialog
        note={activeNote}
        onOpenChange={(open) => !open && setActiveNote(null)}
        onEdit={(note) => {
          setActiveNote(null);
          setEditingNote(note);
        }}
      />

      <JournalNoteDialog
        open={isCreatingNote}
        onOpenChange={setIsCreatingNote}
      />
      <JournalNoteDialog
        open={!!editingNote}
        note={editingNote}
        onOpenChange={(open) => {
          if (!open) setEditingNote(null);
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
      data-testid="timeline-bead"
    >
      <span className="block transition-transform group-hover:scale-110">
        <BeadIcon color={bead.color} size={56} isGlow={isGlow} />
      </span>
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

function NoteDot({
  note,
  xPct,
  y,
  index,
  onTap,
}: {
  note: JournalNote;
  xPct: number;
  y: number;
  index: number;
  onTap: () => void;
}) {
  const dateLabel = format(parseISO(note.date), "MMM d");
  const labelSide = xPct >= X_CENTER ? "left" : "right";

  return (
    <motion.button
      type="button"
      onClick={onTap}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 18,
        delay: Math.min(index * 0.03, 0.5),
      }}
      whileTap={{ scale: 0.9 }}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
      style={{ left: `${xPct}%`, top: y }}
      aria-label={`Reflection on ${format(parseISO(note.date), "MMMM d, yyyy")}`}
      data-testid="timeline-note"
    >
      <span className="block w-9 h-9 rounded-2xl bg-white border border-primary/25 shadow-md shadow-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
        <BookHeart className="w-4 h-4" />
      </span>
      <span
        className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-semibold text-primary bg-white/85 backdrop-blur px-2 py-0.5 rounded-full border border-primary/15 shadow-sm ${
          labelSide === "left" ? "right-full mr-2" : "left-full ml-2"
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

function NoteViewDialog({
  note,
  onOpenChange,
  onEdit,
}: {
  note: JournalNote | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (note: JournalNote) => void;
}) {
  const isOpen = !!note;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[92vw] sm:max-w-[440px] rounded-3xl border-0 p-0 overflow-hidden"
        data-testid="journal-view-dialog"
      >
        <DialogTitle className="sr-only">
          {note
            ? `Reflection on ${format(parseISO(note.date), "MMMM d, yyyy")}`
            : "Reflection"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {note?.text ?? ""}
        </DialogDescription>

        {note && (
          <>
            <div
              className="px-6 pt-7 pb-6 text-center"
              style={{
                background:
                  "linear-gradient(160deg, #FFF8E5 0%, #FFE3E2 100%)",
              }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center text-primary">
                  <BookHeart className="w-7 h-7" />
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                Reflection
              </div>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(note.date), "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            <div className="px-6 py-5 bg-card max-h-[40vh] overflow-y-auto">
              <p
                className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap"
                data-testid="journal-view-text"
              >
                {note.text}
              </p>
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
                onClick={() => onEdit(note)}
                className="rounded-2xl h-12"
                data-testid="journal-edit-button"
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
