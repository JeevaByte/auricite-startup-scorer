import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, FileText, Lightbulb, TrendingUp, Target, Users, Zap, AlertTriangle, CheckCircle, Upload, Download, X, Loader2, BarChart3, PieChart, Activity } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { generateEnhancedPDF } from './EnhancedPDFGenerator';

interface DetailedAnalysis {
  sentiment: string;
  clarity: number;
  engagement: number;
  readability: number;
  persuasiveness: number;
  overallScore: number;
  detailedMetrics: {
    wordCount: number;
    sentenceComplexity: string;
    readingLevel: string;
    keywordDensity: number;
    emotionalTone: string;
    callToActionStrength: number;
  };
  suggestions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
    implementation: string;
  }[];
  strengths: {
    area: string;
    description: string;
    score: number;
  }[];
  contentStructure: {
    introduction: number;
    bodyDevelopment: number;
    conclusion: number;
    flow: number;
  };
  competitiveAnalysis: {
    industryStandard: number;
    yourScore: number;
    percentile: number;
  };
}

const contentTypeConfigs = {
  'pitch-deck': {
    title: 'Pitch Deck Analysis',
    description: 'Specialized analysis for investor presentations and pitch decks',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    placeholder: 'Paste your pitch deck content or upload your presentation...',
    acceptedFiles: ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt'],
    analysisPoints: ['Problem-Solution Fit', 'Market Size & Opportunity', 'Business Model Clarity', 'Traction & Validation', 'Team Strength', 'Financial Projections']
  },
  'business-plan': {
    title: 'Business Plan Analysis',
    description: 'Comprehensive analysis for business plans and strategic documents',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    placeholder: 'Paste your business plan content or upload your document...',
    acceptedFiles: ['.pdf', '.doc', '.docx', '.txt'],
    analysisPoints: ['Executive Summary', 'Market Analysis', 'Competitive Landscape', 'Operations Plan', 'Financial Strategy', 'Risk Assessment']
  },
  'marketing-copy': {
    title: 'Marketing Copy Analysis',
    description: 'Optimize your marketing materials and sales content',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    placeholder: 'Paste your marketing copy, website content, or sales materials...',
    acceptedFiles: ['.txt', '.doc', '.docx', '.html'],
    analysisPoints: ['Message Clarity', 'Persuasion Techniques', 'Call-to-Action Strength', 'Emotional Appeal', 'Target Audience Fit', 'Conversion Potential']
  },
  'general': {
    title: 'General Content Analysis',
    description: 'Analyze any type of content for clarity and effectiveness',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    placeholder: 'Paste any content you want analyzed...',
    acceptedFiles: ['.txt', '.doc', '.docx', '.pdf'],
    analysisPoints: ['Content Quality', 'Readability Score', 'Engagement Level', 'Structure & Flow', 'Key Message Clarity', 'Overall Effectiveness']
  }
};

type ContentType = keyof typeof contentTypeConfigs;

