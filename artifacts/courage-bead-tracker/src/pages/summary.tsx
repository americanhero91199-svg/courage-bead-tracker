import { useBeadStore } from "@/hooks/use-bead-store";
import { Layout } from "@/components/layout";
import { BeadIcon } from "@/components/bead";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

export default function Summary() {
  const { beads, child } = useBeadStore();

  if (!child) return null;

  // Stats calculations
  const totalBeads = beads.length;
  
  const firstBead = beads.length > 0 ? beads[beads.length - 1] : null;
  const lastBead = beads.length > 0 ? beads[0] : null;
  const daysSinceStart = firstBead ? differenceInDays(new Date(), parseISO(firstBead.earnedAt)) : 0;

  // Group counts by color
  const colorCounts = beads.reduce((acc, bead) => {
    const key = bead.colorName;
    if (!acc[key]) {
      acc[key] = { count: 0, color: bead.color, isGlow: bead.colorName === "Glow" };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { count: number, color: string, isGlow: boolean }>);

  const sortedColorCounts = Object.entries(colorCounts).sort((a, b) => b[1].count - a[1].count);

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Milestones</h1>
          <p className="text-muted-foreground">Celebrating {child.name}'s journey.</p>
        </header>

        {/* Big Total */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary text-primary-foreground rounded-[2rem] p-8 text-center shadow-xl shadow-primary/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <h2 className="text-lg font-medium opacity-90 mb-2 relative z-10">Total Beads Earned</h2>
          <div className="text-7xl font-display font-bold tracking-tighter relative z-10 mb-2">{totalBeads}</div>
          
          {firstBead && (
            <p className="text-sm opacity-80 mt-4 relative z-10">
              Journey started {format(parseISO(firstBead.earnedAt), "MMMM yyyy")}
              <br/>
              ({daysSinceStart} days of courage)
            </p>
          )}
        </motion.div>

        {/* Breakdown */}
        {totalBeads > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-display font-bold">Beads by Category</h3>
            <div className="grid gap-3">
              {sortedColorCounts.map(([name, data], i) => (
                <motion.div 
                  key={name}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm"
                >
                  <BeadIcon color={data.color} size={32} isGlow={data.isGlow} />
                  <div className="flex-1 font-medium text-foreground">{name}</div>
                  <div className="text-xl font-display font-bold text-primary bg-primary/10 px-4 py-1 rounded-full">
                    {data.count}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
