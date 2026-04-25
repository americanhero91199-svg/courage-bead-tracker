import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useBeadStore } from "@/hooks/use-bead-store";
import { BEAD_PRESETS } from "@/lib/types";
import { Layout } from "@/components/layout";
import { BeadIcon } from "@/components/bead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function AddBead() {
  const [, params] = useRoute("/add/:id");
  const [, setLocation] = useLocation();
  const { beads, addBead, updateBead } = useBeadStore();
  const { toast } = useToast();

  const isEditing = !!params?.id;
  const existingBead = isEditing ? beads.find(b => b.id === params.id) : null;

  const [selectedPreset, setSelectedPreset] = useState(existingBead?.color || BEAD_PRESETS[0].color);
  const [name, setName] = useState(existingBead?.name || BEAD_PRESETS[0].name);
  const [reason, setReason] = useState(existingBead?.reason || BEAD_PRESETS[0].reason);
  const [notes, setNotes] = useState(existingBead?.notes || "");
  const [earnedAt, setEarnedAt] = useState(
    existingBead?.earnedAt ? format(new Date(existingBead.earnedAt), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );

  const [isSparkling, setIsSparkling] = useState(false);

  // Sync inputs when preset changes (if not editing)
  const handlePresetSelect = (presetColor: string) => {
    setSelectedPreset(presetColor);
    const preset = BEAD_PRESETS.find(p => p.color === presetColor);
    if (preset && !isEditing) {
      setName(preset.name);
      setReason(preset.reason);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !reason || !earnedAt) {
      toast({ title: "Please fill out all required fields", variant: "destructive" });
      return;
    }

    const preset = BEAD_PRESETS.find(p => p.color === selectedPreset) || BEAD_PRESETS[0];

    const beadData = {
      color: selectedPreset,
      colorName: preset.colorName,
      name,
      reason,
      earnedAt: new Date(earnedAt).toISOString(),
      notes
    };

    if (isEditing && params?.id) {
      updateBead(params.id, beadData);
      toast({ title: "Bead updated!" });
      setLocation("/beads");
    } else {
      setIsSparkling(true);
      setTimeout(() => {
        addBead(beadData);
        toast({ title: "New bead added!", description: "What a brave milestone!" });
        setLocation("/");
      }, 600); // Wait for sparkle animation
    }
  };

  const activePreset = BEAD_PRESETS.find(p => p.color === selectedPreset);

  return (
    <div className="min-h-[100dvh] w-full flex justify-center bg-background">
      <div className="w-full max-w-[420px] bg-card flex flex-col relative shadow-2xl overflow-y-auto">
        <header className="h-16 flex items-center px-4 shrink-0 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-md z-10">
          <Button variant="ghost" size="icon" onClick={() => setLocation(isEditing ? "/beads" : "/")} className="mr-2">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="font-display font-bold text-xl">{isEditing ? "Edit Bead" : "Add a New Bead"}</h1>
        </header>

        <main className="flex-1 p-6 relative">
          <AnimatePresence>
            {isSparkling && (
              <motion.div 
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-white/50"
              >
                <div className="text-6xl animate-spin-slow">✨</div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Color Selector */}
            <div className="space-y-4">
              <Label className="text-base font-display">1. Choose a Bead Color</Label>
              
              <div className="flex justify-center mb-6 py-4">
                <motion.div
                  key={selectedPreset}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <BeadIcon color={selectedPreset} size={80} isGlow={activePreset?.isGlow} />
                </motion.div>
              </div>

              <div className="grid grid-cols-4 gap-4 bg-muted/30 p-4 rounded-3xl border border-border/50">
                {BEAD_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => handlePresetSelect(preset.color)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                      selectedPreset === preset.color 
                        ? 'bg-background shadow-sm scale-110 ring-2 ring-primary/20 ring-offset-2' 
                        : 'hover:bg-background/50 hover:scale-105'
                    }`}
                  >
                    <BeadIcon color={preset.color} size={32} isGlow={preset.isGlow} />
                    <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center">
                      {preset.colorName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Details Form */}
            <div className="space-y-5">
              <Label className="text-base font-display">2. Details</Label>
              
              <div className="space-y-2">
                <Label htmlFor="name">Bead Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="bg-muted/20 border-border/50 focus:bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason / Milestone</Label>
                <Input 
                  id="reason" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  className="bg-muted/20 border-border/50 focus:bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date Earned</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={earnedAt} 
                  onChange={(e) => setEarnedAt(e.target.value)} 
                  className="bg-muted/20 border-border/50 focus:bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="How did they show courage today?"
                  className="bg-muted/20 border-border/50 focus:bg-background min-h-[100px] resize-none"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-2xl shadow-lg shadow-primary/20" disabled={isSparkling}>
              {isEditing ? "Save Changes" : "Add Bead to Jar"}
            </Button>

          </form>
        </main>
      </div>
    </div>
  );
}
