import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import InvestorDirectory from "./pages/InvestorDirectory";
import Feedback from "./pages/Feedback";
import AdminDashboard from '@/pages/AdminDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClient client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/results" element={<Results />} />
              <Route path="/investor-dashboard" element={<InvestorDashboard />} />
              <Route path="/investor-directory" element={<InvestorDirectory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
