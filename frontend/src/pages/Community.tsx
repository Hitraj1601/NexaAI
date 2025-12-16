import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Heart, 
  Share2, 
  Bookmark, 
  Filter,
  Search,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

const Community = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts', count: 156 },
    { id: 'tips', name: 'Tips & Tricks', count: 43 },
    { id: 'showcase', name: 'Showcase', count: 28 },
    { id: 'feedback', name: 'Feedback', count: 31 },
    { id: 'questions', name: 'Questions', count: 37 },
    { id: 'updates', name: 'Updates', count: 17 },
  ];

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Chen',
        avatar: 'SC',
        role: 'Content Creator'
      },
      title: 'Amazing Results with AI Article Writer!',
      content: 'Just wanted to share my experience using NexaAI\'s article writer. I\'ve been able to create 10+ blog posts this week with minimal editing required. The quality is consistently high and it really understands the tone I\'m going for. Has anyone else had similar experiences?',
      category: 'showcase',
      tags: ['article-writer', 'productivity', 'success-story'],
      likes: 24,
      comments: 8,
      timeAgo: '2 hours ago',
      isLiked: false,
      isBookmarked: true,
    },
    {
      id: '2',
      author: {
        name: 'David Rodriguez',
        avatar: 'DR',
        role: 'Marketing Manager'
      },
      title: 'Best practices for title generation?',
      content: 'I\'ve been experimenting with the title generator and getting mixed results. Sometimes the titles are perfect, other times they feel too generic. What strategies do you use to get better, more specific titles? Any particular prompts that work well?',
      category: 'questions',
      tags: ['title-generator', 'best-practices', 'help'],
      likes: 15,
      comments: 12,
      timeAgo: '4 hours ago',
      isLiked: true,
      isBookmarked: false,
    },
    {
      id: '3',
      author: {
        name: 'Emily Johnson',
        avatar: 'EJ',
        role: 'Freelance Designer'
      },
      title: 'Background remover saved my project!',
      content: 'Had a client emergency where I needed to remove backgrounds from 50+ product photos. The AI background remover processed them in minutes with incredible accuracy. This tool literally saved my weekend and my client relationship!',
      category: 'showcase',
      tags: ['background-remover', 'client-work', 'time-saving'],
      likes: 31,
      comments: 6,
      timeAgo: '1 day ago',
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: '4',
      author: {
        name: 'Alex Thompson',
        avatar: 'AT',
        role: 'Job Seeker'
      },
      title: 'Resume reviewer feedback helped me land interviews!',
      content: 'Used the resume reviewer tool last month and implemented all the suggestions. Within 2 weeks I got callbacks from 3 companies! The AI really knows what recruiters are looking for. Especially loved the ATS optimization tips.',
      category: 'tips',
      tags: ['resume-reviewer', 'job-search', 'success'],
      likes: 42,
      comments: 15,
      timeAgo: '2 days ago',
      isLiked: true,
      isBookmarked: true,
    },
  ]);

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        avatar: 'YU',
        role: 'Community Member'
      },
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      tags: ['user-post'],
      likes: 0,
      comments: 0,
      timeAgo: 'just now',
      isLiked: false,
      isBookmarked: false,
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: 'general' });
    setIsCreatingPost(false);
    toast.success('Post created successfully!');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
    toast.success('Post bookmarked!');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">NexaAI Community</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with fellow creators, share your experiences, and learn from the community. 
            Discover tips, showcase your work, and get help from experts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Create Post Button */}
              <Button 
                onClick={() => setIsCreatingPost(true)}
                className="w-full gradient-primary hover-glow"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Post
              </Button>

              {/* Categories */}
              <Card className="glass border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-smooth ${
                        selectedCategory === category.id
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <span className="text-sm font-medium">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card className="glass border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg">Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">2,847</div>
                      <div className="text-xs text-muted-foreground">Active Members</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">156</div>
                      <div className="text-xs text-muted-foreground">Posts This Week</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">89%</div>
                      <div className="text-xs text-muted-foreground">Helpful Responses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="default">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Create Post Modal */}
            {isCreatingPost && (
              <Card className="glass border-border/20 mb-8">
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                  <CardDescription>
                    Share your experience, ask questions, or showcase your work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="What would you like to share with the community?"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                    >
                      <option value="general">General</option>
                      <option value="tips">Tips & Tricks</option>
                      <option value="showcase">Showcase</option>
                      <option value="questions">Questions</option>
                      <option value="feedback">Feedback</option>
                    </select>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingPost(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePost} className="gradient-primary">
                        Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts List */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="glass border-border/20 hover:border-primary/30 transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="gradient-primary text-primary-foreground">
                            {post.author.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{post.author.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {post.author.role}
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            {post.timeAgo}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {post.content}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 text-sm transition-smooth ${
                            post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`transition-smooth ${
                          post.isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <Card className="glass border-border/20">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters, or be the first to create a post!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;