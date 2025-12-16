import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout/Layout";
import DashboardLayout from "./components/Layout/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import ArticleWriter from "./pages/ArticleWriter";
import TitleGenerator from "./pages/TitleGenerator";
import ImageGenerator from "./pages/ImageGenerator";
import BackgroundRemover from "./pages/BackgroundRemover";
import ResumeReviewer from "./pages/ResumeReviewer";
import Community from "./pages/Community";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

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
          <Routes>
            {/* Public routes with main layout */}
            <Route path="/" element={<Layout><LandingPage /></Layout>} />
            <Route path="/community" element={<Layout><Community /></Layout>} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            
            {/* Dashboard/authenticated routes with sidebar layout */}
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/dashboard/history" element={<DashboardLayout><History /></DashboardLayout>} />
            <Route path="/dashboard/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/article-writer" element={<DashboardLayout><ArticleWriter /></DashboardLayout>} />
            <Route path="/title-generator" element={<DashboardLayout><TitleGenerator /></DashboardLayout>} />
            <Route path="/image-generator" element={<DashboardLayout><ImageGenerator /></DashboardLayout>} />
            <Route path="/background-remover" element={<DashboardLayout><BackgroundRemover /></DashboardLayout>} />
            <Route path="/resume-reviewer" element={<DashboardLayout><ResumeReviewer /></DashboardLayout>} />
            
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
