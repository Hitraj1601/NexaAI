import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenTool, Copy, Download, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ArticleWriter = () => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic or prompt');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    // setTimeout(() => {
    //   const sampleContent = `# ${title || 'AI-Generated Article'}

    //   setGeneratedContent(sampleContent);
    //   setIsGenerating(false);
    //   toast.success('Article generated successfully!');
    // }, 3000);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      console.log('Token from localStorage:', token ? 'Present' : 'Not found');
      
      if (!token) {
        toast.error('Please sign in to generate articles');
        console.log('No token found in localStorage');
        return;
      }

      // Send all form fields to backend
      const payload = { 
        title: title.trim() || undefined,
        tone, 
        length, 
        topic: prompt.trim() 
      };

      console.log('Making request to:', `${apiUrl}/api/article/create`);
      const response = await fetch(`${apiUrl}/api/article/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          toast.error('Session expired. Please sign in again.');
          return;
        }
        throw new Error('Failed to generate article');
      }

      const json = await response.json();
      // backend ApiResponse structure: { status, data, message }
      const data = json?.data || json;
      setGeneratedContent(data.content || '');
      setGeneratedTitle(data.title || '');
      toast.success('Article generated successfully!');

    } 
    catch (error) {
      console.error(error);
      toast.error('Error generating article. Please try again.');
    }
     finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullContent = generatedTitle ? `# ${generatedTitle}\n\n${generatedContent}` : generatedContent;
    navigator.clipboard.writeText(fullContent);
    toast.success('Content copied to clipboard!');
  };

  const handleDownload = () => {
    const fullContent = generatedTitle ? `# ${generatedTitle}\n\n${generatedContent}` : generatedContent;
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedTitle || title || 'ai-article'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Article downloaded!');
  };

  return (
    <div className="p-4 md:p-8">
      <div className={`mx-auto ${generatedContent ? 'max-w-full px-4' : 'max-w-7xl'}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <PenTool className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Article Writer</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate high-quality articles and blog posts with advanced AI. 
            Simply provide a topic or prompt, and let our AI create engaging content for you.
          </p>
        </div>

        <div className={`${generatedContent ? 'space-y-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
          {/* Input Section */}
          <Card className="glass border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Article Configuration
              </CardTitle>
              <CardDescription>
                Configure your article settings and provide a detailed prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Enter article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (300-500 words)</SelectItem>
                      <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                      <SelectItem value="long">Long (1500-2000 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Topic or Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to write about. Be as detailed as possible for better results..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full gradient-primary hover-glow"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner w-5 h-5 mr-2" />
                    Generating Article...
                  </>
                ) : (
                  <>
                    <PenTool className="w-5 h-5 mr-2" />
                    Generate Article
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className={`glass border-border/20 ${generatedContent ? 'w-full' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Article</CardTitle>
                  <CardDescription>
                    Your AI-generated content will appear here
                  </CardDescription>
                </div>
                {generatedContent && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className={generatedContent ? 'p-0' : ''}>
              {generatedContent ? (
                <div className="w-full">
                  {/* Generated Title */}
                  {generatedTitle && (
                    <div className="mb-4 mx-6 mt-6 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                      <h2 className="text-lg font-bold text-foreground leading-tight">
                        {generatedTitle}
                      </h2>
                    </div>
                  )}
                  
                  {/* Generated Content with Modern Typography */}
                  <div className="max-h-[70vh] overflow-y-auto scrollbar-thin px-6 pb-6">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div 
                        className="leading-relaxed text-foreground space-y-3 break-words"
                        style={{
                          fontSize: '15px',
                          lineHeight: '1.7',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: generatedContent
                            .split('\n\n')
                            .map(paragraph => {
                              // Convert markdown headers
                              if (paragraph.startsWith('# ')) {
                                return `<h1 class="text-xl font-bold mb-3 mt-5 text-foreground break-words">${paragraph.slice(2)}</h1>`;
                              }
                              if (paragraph.startsWith('## ')) {
                                return `<h2 class="text-lg font-semibold mb-3 mt-4 text-foreground break-words">${paragraph.slice(3)}</h2>`;
                              }
                              if (paragraph.startsWith('### ')) {
                                return `<h3 class="text-base font-semibold mb-2 mt-3 text-foreground break-words">${paragraph.slice(4)}</h3>`;
                              }
                              // Convert bold text
                              const boldConverted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
                              // Convert italic text
                              const italicConverted = boldConverted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
                              // Regular paragraphs
                              return paragraph.trim() ? `<p class="mb-4 text-muted-foreground leading-relaxed break-words" style="word-wrap: break-word; overflow-wrap: break-word;">${italicConverted}</p>` : '';
                            })
                            .join('')
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
                    <PenTool className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Your generated article will appear here. Fill out the form and click "Generate Article" to get started.
                  </p>
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
                Advanced language models create human-like content
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Copy className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Easy Export</h3>
              <p className="text-sm text-muted-foreground">
                Copy to clipboard or download as markdown file
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Regenerate</h3>
              <p className="text-sm text-muted-foreground">
                Not satisfied? Generate new versions instantly
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleWriter;