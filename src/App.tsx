
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import ATS from "./pages/ATS";
import CoverLetter from "./pages/CoverLetter";
import Templates from "./pages/Templates";
import Share from "./pages/Share";
import Print from "./pages/Print";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./components/auth/AuthPage";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/ats" element={<ATS />} />
              <Route path="/cover-letter" element={<CoverLetter />} />
              <Route path="/coverletter" element={<Navigate to="/cover-letter" replace />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/share/:slug" element={<Share />} />
              <Route path="/print" element={<Print />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
