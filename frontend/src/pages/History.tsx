import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { useUserHistory, deleteHistoryItem } from '@/hooks/useApi';

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

const HistoryItem = ({ item, onDelete }: HistoryItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getIcon = () => {
    switch (item.type) {
      case 'article': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      case 'title': return <Type className="w-5 h-5 text-purple-500" />;
      case 'bg-removal': return <Scissors className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'article': return 'Article';
      case 'image': return 'Image';
      case 'title': return 'Title';
      case 'bg-removal': return 'Background Removal';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
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
  };

  const handleCopy = () => {
    const textToCopy = item.type === 'image' ? item.prompt || '' : item.content;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard');
  };

  const handleView = () => {
    if (item.type === 'image' || item.type === 'bg-removal') {
      window.open(item.content, '_blank');
    } else {
      toast.info('Viewing functionality coming soon');
    }
  };

  const handleDownload = () => {
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
  };

  const handleDelete = async () => {
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
  };

  return (
    <Card className="glass border-border/20 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getTypeLabel()}
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
              <p className="text-sm line-clamp-3 text-muted-foreground">{item.content}</p>
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
    </Card>
  );
};

const History = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: historyData, loading, error, refetch } = useUserHistory(activeTab, currentPage, 12);

  console.log("🔍 Frontend History - Data:", historyData);
  console.log("🔍 Frontend History - Loading:", loading);
  console.log("🔍 Frontend History - Error:", error);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleDeleteItem = (id: string, type: string) => {
    // Refetch data after deletion
    refetch();
  };

  const handleLoadMore = () => {
    if (historyData?.pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      </div>
    );
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
        {historyData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Articles</p>
                    <p className="text-xl font-bold">
                      {historyData.history.filter(item => item.type === 'article').length}
                    </p>
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
                    <p className="text-xl font-bold">
                      {historyData.history.filter(item => item.type === 'image').length}
                    </p>
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
                    <p className="text-xl font-bold">
                      {historyData.history.filter(item => item.type === 'title').length}
                    </p>
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
                    <p className="text-xl font-bold">
                      {historyData.history.filter(item => item.type === 'bg-removal').length}
                    </p>
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
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {historyData.history.map((item) => (
                    <HistoryItem 
                      key={item.id} 
                      item={item} 
                      onDelete={handleDeleteItem}
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