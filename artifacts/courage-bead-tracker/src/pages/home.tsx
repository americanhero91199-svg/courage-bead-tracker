import { useBeadStore } from "@/hooks/use-bead-store";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { BeadIcon } from "@/components/bead";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, PlusCircle, Sparkles, Route as RouteIcon, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { child, beads } = useBeadStore();
  const [, setLocation] = useLocation();

  if (!child) return null;

  const recentBeads = beads.slice(0, 12); // Show up to 12 recent beads

  return (
    <Layout>
      <div className="p-6 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center pt-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-4 relative"
          >
            <Trophy className="w-10 h-10" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Hi, {child.name}!
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            You have collected <span className="text-primary font-bold">{beads.length}</span> brave beads.
          </p>
        </section>

        {/* Recent Beads Jar */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-foreground">Recent Beads</h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => setLocation("/timeline")}>
              Timeline <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-3xl p-6 min-h-[200px] border border-border/50 relative overflow-hidden flex items-center justify-center shadow-inner">
            {recentBeads.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3 relative z-10">
                {recentBeads.map((bead, i) => (
                  <motion.div
                    key={bead.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                  >
                    <BeadIcon 
                      color={bead.color} 
                      size={40} 
                      isGlow={bead.colorName === "Glow"} 
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground z-10">
                <p className="mb-2">Your jar is empty.</p>
                <p className="text-sm">Time to add your first bead!</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 gap-3">
          <Link href="/add">
            <Button size="lg" className="w-full h-16 text-lg rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground group">
              <PlusCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
              Add a New Bead
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/timeline")}
              className="h-14 text-sm rounded-2xl border-primary/30 text-primary hover:bg-primary/5"
            >
              <RouteIcon className="w-5 h-5 mr-2" />
              Timeline
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/recap")}
              className="h-14 text-sm rounded-2xl border-primary/30 text-primary hover:bg-primary/5"
              data-testid="home-recap-button"
            >
              <CalendarDays className="w-5 h-5 mr-2" />
              Recap
            </Button>
          </div>
        </section>

      </div>
    </Layout>
  );
}
