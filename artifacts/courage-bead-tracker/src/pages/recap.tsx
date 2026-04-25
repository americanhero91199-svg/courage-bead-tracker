import { useMemo, useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useBeadStore } from "@/hooks/use-bead-store";
import { BeadIcon } from "@/components/bead";
import { Button } from "@/components/ui/button";
import {
  format,
  parseISO,
  startOfMonth,
  isSameMonth,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookHeart,
  Trophy,
  Heart,
  Star,
} from "lucide-react";
import { useLocation } from "wouter";
import type { Bead, JournalNote } from "@/lib/types";

type MonthKey = string; // "YYYY-MM"

function toMonthKey(d: Date): MonthKey {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fromMonthKey(key: MonthKey): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export default function Recap() {
  const { beads, notes } = useBeadStore();
  const [, setLocation] = useLocation();

  // Build the sorted list of months that have any activity (beads or notes).
  const months: MonthKey[] = useMemo(() => {
    const set = new Set<MonthKey>();
    beads.forEach((b) => set.add(toMonthKey(parseISO(b.earnedAt))));
    notes.forEach((n) => set.add(toMonthKey(parseISO(n.date))));
    return Array.from(set).sort(); // ascending
  }, [beads, notes]);

  const [activeMonth, setActiveMonth] = useState<MonthKey | null>(null);

  // Default to most recent month with activity once data is loaded.
  useEffect(() => {
    if (months.length === 0) {
      setActiveMonth(null);
      return;
    }
    if (!activeMonth || !months.includes(activeMonth)) {
      setActiveMonth(months[months.length - 1]);
    }
  }, [months, activeMonth]);

  if (months.length === 0) {
    return (
      <Layout>
        <RecapShell>
          <div className="px-6 py-16">
            <div className="rounded-3xl bg-white/70 border border-white/80 backdrop-blur p-8 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">
                No recaps yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Add a bead or reflection to start your first monthly recap.
              </p>
              <Button
                onClick={() => setLocation("/add")}
                size="lg"
                className="rounded-2xl"
              >
                Add a bead
              </Button>
            </div>
          </div>
        </RecapShell>
      </Layout>
    );
  }

  if (!activeMonth) {
    return (
      <Layout>
        <RecapShell>
          <div className="px-6 py-16" />
        </RecapShell>
      </Layout>
    );
  }

  const idx = months.indexOf(activeMonth);
  const hasPrev = idx > 0;
  const hasNext = idx < months.length - 1;
  const monthDate = fromMonthKey(activeMonth);

  return (
    <Layout>
      <RecapShell>
        {/* Month switcher */}
        <div className="px-6 pt-2 pb-4 flex items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={() => hasPrev && setActiveMonth(months[idx - 1])}
            disabled={!hasPrev}
            className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur border border-primary/15 text-primary flex items-center justify-center shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            aria-label="Previous month"
            data-testid="recap-prev-button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              {format(monthDate, "yyyy")}
            </div>
            <div
              className="text-2xl font-display font-bold text-foreground leading-tight"
              data-testid="recap-month-label"
            >
              {format(monthDate, "MMMM")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Recap {idx + 1} of {months.length}
            </div>
          </div>

          <button
            type="button"
            onClick={() => hasNext && setActiveMonth(months[idx + 1])}
            disabled={!hasNext}
            className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur border border-primary/15 text-primary flex items-center justify-center shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            aria-label="Next month"
            data-testid="recap-next-button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMonth}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <MonthRecap
              monthDate={monthDate}
              beads={beads}
              notes={notes}
              onOpenTimeline={() => setLocation("/timeline")}
            />
          </motion.div>
        </AnimatePresence>
      </RecapShell>
    </Layout>
  );
}

function RecapShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-full"
      style={{
        background:
          "linear-gradient(180deg, #FFF8E5 0%, #FFEFD9 35%, #FFE3E2 70%, #FFD6E2 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/2 -left-12 w-44 h-44 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute bottom-10 -right-10 w-56 h-56 rounded-full bg-pink-300/25 blur-3xl" />
      </div>

      <div className="relative px-6 pt-6 pb-2 z-10">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Monthly Recap
        </h1>
        <p className="text-muted-foreground mt-1">
          A keepsake of every brave month.
        </p>
      </div>

      {children}
    </div>
  );
}

function MonthRecap({
  monthDate,
  beads,
  notes,
  onOpenTimeline,
}: {
  monthDate: Date;
  beads: Bead[];
  notes: JournalNote[];
  onOpenTimeline: () => void;
}) {
  const monthBeads = useMemo(
    () =>
      beads
        .filter((b) => isSameMonth(parseISO(b.earnedAt), monthDate))
        .sort(
          (a, b) =>
            new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime(),
        ),
    [beads, monthDate],
  );
  const monthNotes = useMemo(
    () =>
      notes
        .filter((n) => isSameMonth(parseISO(n.date), monthDate))
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [notes, monthDate],
  );

  const colorBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { color: string; colorName: string; count: number; isGlow: boolean }
    >();
    monthBeads.forEach((b) => {
      const key = b.colorName;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
      } else {
        map.set(key, {
          color: b.color,
          colorName: b.colorName,
          count: 1,
          isGlow: b.colorName === "Glow",
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [monthBeads]);

  const topBead = colorBreakdown[0] ?? null;
  const isEmpty = monthBeads.length === 0 && monthNotes.length === 0;

  // Total month days for context (e.g. "active 4 of 30 days")
  const activeDays = useMemo(() => {
    const set = new Set<string>();
    monthBeads.forEach((b) =>
      set.add(format(parseISO(b.earnedAt), "yyyy-MM-dd")),
    );
    monthNotes.forEach((n) =>
      set.add(format(parseISO(n.date), "yyyy-MM-dd")),
    );
    return set.size;
  }, [monthBeads, monthNotes]);

  // Days in the month
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();

  return (
    <div className="px-6 pb-10 space-y-6">
      {isEmpty ? (
        <div className="rounded-3xl bg-white/75 border border-white/80 backdrop-blur p-8 text-center shadow-sm">
          <p className="text-muted-foreground">
            No beads or reflections in {format(monthDate, "MMMM yyyy")}.
          </p>
        </div>
      ) : (
        <>
          {/* Highlight stat card */}
          <div
            className="rounded-3xl p-6 text-center text-white shadow-xl shadow-primary/25 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #ED5773 0%, #F47B92 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-90 mb-2">
                <Trophy className="w-3.5 h-3.5" />
                {format(monthDate, "MMMM")} at a glance
              </div>
              <div
                className="text-6xl font-display font-bold leading-none mb-2"
                data-testid="recap-bead-total"
              >
                {monthBeads.length}
              </div>
              <div className="text-sm opacity-95 font-medium">
                {monthBeads.length === 1 ? "bead earned" : "beads earned"}
                {monthNotes.length > 0 && (
                  <>
                    {" • "}
                    <span data-testid="recap-note-total">
                      {monthNotes.length}
                    </span>{" "}
                    {monthNotes.length === 1 ? "reflection" : "reflections"}
                  </>
                )}
              </div>
              <div className="text-xs opacity-80 mt-3">
                Active on {activeDays} of {daysInMonth} days
              </div>
            </div>
          </div>

          {/* Top bead callout */}
          {topBead && (
            <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/80 p-5 flex items-center gap-4 shadow-sm">
              <BeadIcon
                color={topBead.color}
                size={56}
                isGlow={topBead.isGlow}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-0.5 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Top bead this month
                </div>
                <div className="text-lg font-display font-bold text-foreground leading-tight">
                  {topBead.colorName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {topBead.count}{" "}
                  {topBead.count === 1 ? "bead earned" : "beads earned"}
                </div>
              </div>
            </div>
          )}

          {/* Color breakdown */}
          {colorBreakdown.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60 mb-3 px-1">
                Beads by color
              </h3>
              <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/80 p-4 shadow-sm">
                <ul className="space-y-2.5">
                  {colorBreakdown.map((c) => (
                    <li
                      key={c.colorName}
                      className="flex items-center gap-3"
                      data-testid="recap-color-row"
                    >
                      <BeadIcon
                        color={c.color}
                        size={28}
                        isGlow={c.isGlow}
                      />
                      <div className="flex-1 text-sm font-medium text-foreground">
                        {c.colorName}
                      </div>
                      <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-0.5 rounded-full">
                        {c.count}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Reflections */}
          {monthNotes.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60 mb-3 px-1 flex items-center gap-1.5">
                <BookHeart className="w-3.5 h-3.5" />
                Reflections
              </h3>
              <div className="space-y-3">
                {monthNotes.map((n) => (
                  <article
                    key={n.id}
                    className="rounded-3xl bg-white/85 backdrop-blur border border-white/80 p-5 shadow-sm"
                    data-testid="recap-note-card"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1.5">
                      {format(parseISO(n.date), "EEEE, MMM d")}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {n.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Beads list */}
          {monthBeads.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60 mb-3 px-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Every bead
              </h3>
              <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/80 divide-y divide-border/40 shadow-sm overflow-hidden">
                {monthBeads.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 p-4"
                    data-testid="recap-bead-row"
                  >
                    <BeadIcon
                      color={b.color}
                      size={36}
                      isGlow={b.colorName === "Glow"}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground leading-tight truncate">
                        {b.reason}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(parseISO(b.earnedAt), "EEE, MMM d")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={onOpenTimeline}
            className="w-full h-12 rounded-2xl border-primary/30 text-primary hover:bg-primary/5"
          >
            View on the timeline
          </Button>
        </>
      )}
    </div>
  );
}
