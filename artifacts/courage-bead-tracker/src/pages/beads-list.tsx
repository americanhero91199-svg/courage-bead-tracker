import { useBeadStore } from "@/hooks/use-bead-store";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { BeadIcon } from "@/components/bead";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function BeadsList() {
  const { beads, deleteBead } = useBeadStore();
  const [, setLocation] = useLocation();
  const [beadToDelete, setBeadToDelete] = useState<string | null>(null);

  // Group beads by month-year
  const groupedBeads = beads.reduce((acc, bead) => {
    const date = parseISO(bead.earnedAt);
    const key = format(date, "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(bead);
    return acc;
  }, {} as Record<string, typeof beads>);

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <header className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">Timeline</h1>
          <p className="text-muted-foreground">Every bead tells a story.</p>
        </header>

        {beads.length === 0 ? (
          <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-border/50">
            <div className="text-4xl mb-4">🌈</div>
            <h3 className="text-xl font-bold mb-2">No beads yet</h3>
            <p className="text-muted-foreground mb-6">Start tracking milestones to see them here.</p>
            <Button onClick={() => setLocation("/add")} className="rounded-full">Add First Bead</Button>
          </div>
        ) : (
          <div className="space-y-8 relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[24px] top-4 bottom-4 w-0.5 bg-border/50 -z-10" />

            {Object.entries(groupedBeads).map(([month, monthBeads], groupIndex) => (
              <div key={month} className="space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-14 relative bg-background inline-block pr-4">
                  {month}
                </h2>
                
                <div className="space-y-6">
                  {monthBeads.map((bead, index) => (
                    <motion.div
                      key={bead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                      className="flex gap-4 relative group"
                    >
                      <div className="shrink-0 mt-1 cursor-pointer hover:scale-110 transition-transform bg-background p-1" onClick={() => setLocation(`/add/${bead.id}`)}>
                        <BeadIcon color={bead.color} size={40} isGlow={bead.colorName === "Glow"} />
                      </div>
                      
                      <div className="flex-1 bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-foreground leading-tight pr-2">{bead.reason}</h3>
                          <span className="text-xs text-muted-foreground shrink-0">{format(parseISO(bead.earnedAt), "MMM d")}</span>
                        </div>
                        <p className="text-sm font-medium text-primary mb-2">{bead.name}</p>
                        {bead.notes && (
                          <p className="text-sm text-muted-foreground italic mb-3">"{bead.notes}"</p>
                        )}
                        
                        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setLocation(`/add/${bead.id}`)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setBeadToDelete(bead.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!beadToDelete} onOpenChange={(open) => !open && setBeadToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive font-display">Delete Bead?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this bead from the timeline? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setBeadToDelete(null)} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (beadToDelete) {
                deleteBead(beadToDelete);
                setBeadToDelete(null);
              }
            }} className="w-full sm:w-auto">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
