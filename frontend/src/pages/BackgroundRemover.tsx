import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scissors, Upload, Download, RefreshCw, Eye, ImageIcon, Info } from 'lucide-react';
import { toast } from 'sonner';

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    try {
      // Convert data URL to File object
      const res = await fetch(originalImage);
      const blob = await res.blob();
      const file = new File([blob], fileName || 'upload.png', { type: blob.type });

      // Prepare form data as expected by backend (field name = userImgURL)
      const formData = new FormData();
      formData.append('userImgURL', file);

      // Determine if user is authenticated and use appropriate endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Use authenticated endpoint if user is logged in, otherwise use public endpoint
      const endpoint = token ? 'removeBG' : 'removeBG-public';
      console.log(`🔍 Using endpoint: ${endpoint}, authenticated: ${!!token}`);

      const response = await fetch(`${apiUrl}/api/background/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Background removal failed:', response.status, text);
        toast.error('Background removal failed. See console for details.');
        setIsProcessing(false);
        return;
      }

      const json = await response.json();
      // Backend returns ApiResponse with data at json.data.resImgURL
      const imageUrl = json?.data?.resImgURL || json?.data?.resImgURL;
      if (imageUrl) {
        setProcessedImage(imageUrl);
        if (isAuthenticated) {
          toast.success('Background removed successfully! Work saved to your history.');
        } else {
          toast.success('Background removed successfully! Sign in to save your work.');
        }
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error while removing background:', err);
      toast.error('An error occurred while processing the image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `background-removed-${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } } as any;
      handleFileSelect(event);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Scissors className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Background Remover</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Remove backgrounds from images instantly with precision AI technology. 
            Perfect for product photos, portraits, and professional imagery.
          </p>
        </div>

        {/* Authentication Status Alert */}
        {!isAuthenticated && (
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You're using the background remover as a guest. <a href="/signin" className="underline font-medium hover:text-primary">Sign in</a> to save your work to your history and dashboard.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        {!originalImage && (
          <Card className="glass border-border/20 mb-8">
            <CardHeader className="text-center">
              <CardTitle>Upload Your Image</CardTitle>
              <CardDescription>
                Drag and drop an image or click to browse. Supports JPG, PNG, WEBP up to 10MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-smooth cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop your image here</p>
                <p className="text-muted-foreground mb-4">or click to browse files</p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Section */}
        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Original Image */}
            <Card className="glass border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Original Image</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-64 object-contain rounded-lg bg-white/5"
                  />
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                      Original
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 truncate">
                  {fileName}
                </p>
              </CardContent>
            </Card>

            {/* Processed Image */}
            <Card className="glass border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Background Removed</CardTitle>
                  {processedImage && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(processedImage, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {processedImage ? (
                  <div className="relative">
                    <div className="w-full h-64 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Processed
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Processed image will appear here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Button */}
        {originalImage && (
          <div className="text-center mb-12">
            <Button
              onClick={handleRemoveBackground}
              disabled={isProcessing}
              size="lg"
              className="gradient-primary hover-glow px-8"
            >
              {isProcessing ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-2" />
                  Removing Background...
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5 mr-2" />
                  Remove Background
                </>
              )}
            </Button>
            {isProcessing && (
              <p className="text-sm text-muted-foreground mt-2">
                This may take 10-30 seconds depending on image complexity...
              </p>
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Precision AI</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI that preserves fine details and edges
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Easy Upload</h3>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload your images
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Instant Download</h3>
              <p className="text-sm text-muted-foreground">
                Download your processed images immediately
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Preview First</h3>
              <p className="text-sm text-muted-foreground">
                See the results before downloading
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;