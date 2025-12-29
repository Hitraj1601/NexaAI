// Lazy loading components for better code splitting and performance
import { lazy } from 'react';

// Core pages - load immediately
export const Dashboard = lazy(() => import('@/pages/Dashboard'));
export const History = lazy(() => import('@/pages/History'));

// AI Tools - load on demand
export const ArticleWriter = lazy(() => import('@/pages/ArticleWriter'));
export const ImageGenerator = lazy(() => import('@/pages/ImageGenerator'));
export const TitleGenerator = lazy(() => import('@/pages/TitleGenerator'));
export const BackgroundRemover = lazy(() => import('@/pages/BackgroundRemover'));

// Profile and Settings - load on demand
export const Profile = lazy(() => import('@/pages/Profile'));
export const Settings = lazy(() => import('@/pages/Settings'));

// Auth pages - separate bundle
export const SignIn = lazy(() => import('@/pages/SignIn'));
export const SignUp = lazy(() => import('@/pages/SignUp'));
export const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
export const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Other pages
export const LandingPage = lazy(() => import('@/pages/LandingPage'));
export const NotFound = lazy(() => import('@/pages/NotFound'));

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard and history as they are most frequently accessed
  import('@/pages/Dashboard');
  import('@/pages/History');
};

// Preload on user interaction
export const preloadOnHover = {
  articleWriter: () => import('@/pages/ArticleWriter'),
  imageGenerator: () => import('@/pages/ImageGenerator'),
  titleGenerator: () => import('@/pages/TitleGenerator'),
  backgroundRemover: () => import('@/pages/BackgroundRemover'),
  profile: () => import('@/pages/Profile'),
  settings: () => import('@/pages/Settings'),
};

export default {
  Dashboard,
  History,
  ArticleWriter,
  ImageGenerator,
  TitleGenerator,
  BackgroundRemover,
  Profile,
  Settings,
  SignIn,
  SignUp,
  ForgotPassword,
  ResetPassword,
  LandingPage,
  NotFound,
  preloadCriticalComponents,
  preloadOnHover,
};