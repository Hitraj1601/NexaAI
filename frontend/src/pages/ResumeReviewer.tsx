import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileCheck, Upload, Download, RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeAnalysis {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    status: 'good' | 'warning' | 'error';
    feedback: string;
  }[];
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

const ResumeReviewer = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }

      setUploadedFile(file);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a resume first');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis: ResumeAnalysis = {
        overallScore: 78,
        sections: [
          {
            name: 'Contact Information',
            score: 95,
            status: 'good',
            feedback: 'Complete contact information with professional email and LinkedIn profile.'
          },
          {
            name: 'Professional Summary',
            score: 72,
            status: 'warning',
            feedback: 'Good summary but could be more specific about achievements and quantifiable results.'
          },
          {
            name: 'Work Experience',
            score: 85,
            status: 'good',
            feedback: 'Strong work experience with clear progression. Some roles could benefit from more quantified achievements.'
          },
          {
            name: 'Skills Section',
            score: 68,
            status: 'warning',
            feedback: 'Skills are listed but lack organization. Consider grouping by category (Technical, Soft Skills, etc.).'
          },
          {
            name: 'Education',
            score: 90,
            status: 'good',
            feedback: 'Education section is well-formatted with relevant details.'
          },
          {
            name: 'Formatting & Design',
            score: 60,
            status: 'error',
            feedback: 'Resume formatting needs improvement. Inconsistent spacing and font sizes throughout.'
          }
        ],
        suggestions: [
          'Add quantifiable achievements to work experience (e.g., "Increased sales by 25%")',
          'Improve overall formatting consistency',
          'Include relevant keywords for your target industry',
          'Add a projects section if you have relevant portfolio work',
          'Consider reducing content to fit on 1-2 pages maximum'
        ],
        strengths: [
          'Strong educational background',
          'Progressive career advancement',
          'Complete contact information',
          'Relevant work experience',
          'Professional email address'
        ],
        improvements: [
          'Format consistency throughout the document',
          'More specific and quantified achievements',
          'Better organization of skills section',
          'Stronger action verbs in job descriptions',
          'Tailoring content to specific job requirements'
        ]
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      toast.success('Resume analysis complete!');
    }, 4000);
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    
    const reportContent = `Resume Analysis Report
Overall Score: ${analysis.overallScore}/100

SECTION SCORES:
${analysis.sections.map(section => 
  `${section.name}: ${section.score}/100 - ${section.feedback}`
).join('\n')}

STRENGTHS:
${analysis.strengths.map(strength => `• ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT:
${analysis.improvements.map(improvement => `• ${improvement}`).join('\n')}

SUGGESTIONS:
${analysis.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const handleReset = () => {
    setUploadedFile(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <FileCheck className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Resume Reviewer</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get expert AI feedback on your resume with actionable suggestions for improvement. 
            Optimize your resume to stand out to employers and ATS systems.
          </p>
        </div>

        {/* Upload Section */}
        {!uploadedFile && (
          <Card className="glass border-border/20 mb-8">
            <CardHeader className="text-center">
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your resume in PDF or Word format (max 5MB) for comprehensive AI analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-smooth cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop your resume here</p>
                <p className="text-muted-foreground mb-4">or click to browse files</p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Resume
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Info & Analysis Button */}
        {uploadedFile && !analysis && (
          <Card className="glass border-border/20 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="gradient-primary hover-glow"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="loading-spinner w-5 h-5 mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-5 h-5 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Overall Score */}
            <Card className="glass border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Overall Resume Score</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Analyze New Resume
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">out of 100</div>
                  </div>
                  <div className="flex-1">
                    <Progress value={analysis.overallScore} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {analysis.overallScore >= 80 ? 'Excellent resume!' : 
                       analysis.overallScore >= 60 ? 'Good resume with room for improvement' : 
                       'Resume needs significant improvements'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Scores */}
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle>Section Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of each resume section with specific feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.sections.map((section, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(section.status)}
                          <h3 className="font-medium">{section.name}</h3>
                          <Badge variant="secondary">{section.score}/100</Badge>
                        </div>
                        <Progress value={section.score} className="w-24 h-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">{section.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle>Actionable Suggestions</CardTitle>
                <CardDescription>
                  Specific recommendations to improve your resume's effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                      <span className="flex-shrink-0 w-6 h-6 gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI reviews every section of your resume
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Detailed Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Get specific suggestions for each resume section
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Export Report</h3>
              <p className="text-sm text-muted-foreground">
                Download your analysis report for future reference
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Unlimited Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Analyze multiple versions as you improve
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeReviewer;