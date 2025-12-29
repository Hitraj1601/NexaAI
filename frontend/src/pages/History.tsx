import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History as HistoryIcon, 
  FileText, 
  Image, 
  Type, 
  Scissors, 
  User,
  Eye,
  Copy,
  Download,
  Trash2,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserHistory, deleteHistoryItem } from '@/hooks/useOptimizedApi';
import { HistorySkeleton } from '@/components/ui/LoadingSkeletons';

interface HistoryItemProps {
  item: {
    id: string;
    type: 'article' | 'image' | 'title' | 'bg-removal';
    title: string;
    content: string;
    prompt?: string;
    originalImage?: string;
    createdAt: string;
    user: {
      username: string;
    };
  };
  onDelete: (id: string, type: string) => void;
}

const HistoryItem = React.memo(({ item, onDelete }: HistoryItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullArticle, setShowFullArticle] = useState(false);

  const getIcon = useMemo(() => {
    switch (item.type) {
      case 'article': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      case 'title': return <Type className="w-5 h-5 text-purple-500" />;
      case 'bg-removal': return <Scissors className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5" />;
    }
  }, [item.type]);

  const getTypeLabel = useMemo(() => {
    switch (item.type) {
      case 'article': return 'Article';
      case 'image': return 'Image';
      case 'title': return 'Title';
      case 'bg-removal': return 'Background Removal';
      default: return 'Unknown';
    }
  }, [item.type]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const handleCopy = useCallback(() => {
    const textToCopy = item.type === 'image' ? item.prompt || '' : item.content;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard');
  }, [item.type, item.prompt, item.content]);

  const handleView = useCallback(() => {
    if (item.type === 'image' || item.type === 'bg-removal') {
      window.open(item.content, '_blank');
    } else if (item.type === 'article') {
      setShowFullArticle(true);
    } else {
      toast.info('Viewing functionality coming soon');
    }
  }, [item.type, item.content]);

  const handleDownload = useCallback(() => {
    if (item.type === 'image' || item.type === 'bg-removal') {
      const link = document.createElement('a');
      link.href = item.content;
      link.download = `${item.type}-${item.id}.png`;
      link.click();
    } else {
      const blob = new Blob([item.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.type}-${item.id}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
    toast.success('Download started');
  }, [item.type, item.content, item.id]);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      await deleteHistoryItem(item.type, item.id);
      onDelete(item.id, item.type);
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  }, [item.type, item.id, onDelete]);

  return (
    <Card className="glass border-border/20 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              {getIcon}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getTypeLabel}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {item.prompt && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Prompt:</p>
              <p className="text-sm line-clamp-2">{item.prompt}</p>
            </div>
          )}
          
          {item.type === 'image' || item.type === 'bg-removal' ? (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img 
                src={item.content} 
                alt={item.title}
                className="w-full h-32 object-cover"
              />
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Content:</p>
              <div className="relative">
                <div className={`text-sm text-muted-foreground break-words overflow-hidden ${isExpanded ? 'max-h-48 overflow-y-auto scrollbar-thin' : 'line-clamp-3'}`}>
                  {item.type === 'article' ? (
                    <div 
                      className="prose prose-sm prose-invert max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: (isExpanded ? item.content : item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''))
                          .split('\n\n')
                          .map(paragraph => {
                            // Convert basic markdown
                            if (paragraph.startsWith('# ')) {
                              return `<h6 class="font-semibold text-foreground text-xs mb-1">${paragraph.slice(2)}</h6>`;
                            }
                            if (paragraph.startsWith('## ')) {
                              return `<h6 class="font-medium text-foreground text-xs mb-1">${paragraph.slice(3)}</h6>`;
                            }
                            const boldConverted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium">$1</strong>');
                            const italicConverted = boldConverted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
                            return paragraph.trim() ? `<span class="text-muted-foreground">${italicConverted}</span>` : '';
                          })
                          .filter(p => p)
                          .join(' ')
                      }}
                    />
                  ) : (
                    <span className="whitespace-pre-wrap">{item.content}</span>
                  )}
                </div>
                {item.content && item.content.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 h-6 px-2 text-xs hover:bg-primary/10"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            {item.user.username}
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={handleView}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Article Viewer Modal */}
      {item.type === 'article' && (
        <Dialog open={showFullArticle} onOpenChange={setShowFullArticle}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{item.title}</DialogTitle>
              <DialogDescription>
                Created {formatDate(item.createdAt)} • {item.user.username}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="prose prose-sm prose-invert max-w-none">
                <div 
                  className="leading-relaxed text-foreground space-y-3"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: item.content
                      .split('\n\n')
                      .map(paragraph => {
                        // Convert markdown headers
                        if (paragraph.startsWith('# ')) {
                          return `<h1 class="text-lg font-bold mb-2 mt-4 text-foreground">${paragraph.slice(2)}</h1>`;
                        }
                        if (paragraph.startsWith('## ')) {
                          return `<h2 class="text-base font-semibold mb-2 mt-4 text-foreground">${paragraph.slice(3)}</h2>`;
                        }
                        if (paragraph.startsWith('### ')) {
                          return `<h3 class="text-sm font-semibold mb-1 mt-3 text-foreground">${paragraph.slice(4)}</h3>`;
                        }
                        // Convert bold text
                        const boldConverted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
                        // Convert italic text
                        const italicConverted = boldConverted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
                        // Regular paragraphs
                        return paragraph.trim() ? `<p class="mb-3 text-muted-foreground leading-relaxed">${italicConverted}</p>` : '';
                      })
                      .join('')
                  }}
                />
              </div>
            </ScrollArea>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(item.content)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={() => {
                const blob = new Blob([item.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `article-${item.id}.txt`;
                link.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
});

const History = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Memoize the query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    type: activeTab,
    page: currentPage,
    limit: 12
  }), [activeTab, currentPage]);
  
  const cacheKey = `${queryParams.type}-${queryParams.page}-${queryParams.limit}`;
  
  const { data: historyData, loading, error, isStale, refetch, invalidateCache } = useUserHistory(queryParams.type, queryParams.page, queryParams.limit);

  // Handle cache invalidation on delete
  const handleDeleteWithCacheUpdate = useCallback(async (id: string, type: string) => {
    try {
      await deleteHistoryItem(type, id);
      invalidateCache();
      refetch();
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  }, [invalidateCache, refetch]);

  // Use useCallback to prevent unnecessary re-renders of child components
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (historyData?.pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [historyData?.pagination.hasNextPage]);

  // Memoize filtered history data
  const filteredHistoryData = useMemo(() => {
    if (!historyData?.history) return null;
    
    return {
      ...historyData,
      history: activeTab === 'all' 
        ? historyData.history 
        : historyData.history.filter(item => item.type === activeTab)
    };
  }, [historyData, activeTab]);

  // Memoize statistics calculation
  const statistics = useMemo(() => {
    if (!historyData?.history) return null;
    
    return {
      articles: historyData.history.filter(item => item.type === 'article').length,
      images: historyData.history.filter(item => item.type === 'image').length,
      titles: historyData.history.filter(item => item.type === 'title').length,
      bgRemovals: historyData.history.filter(item => item.type === 'bg-removal').length
    };
  }, [historyData]);

  if (loading && !historyData) {
    return <HistorySkeleton />;
  }

  if (error && !historyData) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-24">
            <p className="text-destructive">Error loading history: {error}</p>
            <Button onClick={refetch} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!historyData || !historyData.history) {
    return <HistorySkeleton />;
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">History</h1>
              <p className="text-muted-foreground">View and manage your AI generation history</p>
            </div>
          </div>
          
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Articles</p>
                    <p className="text-xl font-bold">{statistics.articles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Image className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Images</p>
                    <p className="text-xl font-bold">{statistics.images}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Type className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Titles</p>
                    <p className="text-xl font-bold">{statistics.titles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">BG Removals</p>
                    <p className="text-xl font-bold">{statistics.bgRemovals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="title">Titles</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="bg-removal">BG Removal</TabsTrigger>
          </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              {/* Show stale data indicator if data is stale */}
              {isStale && (
                <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Data may be outdated. <Button variant="link" size="sm" onClick={refetch} className="p-0 h-auto">Refresh</Button>
                </div>
              )}

              {!historyData?.history.length ? (
              <Card className="glass border-border/20">
                <CardContent className="p-12 text-center">
                  <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No history found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' 
                      ? "Start generating content to see your history here"
                      : `No ${activeTab} generations found. Try generating some content first.`
                    }
                  </p>
                </CardContent>
              </Card>
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {historyData.history.map((item) => (
                    <HistoryItem 
                      key={item.id} 
                      item={item} 
                      onDelete={handleDeleteWithCacheUpdate}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {historyData.pagination.hasNextPage && (
                  <div className="mt-8 text-center">
                    <Button 
                      onClick={handleLoadMore} 
                      variant="outline"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}

                {/* Pagination Info */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing {historyData.history.length} of {historyData.pagination.totalItems} items
                  {historyData.pagination.totalPages > 1 && (
                    <span> • Page {historyData.pagination.currentPage} of {historyData.pagination.totalPages}</span>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;