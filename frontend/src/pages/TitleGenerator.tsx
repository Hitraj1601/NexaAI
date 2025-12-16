import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Copy, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const TitleGenerator = () => {
  const [userContent, setUserContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!userContent.trim()) {
      toast.error('Please enter your blog content');
      return;
    }

    setIsGenerating(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please sign in to generate blog titles');
        return;
      }

      const response = await fetch(`${apiUrl}/api/blogtitle/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userContent }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          toast.error('Session expired. Please sign in again.');
          return;
        }
        throw new Error('Failed to generate blog title');
      }

      const json = await response.json();
      console.log('API Response:', json); // Debug log
      
      // Handle ApiResponse structure: { statusCode, message, data: blogTitle }
      let title = '';
      
      // The backend returns the blogTitle object in data, which has a title property
      if (json?.data?.title) {
        title = json.data.title;
      } else if (json?.title) {
        title = json.title;
      } else if (json?.data && typeof json.data === 'string') {
        title = json.data;
      } else if (typeof json === 'string') {
        title = json;
      }
      
      console.log('Extracted title:', title); // Debug log
      
      if (title && title.trim()) {
        const cleanTitle = title.trim();
        setGeneratedTitle(cleanTitle);
        setShowSuccess(true);
        toast.success('Blog title generated successfully!');
        
        // Hide success animation after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        console.error('No valid title found in response:', json);
        throw new Error('No title received from server');
      }
    } catch (error) {
      console.error('Error generating blog title:', error);
      toast.error('Failed to generate blog title. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTitle = () => {
    if (generatedTitle) {
      navigator.clipboard.writeText(generatedTitle);
      toast.success('Title copied to clipboard!');
    }
  };

  const handleReset = () => {
    setUserContent('');
    setGeneratedTitle('');
    setShowSuccess(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Blog Title Generator</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate catchy, SEO-optimized blog titles from your content. 
            Paste your blog article content and get the perfect title that captures attention.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="glass border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Blog Content Input
              </CardTitle>
              <CardDescription>
                Paste your blog article content below to generate a compelling title
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Blog Article Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your complete blog article content here. The more detailed your content, the better the generated title will be..."
                  value={userContent}
                  onChange={(e) => setUserContent(e.target.value)}
                  className="min-h-[300px] resize-none"
                  maxLength={10000}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Characters: {userContent.length}/10,000</span>
                  <span>Words: {userContent.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !userContent.trim()}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Title...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Title
                    </>
                  )}
                </Button>
                {(userContent || generatedTitle) && (
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Title Section */}
          <Card className="glass border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Generated Blog Title
              </CardTitle>
              <CardDescription>
                Your AI-generated blog title will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 mb-6">
                    <div className="loading-spinner w-full h-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Generating Your Perfect Title...
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Our AI is analyzing your content to create the most compelling blog title.
                  </p>
                </div>
              ) : generatedTitle ? (
                <div className="space-y-6">
                  {/* Title Display Container */}
                  <div className={`relative p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 rounded-xl border-2 border-primary/20 shadow-lg transition-all duration-500 ${showSuccess ? 'scale-105 border-success/50 bg-success/5' : ''}`}>
                    {/* Success Animation */}
                    {showSuccess && (
                      <div className="absolute top-4 right-4 text-success animate-bounce">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    )}
                    
                    {/* Title Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${showSuccess ? 'bg-success' : 'bg-primary'}`}></div>
                        <span className={`text-sm font-medium ${showSuccess ? 'text-success' : 'text-primary'}`}>
                          {showSuccess ? 'Title Generated!' : 'Generated Title'}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed tracking-tight">
                        {generatedTitle}
                      </h2>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Characters: {generatedTitle.length}</span>
                        <span>•</span>
                        <span>Words: {generatedTitle.trim().split(/\s+/).length}</span>
                      </div>
                    </div>
                    
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl transition-colors duration-500 ${showSuccess ? 'bg-success/10' : 'bg-primary/5'}`}></div>
                    <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full blur-xl transition-colors duration-500 ${showSuccess ? 'bg-success/10' : 'bg-accent/5'}`}></div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleCopyTitle}
                      variant="default"
                      className="flex-1 font-medium"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Title
                    </Button>
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !userContent.trim()}
                      variant="outline"
                      className="font-medium"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-xl">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-border/30 flex items-center justify-center mb-6 bg-muted/20">
                    <FileText className="w-16 h-16 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Title Generated Yet
                  </h3>
                  <p className="text-muted-foreground max-w-sm leading-relaxed">
                    Your AI-generated blog title will appear here. Paste your blog content in the left panel and click "Generate Title" to get started.
                  </p>
                  <div className="mt-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-sm text-primary font-medium">
                      ✨ Powered by AI
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Uses advanced AI to analyze your content and generate perfect titles
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Content-Based</h3>
              <p className="text-sm text-muted-foreground">
                Generates titles based on your actual content for maximum relevance
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Copy className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">One-Click Copy</h3>
              <p className="text-sm text-muted-foreground">
                Instantly copy your generated title with a single click
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TitleGenerator;