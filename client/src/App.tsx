import { Switch, Route, RouteComponentProps } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import { TechnicianRedirect } from "@/components/auth/TechnicianRedirect";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ServiceRequestPage from "@/pages/ServiceRequestPage";
import TechniciansPage from "@/pages/TechniciansPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import TechnicianProfilePage from "@/pages/TechnicianProfilePage";
import CheckoutPage from "@/pages/CheckoutPage";
import TechnicianMapPage from "@/pages/TechnicianMapPage";
import AboutPage from "@/pages/AboutPage";
import FAQPage from "@/pages/FAQPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";
import BecomeTechnicianPage from "@/pages/BecomeTechnicianPage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Wrapper component for ContactPage that correctly handles the props
const ContactPageWrapper = (_props: RouteComponentProps) => <ContactPage inHomePage={false} />;

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/request-service" component={ServiceRequestPage} />
          <Route path="/technicians" component={TechniciansPage} />
          <Route path="/technicians/:id" component={TechnicianProfilePage} />
          <Route path="/find-technicians" component={TechnicianMapPage} />
          <Route path="/contact" component={ContactPageWrapper} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/profile">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          </Route>
          <Route path="/checkout/:id">
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          </Route>
          <Route path="/about" component={AboutPage} />
          <Route path="/faq" component={FAQPage} />
          <Route path="/privacy" component={PrivacyPolicyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/become-technician" component={BecomeTechnicianPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <TechnicianRedirect />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