export const AdvancedAIContentAnalysis = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('pitch-deck');
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const config = contentTypeConfigs[selectedType];
  const IconComponent = config.icon;

  // Optimized file drop handler with instant feedback
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = [
        'text/plain', 'text/markdown', 'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/msword', 'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      return validTypes.includes(file.type) || 
             config.acceptedFiles.some(ext => file.name.toLowerCase().endsWith(ext));
    });

    if (validFiles.length === 0) {
      toast({
        title: 'Invalid File Type',
        description: `Please upload files in supported formats: ${config.acceptedFiles.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setUploadedFiles(validFiles);
    
    // Instant content processing for text files
    validFiles.forEach(file => {
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(prev => prev + (prev ? '\n\n' : '') + `--- ${file.name} ---\n${text}`);
        };
        reader.readAsText(file);
      } else {
        setContent(prev => prev + (prev ? '\n\n' : '') + `--- ${file.name} ---\n[File content will be extracted during analysis]`);
      }
    });

    toast({
      title: 'Files Uploaded Successfully',
      description: `${validFiles.length} file(s) ready for analysis`,
    });
  }, [config, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    multiple: true
  });

  // Optimized analysis function with instant UI feedback and validation
  const analyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter or upload content to analyze.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to analyze content.',
        variant: 'destructive',
      });
      return;
    }

    // Validate content length
    if (content.trim().length < 50) {
      toast({
        title: 'Content Too Short',
        description: 'Please provide at least 50 characters for meaningful analysis.',
        variant: 'destructive',
      });
      return;
    }

    if (content.trim().length > 50000) {
      toast({
        title: 'Content Too Long',
        description: 'Please limit content to 50,000 characters for optimal analysis.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Show immediate visual feedback
    const startTime = Date.now();
    
    try {
      // Enhanced payload with validation
      const payload = {
        content: content.trim(),
        contentType: selectedType,
        fileName: uploadedFiles[0]?.name,
        userId: user.id,
        timestamp: new Date().toISOString()
      };

      console.log('Starting analysis for:', selectedType, 'Content length:', content.length);

      // Progress indicators
      const progressTimer = setTimeout(() => {
        toast({
          title: 'AI Processing...',
          description: 'Analyzing content structure and patterns...',
        });
      }, 2000);

      const analysisPromise = supabase.functions.invoke('analyze-content', {
        body: payload
      });

      const { data, error } = await analysisPromise;
      clearTimeout(progressTimer);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Analysis service error');
      }
      
      if (!data) {
        throw new Error('No analysis data received from service');
      }

      // Validate response structure
      if (!data.overallScore || typeof data.overallScore !== 'number') {
        console.warn('Invalid response structure:', data);
        throw new Error('Invalid analysis response format');
      }

      setAnalysis(data);
      
      // Performance tracking
      const processingTime = Date.now() - startTime;
      console.log(`Analysis completed in ${processingTime}ms`);
      
      toast({
        title: 'Analysis Complete!',
        description: `${config.title} analyzed successfully. Score: ${data.overallScore}/100`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: 'Analysis Failed',
        description: `Error: ${errorMessage}. Please try again or contact support.`,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Memoized analysis display for better performance
  const analysisDisplay = useMemo(() => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* Overall Score Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Overall Analysis Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {analysis.overallScore}/100
              </div>
              <p className="text-muted-foreground">
                {analysis.overallScore >= 80 ? 'Excellent' : 
                 analysis.overallScore >= 60 ? 'Good' : 
                 analysis.overallScore >= 40 ? 'Needs Improvement' : 'Poor'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Clarity', value: analysis.clarity, icon: Target },
            { label: 'Engagement', value: analysis.engagement, icon: Users },
            { label: 'Readability', value: analysis.readability, icon: FileText },
            { label: 'Persuasiveness', value: analysis.persuasiveness, icon: TrendingUp }
          ].map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-4 text-center">
                <metric.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Strengths and Suggestions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <div className="font-medium">{strength.area}</div>
                      <div className="text-sm text-muted-foreground">{strength.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}>
                        {suggestion.priority}
                      </Badge>
                      <span className="font-medium text-sm">{suggestion.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }, [analysis]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Advanced AI Content Analysis
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get specialized AI-powered analysis tailored to your specific content type with instant results and actionable insights.
        </p>
      </div>

      {/* Content Type Selection */}
      <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as ContentType)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(contentTypeConfigs).map(([key, config]) => {
            const IconComp = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2 p-3">
                <IconComp className={`h-4 w-4 ${config.color}`} />
                <span className="hidden sm:inline">{config.title.replace(' Analysis', '')}</span>
                <span className="sm:hidden">{key === 'pitch-deck' ? 'Pitch' : key === 'business-plan' ? 'Plan' : key === 'marketing-copy' ? 'Marketing' : 'General'}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(contentTypeConfigs).map(([key, config]) => (
          <TabsContent key={key} value={key}>
            <Card className={`border-2 ${config.borderColor}`}>
              <CardHeader className={config.bgColor}>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className={`h-6 w-6 ${config.color}`} />
                  {config.title}
                </CardTitle>
                <p className="text-muted-foreground">{config.description}</p>
                
                {/* Analysis Points */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4">
                  {config.analysisPoints.map((point, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {point}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop files here...' : 'Drag & drop files or click to browse'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: {config.acceptedFiles.join(', ')}
                  </p>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                          <span>{file.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Input */}
                <div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={config.placeholder}
                    className="min-h-[200px] resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={analyzeContent}
                    disabled={isAnalyzing || !content.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze Content
                      </>
                    )}
                  </Button>
                  
                  {analysis && (
                    <Button
                      onClick={async () => {
                        try {
                          toast({
                            title: 'Generating PDF...',
                            description: 'Creating your detailed analysis report.',
                          });
                          await generateEnhancedPDF(analysis, selectedType, { name: user?.user_metadata?.full_name || 'User' });
                          toast({
                            title: 'PDF Generated!',
                            description: 'Your report has been downloaded successfully.',
                          });
                        } catch (error) {
                          console.error('PDF generation error:', error);
                          toast({
                            title: 'PDF Generation Failed',
                            description: 'Please try again or contact support.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      variant="outline"
                      disabled={isAnalyzing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Analysis Results */}
      {analysisDisplay}
    </div>
  );
};