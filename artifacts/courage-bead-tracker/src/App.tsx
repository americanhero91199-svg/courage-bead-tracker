import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { BeadStoreProvider, useBeadStore } from "@/hooks/use-bead-store";
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import AddBead from "@/pages/add-bead";
import BeadsList from "@/pages/beads-list";
import Summary from "@/pages/summary";

const queryClient = new QueryClient();

// Router wrapper to handle auth/welcome flow routing logic
function ProtectedRouter() {
  const { child, isLoaded } = useBeadStore();

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />; // Blank while loading localstorage
  }

  return (
    <Switch>
      {/* If no child exists, force them to the welcome page */}
      {!child && <Route component={Welcome} />}
      
      <Route path="/" component={Home} />
      <Route path="/add" component={AddBead} />
      <Route path="/add/:id" component={AddBead} />
      <Route path="/beads" component={BeadsList} />
      <Route path="/summary" component={Summary} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BeadStoreProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRouter />
          </WouterRouter>
          <Toaster />
        </BeadStoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
