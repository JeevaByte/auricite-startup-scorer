
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AssessmentWizard } from "@/components/AssessmentWizard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Results from "./pages/Results";
import InvestorDashboard from "./pages/InvestorDashboard";
import Profile from "./pages/Profile";
import AIFeedback from "./pages/AIFeedback";
import { useSearchParams } from "react-router-dom";

const queryClient = new QueryClient();

// Component to handle assessment routing
const AssessmentRoute = () => {
  const [searchParams] = useSearchParams();
  const isAssessment = searchParams.get('assessment') === 'true';
  
  if (isAssessment) {
    return <AssessmentWizard />;
  }
  
  return <Index />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AssessmentRoute />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/results" element={<Results />} />
              <Route path="/investor-dashboard" element={<InvestorDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai-feedback" element={<AIFeedback />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
