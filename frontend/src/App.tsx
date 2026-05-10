import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect } from "react";
import Layout from "./components/Layout/Layout";
import DashboardLayout from "./components/Layout/DashboardLayout";
import PageLoader from "./components/ui/page-loader";
import ErrorBoundary, { APIErrorBoundary } from "./components/ErrorBoundary";
import { DashboardSkeleton, HistorySkeleton, ProfileSkeleton } from "./components/ui/LoadingSkeletons";
import { preloadCriticalComponents } from "./components/LazyComponents";
import performanceMonitor from "./utils/performanceMonitor";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Preload critical components on app start
  useEffect(() => {
    preloadCriticalComponents();
  }, []);

  return (
    <ErrorBoundary>
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
                <Route 
                  path="/" 
                  element={
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <LandingPage />
                      </Suspense>
                    </Layout>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SignUp />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/signin" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SignIn />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/forgot-password" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ForgotPassword />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/reset-password" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ResetPassword />
                    </Suspense>
                  } 
                />
                
                {/* Dashboard/authenticated routes with sidebar layout */}
                <Route 
                  path="/dashboard" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<DashboardSkeleton />}>
                          <Dashboard />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/dashboard/history" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<HistorySkeleton />}>
                          <History />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/dashboard/profile" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<ProfileSkeleton />}>
                          <Profile />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/dashboard/settings" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                          <Settings />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/article-writer" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                          <ArticleWriter />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/title-generator" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                          <TitleGenerator />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/image-generator" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                          <ImageGenerator />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                <Route 
                  path="/background-remover" 
                  element={
                    <DashboardLayout>
                      <APIErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                          <BackgroundRemover />
                        </Suspense>
                      </APIErrorBoundary>
                    </DashboardLayout>
                  } 
                />
                
                <Route 
                  path="*" 
                  element={
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <NotFound />
                      </Suspense>
                    </Layout>
                  } 
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
