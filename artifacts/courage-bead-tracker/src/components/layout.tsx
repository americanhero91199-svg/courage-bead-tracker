import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, PlusCircle, PieChart, Settings, Trash2 } from "lucide-react";
import { useBeadStore } from "@/hooks/use-bead-store";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full flex justify-center bg-background">
      <div className="w-full max-w-[420px] bg-card flex flex-col relative shadow-2xl shadow-black/5 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0 relative z-10">
          <div className="font-display font-bold text-xl text-primary tracking-tight">
            Courage Beads
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
          {children}
        </main>

        {/* Bottom Nav */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-card border-t border-border/50 flex items-center justify-around px-6 z-20 pb-safe">
          <NavItem href="/" icon={<Home className="w-6 h-6" />} label="Home" isActive={location === "/"} />
          <div className="-mt-8">
            <Link href="/add">
              <button className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300">
                <PlusCircle className="w-8 h-8" />
              </button>
            </Link>
          </div>
          <NavItem href="/summary" icon={<PieChart className="w-6 h-6" />} label="Summary" isActive={location === "/summary"} />
        </nav>

        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function SettingsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { child, setChildName, clearData } = useBeadStore();
  const [name, setName] = useState(child?.name || "");
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setName(child?.name || "");
    }
  }, [open, child?.name]);

  const handleSave = () => {
    if (name.trim()) {
      setChildName(name.trim());
      onOpenChange(false);
      toast({ title: "Settings saved", description: "Child's name has been updated." });
    }
  };

  const handleClear = () => {
    clearData();
    setIsConfirmClearOpen(false);
    onOpenChange(false);
    toast({ title: "Data cleared", description: "All data has been erased." });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display">Settings</DialogTitle>
            <DialogDescription>Update your settings here.</DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Child's Name</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter child's name"
                className="text-lg py-6"
              />
            </div>
            
            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline"
                className="w-full justify-start text-destructive hover:bg-destructive/10"
                onClick={() => setIsConfirmClearOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear all data
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} size="lg" className="w-full text-lg rounded-full">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmClearOpen} onOpenChange={setIsConfirmClearOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive font-display">Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete all recorded beads and progress. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmClearOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleClear} className="w-full sm:w-auto">Yes, clear data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
