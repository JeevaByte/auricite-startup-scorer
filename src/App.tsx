
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
import RoleSelection from "./pages/RoleSelection";
import FundSeekerLanding from "./pages/FundSeekerLanding";
import InvestorLanding from "./pages/InvestorLanding";
import Auth from "./pages/Auth";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import DonationSuccess from "./pages/DonationSuccess";
import InvestorDashboard from "./pages/InvestorDashboard";
import InvestorDashboardNew from "./pages/InvestorDashboardNew";
import InvestorDirectory from "./pages/InvestorDirectory";
import InterestRequests from "./pages/investor/InterestRequests";
import { InvestorLayout } from "./components/investor/InvestorLayout";
import DealFlow from "./pages/investor/DealFlow";
import SavedStartups from "./pages/investor/SavedStartups";
import ComparisonPage from "./pages/investor/ComparisonPage";
import PortfolioPage from "./pages/investor/PortfolioPage";
import MatchesPage from "./pages/investor/MatchesPage";
import AnalyticsPage from "./pages/investor/AnalyticsPage";
import ProfilePage from "./pages/investor/ProfilePage";
import AIChatPage from "./pages/investor/AIChatPage";
import CollaborationPage from "./pages/investor/CollaborationPage";
import StartupDetails from "./pages/investor/StartupDetails";
import ActivityLog from "./pages/investor/ActivityLog";
import InvestorOnboarding from "./pages/InvestorOnboarding";
import InvestorListing from "./pages/InvestorListing";
import InvestorProfilePage from "./pages/InvestorProfilePage";
import FundraiserProfile from "./pages/FundraiserProfile";
import FundraiserListing from "./pages/FundraiserListing";
import StartupDirectory from "./pages/StartupDirectory";
import FundSeekerDashboard from "./pages/FundSeekerDashboard";
import FundraiserDashboard from "./pages/FundraiserDashboard";
import MyInvestors from "./pages/MyInvestors";
import AIFeedback from "./pages/AIFeedback";
import Feedback from "./pages/Feedback";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Assessment from "./pages/Assessment";
import UnifiedAssessment from "./pages/UnifiedAssessment";
import Learn from "./pages/Learn";
import Donate from "./pages/Donate";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import { SubscriptionWarning } from "./components/subscription/SubscriptionWarning";
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
              <SubscriptionWarning />
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/fund-seeker-landing" element={<FundSeekerLanding />} />
                  <Route path="/investor-landing" element={<InvestorLanding />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Fund Seeker Routes */}
                  <Route path="/dashboard" element={<FundSeekerDashboard />} />
                  <Route path="/my-investors" element={<MyInvestors />} />
                  <Route path="/assessment" element={<Assessment />} />
                  <Route path="/unified-assessment" element={<UnifiedAssessment />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  
                  {/* Donation Routes */}
                  <Route path="/donation-success" element={<DonationSuccess />} />
                  <Route path="/donate" element={<Donate />} />
                  
                  {/* Investor Routes */}
                  <Route path="/investor-dashboard" element={<InvestorDashboard />} />
                  <Route path="/investor-dashboard-new" element={<InvestorDashboardNew />} />
                  <Route path="/investor-directory" element={<InvestorDirectory />} />
                  
                  {/* New Investor Dashboard Routes */}
                  <Route path="/investor/deal-flow" element={<DealFlow />} />
                  <Route path="/investor/saved" element={<SavedStartups />} />
                  <Route path="/investor/startup-details" element={<StartupDetails />} />
                  <Route path="/investor/interest" element={<InterestRequests />} />
                  <Route path="/investor/compare" element={<ComparisonPage />} />
                  <Route path="/investor/portfolio" element={<PortfolioPage />} />
                  <Route path="/investor/matches" element={<MatchesPage />} />
                  <Route path="/investor/analytics" element={<AnalyticsPage />} />
                  <Route path="/investor/activity" element={<ActivityLog />} />
                  <Route path="/investor/profile" element={<ProfilePage />} />
                  <Route path="/investor/ai-chat" element={<AIChatPage />} />
                  <Route path="/investor/collaboration" element={<CollaborationPage />} />
                  <Route path="/investor-onboarding" element={<InvestorOnboarding />} />
                  <Route path="/investors" element={<InvestorListing />} />
                  <Route path="/investor/:id" element={<InvestorProfilePage />} />
                  
                  {/* Fundraiser Routes */}
                  <Route path="/fundraisers" element={<FundraiserListing />} />
                  <Route path="/fundraiser-dashboard" element={<FundraiserDashboard />} />
                  <Route path="/startup-directory" element={<StartupDirectory />} />
                  <Route path="/fundraiser/:id" element={<FundraiserProfile />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  
                  {/* General Routes */}
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
