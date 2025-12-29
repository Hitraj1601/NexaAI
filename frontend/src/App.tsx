import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout/Layout";
import DashboardLayout from "./components/Layout/DashboardLayout";
import PageLoader from "./components/ui/page-loader";

// Lazy load pages for better code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ArticleWriter = lazy(() => import("./pages/ArticleWriter"));
const TitleGenerator = lazy(() => import("./pages/TitleGenerator"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const BackgroundRemover = lazy(() => import("./pages/BackgroundRemover"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes with main layout */}
              <Route path="/" element={<Layout><LandingPage /></Layout>} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Dashboard/authenticated routes with sidebar layout */}
              <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
              <Route path="/dashboard/history" element={<DashboardLayout><History /></DashboardLayout>} />
              <Route path="/dashboard/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
              <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
              <Route path="/article-writer" element={<DashboardLayout><ArticleWriter /></DashboardLayout>} />
              <Route path="/title-generator" element={<DashboardLayout><TitleGenerator /></DashboardLayout>} />
              <Route path="/image-generator" element={<DashboardLayout><ImageGenerator /></DashboardLayout>} />
              <Route path="/background-remover" element={<DashboardLayout><BackgroundRemover /></DashboardLayout>} />
              
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
