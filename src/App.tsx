
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/monitoring/ErrorBoundary";
import { PerformanceMonitor } from "@/components/monitoring/PerformanceMonitor";
import { UserBehaviorTracker } from "@/components/analytics/UserBehaviorTracker";
import { PWAPrompt } from "@/components/pwa/PWAPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import DonationSuccess from "./pages/DonationSuccess";
import InvestorDashboard from "./pages/InvestorDashboard";
import InvestorDirectory from "./pages/InvestorDirectory";
import AIFeedback from "./pages/AIFeedback";
import Feedback from "./pages/Feedback";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Assessment from "./pages/Assessment";
import Learn from "./pages/Learn";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { EnhancedCookieConsent } from "./components/EnhancedCookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PerformanceMonitor />
              <UserBehaviorTracker />
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/assessment" element={<Assessment />} />
                  <Route path="/unified-assessment" element={<Assessment />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/donation-success" element={<DonationSuccess />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/investor-dashboard" element={<InvestorDashboard />} />
                  <Route path="/investor-directory" element={<InvestorDirectory />} />
                  <Route path="/investors" element={<InvestorDirectory />} />
                  <Route path="/ai-feedback" element={<AIFeedback />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <EnhancedCookieConsent />
                <PWAPrompt />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
