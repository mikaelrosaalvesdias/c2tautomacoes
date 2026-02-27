import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import Acoes from "./pages/Acoes";
import Emails from "./pages/Emails";
import Cancelamentos from "./pages/Cancelamentos";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Recuperar estado de login do localStorage
    const saved = localStorage.getItem("c2tech_logged_in");
    return saved === "true";
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("c2tech_logged_in", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("c2tech_logged_in");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/acoes" component={Acoes} />
      <Route path="/emails" component={Emails} />
      <Route path="/cancelamentos" component={Cancelamentos} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
