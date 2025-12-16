import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Image, Download, RefreshCw, Sparkles, Grid, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your image');
      return;
    }

    setIsGenerating(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please sign in to generate images');
        return;
      }

      // Send simplified payload to backend
      const payload = {
        prompt: prompt.trim()
      };

      const response = await fetch(`${apiUrl}/api/image/createimg`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          toast.error('Session expired. Please sign in again.');
          return;
        }
        throw new Error('Failed to generate images. Please try again.');
      }

      const json = await response.json();
      console.log('API Response:', json); // Debug log
      
      // Handle the response based on your backend structure
      let newImages: GeneratedImage[] = [];
      
      if (json?.data) {
        // Single image response from backend
        const imageData = json.data;
        const newImage: GeneratedImage = {
          id: imageData.id || Date.now().toString(),
          url: imageData.url || imageData.genImgUrl,
          prompt: imageData.prompt || prompt
        };
        newImages = [newImage];
      }

      // Add new images to the existing ones
      setGeneratedImages(prev => [...newImages, ...prev]);
      toast.success(`Image${newImages.length > 1 ? 's' : ''} generated successfully!`);
    } catch (error: any) {
      console.error('Error generating images:', error);
      toast.error(error.message || 'Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, imageId: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `nexaai-generated-${imageId}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image download started!');
  };

  const handleViewLarge = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Image className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Image Generator</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your ideas into stunning visuals with our AI image generation. 
            Simply describe what you want to see, and our AI will create it for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="glass border-border/20 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Describe Your Image
                </CardTitle>
                <CardDescription>
                  Tell us what image you want to create in detail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Image Description</Label>
                  <Input
                    id="prompt"
                    placeholder="Describe the image you want to generate... e.g., 'A beautiful sunset over mountains'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific and descriptive for better results
                  </p>
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="w-5 h-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      This may take 30-60 seconds...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {generatedImages.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Generated Images</h2>
                  <Badge variant="secondary" className="text-sm">
                    <Grid className="w-4 h-4 mr-1" />
                    {generatedImages.length} images
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {generatedImages.map((image) => (
                    <Card key={image.id} className="glass border-border/20 overflow-hidden hover-lift">
                      <div className="relative group">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewLarge(image.url)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(image.url, image.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {image.prompt}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="glass border-border/20">
                <CardContent className="py-24">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
                      <Image className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Images Generated Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Enter a description for your image and click "Generate Images" to see your AI-created visuals here.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <p>AI-Powered</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Download className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <p>High Quality</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Styles</h3>
              <p className="text-sm text-muted-foreground">
                From realistic to artistic, choose your preferred style
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Image className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">High Resolution</h3>
              <p className="text-sm text-muted-foreground">
                Generate images up to 1024×1024 pixels
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Easy Download</h3>
              <p className="text-sm text-muted-foreground">
                Download your images in high quality formats
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Unlimited Tries</h3>
              <p className="text-sm text-muted-foreground">
                Generate as many variations as you need
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;