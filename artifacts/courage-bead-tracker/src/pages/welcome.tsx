import { useState } from "react";
import { useLocation } from "wouter";
import { useBeadStore } from "@/hooks/use-bead-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeadIcon } from "@/components/bead";
import { motion } from "framer-motion";

export default function Welcome() {
  const [name, setName] = useState("");
  const { setChildName } = useBeadStore();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setChildName(name.trim());
      setLocation("/");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-card p-8 rounded-3xl shadow-xl border border-border/50 text-center"
      >
        <div className="flex justify-center gap-2 mb-8">
          <BeadIcon color="#e81c24" size={32} className="animate-bounce [animation-delay:0ms]" />
          <BeadIcon color="#ffe600" size={32} className="animate-bounce [animation-delay:150ms]" />
          <BeadIcon color="#005baa" size={32} className="animate-bounce [animation-delay:300ms]" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-primary mb-4">
          Welcome to Courage Beads
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          A special place to track and celebrate every brave step of the journey.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-foreground pl-1">
              Who are we celebrating?
            </label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Child's name"
              className="text-lg py-6 rounded-2xl bg-muted/50 border-transparent focus:bg-background transition-colors"
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="w-full text-lg h-14 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            disabled={!name.trim()}
          >
            Start Collecting
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
