import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  Image, 
  Scissors, 
  FileCheck,
  TrendingUp,
  Clock,
  Zap,
  User,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useUserProfile, useDashboardAnalytics } from '@/hooks/useOptimizedApi';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeletons';

const Dashboard = () => {
  const { data: profileData, loading: profileLoading, error: profileError, isStale: profileStale, refetch: refetchProfile, invalidateCache: invalidateProfileCache } = useUserProfile();
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError, isStale: analyticsStale, refetch: refetchAnalytics, invalidateCache: invalidateAnalyticsCache } = useDashboardAnalytics();

  const handleRefresh = useCallback(() => {
    invalidateProfileCache();
    invalidateAnalyticsCache();
    refetchProfile();
    refetchAnalytics();
  }, [refetchProfile, refetchAnalytics, invalidateProfileCache, invalidateAnalyticsCache]);

  const usage = profileData?.usage || { articles: 0, images: 0, titles: 0, backgroundRemovals: 0, total: 0 };
  const recentActivity = profileData?.recentActivity || { articles: 0, images: 0, titles: 0, backgroundRemovals: 0, total: 0 };

  const stats = useMemo(() => [
    { 
      label: 'Articles Generated', 
      value: usage.articles, 
      icon: PenTool, 
      change: recentActivity.articles > 0 ? `+${recentActivity.articles} this month` : 'No recent activity',
      color: 'text-blue-500'
    },
    { 
      label: 'Titles Created', 
      value: usage.titles, 
      icon: FileText, 
      change: recentActivity.titles > 0 ? `+${recentActivity.titles} this month` : 'No recent activity',
      color: 'text-purple-500'
    },
    { 
      label: 'Images Generated', 
      value: usage.images, 
      icon: Image, 
      change: recentActivity.images > 0 ? `+${recentActivity.images} this month` : 'No recent activity',
      color: 'text-green-500'
    },
    { 
      label: 'Backgrounds Removed', 
      value: usage.backgroundRemovals, 
      icon: Scissors, 
      change: recentActivity.backgroundRemovals > 0 ? `+${recentActivity.backgroundRemovals} this month` : 'No recent activity',
      color: 'text-orange-500'
    },
  ], [usage.articles, usage.titles, usage.images, usage.backgroundRemovals, recentActivity.articles, recentActivity.titles, recentActivity.images, recentActivity.backgroundRemovals]);

  const dailyActivity = useMemo(() => analyticsData?.dailyActivity || [], [analyticsData]);

  if ((profileLoading && !profileData) || (analyticsLoading && !analyticsData)) {
    return <DashboardSkeleton />;
  }

  if (profileError || analyticsError) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-24">
            <p className="text-destructive">Error loading dashboard data: {profileError || analyticsError}</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profileData?.user?.username}! Here's your AI productivity overview.
                {(profileStale || analyticsStale) && (
                  <span className="ml-2 text-yellow-600">
                    ⚠️ Some data may be outdated
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {(profileStale || analyticsStale) && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  Stale Data
                </Badge>
              )}
              <Button onClick={handleRefresh} variant="outline" disabled={profileLoading || analyticsLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${(profileLoading || analyticsLoading) ? 'animate-spin' : ''}`} />
                {(profileLoading || analyticsLoading) ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass border-border/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Activity Chart */}
          <Card className="glass border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Your AI generation activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyActivity.length > 0 ? (
                <div className="space-y-4">
                  {dailyActivity.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{day.total}</p>
                          <p className="text-xs text-muted-foreground">generations</p>
                        </div>
                        <div className="w-20">
                          <Progress value={(day.total / Math.max(...dailyActivity.map(d => d.total), 1)) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Stats
              </CardTitle>
              <CardDescription>Overview of your account and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{usage.total}</p>
                  <p className="text-xs text-muted-foreground">Total Generations</p>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-500">{recentActivity.total}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Account Status
                  </span>
                  <Badge>Free Plan</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Member Since
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {profileData?.user?.joinDate 
                      ? new Date(profileData.user.joinDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short' 
                        })
                      : 'Unknown'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Last Active
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {profileData?.user?.lastActive 
                      ? new Date(profileData.user.lastActive).toLocaleDateString('en-US')
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tool Quick Access */}
        <Card className="glass border-border/20 mt-8">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump to your favorite AI tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/article-writer">
                  <PenTool className="w-6 h-6" />
                  <span className="text-sm">Article Writer</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/title-generator">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Title Generator</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/image-generator">
                  <Image className="w-6 h-6" />
                  <span className="text-sm">Image Generator</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/background-remover">
                  <Scissors className="w-6 h-6" />
                  <span className="text-sm">BG Remover</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;