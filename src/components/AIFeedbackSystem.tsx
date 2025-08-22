
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, Lightbulb, TrendingUp, Target, Users, Zap, AlertTriangle, CheckCircle, Save, Upload, Download, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface DetailedAnalysis {
  sentiment: string;
  clarity: number;
  engagement: number;
  readability: number;
  persuasiveness: number;
  overallScore?: number;
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

export const AIFeedbackSystem = () => {
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<'pitch-deck' | 'business-plan' | 'marketing-copy' | 'general'>('general');
  const { toast } = useToast();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = [
        'text/plain', 
        'text/markdown',
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/msword'
      ];
      const validExtensions = ['.txt', '.md', '.doc', '.docx', '.pdf'];
      
      return validTypes.includes(file.type) || 
             validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    });

    if (validFiles.length === 0) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload files in supported formats: .txt, .md, .doc, .docx, or .pdf',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFiles(validFiles);
    
    // Read file content
    validFiles.forEach(file => {
      if (file.type === 'application/pdf') {
        // For PDF files, we'll show a placeholder and let the backend handle extraction
        setContent(prevContent => 
          prevContent + (prevContent ? '\n\n' : '') + 
          `--- ${file.name} ---\n[PDF content will be extracted during analysis]\n`
        );
      } else {
        // For text-based files, read directly
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(prevContent => 
            prevContent + (prevContent ? '\n\n' : '') + 
            `--- ${file.name} ---\n${text}`
          );
        };
        reader.readAsText(file);
      }
    });

    toast({
      title: 'Files Uploaded',
      description: `${validFiles.length} file(s) uploaded successfully. ${validFiles.some(f => f.type === 'application/pdf') ? 'PDF content will be extracted during analysis.' : ''}`,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      
      if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.4 + 5;
    };

    // Title
    addText('AI Content Analysis Report', 20, true);
    addText(`Content Type: ${selectedContentType.charAt(0).toUpperCase() + selectedContentType.slice(1).replace('-', ' ')}`, 12);
    addText(`Generated: ${new Date().toLocaleDateString()}`, 10);
    yPosition += 10;

    // Performance Metrics
    addText('Performance Metrics', 16, true);
    addText(`Clarity: ${analysis.clarity}%`, 12);
    addText(`Engagement: ${analysis.engagement}%`, 12);
    addText(`Readability: ${analysis.readability}%`, 12);
    addText(`Persuasiveness: ${analysis.persuasiveness}%`, 12);
    addText(`Overall Score: ${analysis.overallScore || analysis.competitiveAnalysis.yourScore}%`, 12, true);
    yPosition += 10;

    // Strengths
    addText('Content Strengths', 16, true);
    analysis.strengths.forEach(strength => {
      addText(`• ${strength.area} (${strength.score}%): ${strength.description}`, 11);
    });
    yPosition += 10;

    // Recommendations
    addText('Improvement Recommendations', 16, true);
    analysis.suggestions.forEach(suggestion => {
      addText(`${suggestion.category} (${suggestion.priority} priority)`, 12, true);
      addText(`Recommendation: ${suggestion.suggestion}`, 11);
      addText(`Impact: ${suggestion.impact}`, 11);
      addText(`Implementation: ${suggestion.implementation}`, 11);
      yPosition += 5;
    });

    doc.save(`content-analysis-${selectedContentType}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: 'PDF Downloaded',
      description: 'Your analysis report has been downloaded successfully.',
    });
  };

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter some content to analyze.',
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

    setIsAnalyzing(true);
    
    try {
      // Call our GPT-powered analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: {
          content: content.trim(),
          contentType: selectedContentType,
          fileName: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No analysis data received');
      }

      setAnalysis(data);
      
      // Save analysis to assessment history
      await saveAnalysisToHistory(data);
      
      toast({
        title: 'AI Analysis Complete',
        description: 'Your content has been analyzed by GPT and saved to your history.',
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: 'Analysis Failed',
        description: 'There was an error analyzing your content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDetailedAnalysis = (content: string, contentType: string): DetailedAnalysis => {
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    
    // Advanced content analysis factors
    const hasNumbers = /\d/.test(content);
    const hasQuestions = content.includes('?');
    const hasCTA = /\b(contact|call|buy|start|join|get|download|subscribe|learn more|sign up)\b/i.test(content);
    const hasEmotionalWords = /\b(amazing|revolutionary|breakthrough|transform|powerful|innovative|exciting|proven|guaranteed)\b/i.test(content);
    const hasDataPoints = content.includes('%') || content.includes('$') || /\b\d+[kmb]?\b/i.test(content);
    const paragraphCount = content.split('\n\n').filter(p => p.trim().length > 0).length;
    const complexityScore = content.split(/[;,]/).length / Math.max(sentenceCount, 1);
    
    // Content-type specific analysis
    let clarity, engagement, readability, persuasiveness;
    
    switch (contentType) {
      case 'pitch-deck':
        clarity = Math.min(95, Math.max(45, 
          75 + (hasDataPoints ? 15 : 0) - (avgWordsPerSentence > 25 ? 15 : 0) + (paragraphCount > 3 ? 10 : 0)
        ));
        engagement = Math.min(95, Math.max(50, 
          65 + (hasNumbers ? 10 : 0) + (hasEmotionalWords ? 15 : 0) + (hasQuestions ? 8 : 0)
        ));
        readability = Math.min(95, Math.max(55, 
          80 - (avgWordsPerSentence > 20 ? 20 : 0) + (wordCount > 500 && wordCount < 2000 ? 10 : 0)
        ));
        persuasiveness = Math.min(95, Math.max(60, 
          70 + (hasDataPoints ? 20 : 0) + (hasCTA ? 10 : 0) + (hasEmotionalWords ? 10 : 0)
        ));
        break;
        
      case 'business-plan':
        clarity = Math.min(95, Math.max(50, 
          70 + (paragraphCount > 5 ? 15 : 0) + (hasDataPoints ? 10 : 0) - (complexityScore > 3 ? 10 : 0)
        ));
        engagement = Math.min(95, Math.max(45, 
          60 + (wordCount > 1000 ? 15 : 0) + (hasNumbers ? 10 : 0) + (hasQuestions ? 5 : 0)
        ));
        readability = Math.min(95, Math.max(50, 
          75 - (avgWordsPerSentence > 25 ? 25 : 0) + (wordCount > 2000 ? 10 : 0)
        ));
        persuasiveness = Math.min(95, Math.max(55, 
          65 + (hasDataPoints ? 15 : 0) + (wordCount > 1500 ? 10 : 0) + (paragraphCount > 8 ? 8 : 0)
        ));
        break;
        
      case 'marketing-copy':
        clarity = Math.min(95, Math.max(60, 
          80 - (avgWordsPerSentence > 18 ? 20 : 0) + (hasCTA ? 10 : 0)
        ));
        engagement = Math.min(95, Math.max(55, 
          75 + (hasEmotionalWords ? 15 : 0) + (hasQuestions ? 10 : 0) + (hasCTA ? 8 : 0)
        ));
        readability = Math.min(95, Math.max(65, 
          85 - (avgWordsPerSentence > 15 ? 15 : 0) + (wordCount < 500 ? 5 : 0)
        ));
        persuasiveness = Math.min(95, Math.max(65, 
          80 + (hasCTA ? 15 : 0) + (hasEmotionalWords ? 10 : 0) + (hasDataPoints ? 5 : 0)
        ));
        break;
        
      default: // general
        clarity = Math.min(95, Math.max(55, 
          75 - (avgWordsPerSentence > 20 ? 10 : 0) + (paragraphCount > 2 ? 8 : 0)
        ));
        engagement = Math.min(95, Math.max(50, 
          65 + (hasQuestions ? 10 : 0) + (hasEmotionalWords ? 8 : 0) + (wordCount > 200 ? 7 : 0)
        ));
        readability = Math.min(95, Math.max(60, 
          78 - (complexityScore > 2 ? 15 : 0) + (avgWordsPerSentence < 18 ? 7 : 0)
        ));
        persuasiveness = Math.min(95, Math.max(50, 
          60 + (hasCTA ? 12 : 0) + (hasDataPoints ? 8 : 0) + (hasEmotionalWords ? 5 : 0)
        ));
    }

    return {
      sentiment: wordCount > 200 ? 'Positive' : 'Neutral',
      clarity,
      engagement,
      readability,
      persuasiveness,
      detailedMetrics: {
        wordCount,
        sentenceComplexity: avgWordsPerSentence > 20 ? 'Complex' : avgWordsPerSentence > 15 ? 'Moderate' : 'Simple',
        readingLevel: avgWordsPerSentence > 20 ? 'Graduate Level' : avgWordsPerSentence > 15 ? 'College Level' : 'High School Level',
        keywordDensity: Math.round((wordCount * 0.03) * 10) / 10,
        emotionalTone: contentType === 'marketing-copy' ? 'Persuasive & Engaging' : 'Professional & Confident',
        callToActionStrength: content.toLowerCase().includes('contact') || content.toLowerCase().includes('join') || content.toLowerCase().includes('start') ? 80 : 60
      },
      suggestions: generateSuggestions(contentType, clarity, engagement, wordCount),
      strengths: generateStrengths(contentType, clarity, engagement, readability),
      contentStructure: {
        introduction: Math.min(95, Math.max(60, 75 + (content.slice(0, 200).includes('?') ? 10 : 0))),
        bodyDevelopment: Math.min(95, Math.max(60, 80 + (wordCount > 300 ? 10 : 0))),
        conclusion: Math.min(95, Math.max(50, 70 + (content.slice(-200).toLowerCase().includes('contact') ? 15 : 0))),
        flow: Math.min(95, Math.max(60, 78 + (sentenceCount > 5 ? 5 : 0)))
      },
      competitiveAnalysis: {
        industryStandard: 65,
        yourScore: Math.round((clarity + engagement + readability + persuasiveness) / 4),
        percentile: Math.min(95, Math.max(25, Math.round((clarity + engagement + readability + persuasiveness) / 4 * 1.2)))
      }
    };
  };

  const generateSuggestions = (contentType: string, clarity: number, engagement: number, wordCount: number) => {
    const suggestions = [];
    
    if (clarity < 75) {
      suggestions.push({
        category: 'Clarity & Structure',
        priority: 'high' as const,
        suggestion: 'Simplify sentence structure and use shorter, clearer sentences',
        impact: 'Could improve clarity by 20-25%',
        implementation: 'Break long sentences into 2-3 shorter ones and use active voice'
      });
    }

    if (engagement < 70) {
      suggestions.push({
        category: 'Engagement',
        priority: 'high' as const,
        suggestion: 'Add more compelling hooks and engaging elements',
        impact: 'Could increase reader engagement by 30%',
        implementation: 'Start with questions, statistics, or compelling statements'
      });
    }

    if (wordCount < 200) {
      suggestions.push({
        category: 'Content Depth',
        priority: 'medium' as const,
        suggestion: 'Expand content with more detailed examples and explanations',
        impact: 'Provides more value and context to readers',
        implementation: 'Add specific examples, case studies, or detailed explanations'
      });
    }

    if (contentType === 'pitch-deck') {
      suggestions.push({
        category: 'Value Proposition',
        priority: 'high' as const,
        suggestion: 'Quantify benefits with specific metrics and ROI calculations',
        impact: 'Increases credibility and investor confidence by 40%',
        implementation: 'Replace vague terms with concrete numbers and percentages'
      });
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const generateStrengths = (contentType: string, clarity: number, engagement: number, readability: number) => {
    const strengths = [];
    
    if (clarity >= 80) {
      strengths.push({
        area: 'Clear Communication',
        description: 'Content is well-structured and easy to understand',
        score: clarity
      });
    }

    if (engagement >= 75) {
      strengths.push({
        area: 'Engaging Content',
        description: 'Successfully captures and maintains reader attention',
        score: engagement
      });
    }

    if (readability >= 80) {
      strengths.push({
        area: 'Readability',
        description: 'Appropriate reading level for target audience',
        score: readability
      });
    }

    // Always include at least 2 strengths
    if (strengths.length < 2) {
      strengths.push({
        area: 'Content Focus',
        description: 'Maintains clear focus on key objectives',
        score: Math.max(75, (clarity + engagement) / 2)
      });
    }

    return strengths.slice(0, 4); // Limit to 4 strengths
  };

  const saveAnalysisToHistory = async (analysisData: DetailedAnalysis) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('assessment_history')
        .insert({
          user_id: user.id,
          assessment_data: {
            type: 'ai_content_analysis',
            content: content,
            contentType: selectedContentType,
            timestamp: new Date().toISOString()
          } as any,
          score_result: {
            ...analysisData,
            contentAnalysis: true
          } as any
        });

      if (error) {
        console.error('Error saving analysis to history:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save analysis:', error);
      throw error;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Target className="h-4 w-4" />;
      case 'low':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Advanced AI Content Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Content Type (GPT will provide specialized analysis for each type)
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'pitch-deck', label: 'Pitch Deck' },
                { id: 'business-plan', label: 'Business Plan' },
                { id: 'marketing-copy', label: 'Marketing Copy' },
                { id: 'general', label: 'General Content' }
              ].map((type) => (
                <Button
                  key={type.id}
                  variant={selectedContentType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedContentType(type.id as any)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-sm font-medium mb-2 block">
              Upload files or paste your content for comprehensive AI analysis
            </label>
            
            {/* File Upload Section */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-1">Drag & drop files here, or click to select</p>
                  <p className="text-xs text-gray-500">
                    <strong>Supported formats:</strong> .txt, .md, .doc, .docx, .pdf<br />
                    <span className="text-gray-400">PDFs and Word docs will be processed automatically</span>
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Uploaded Files:</label>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Badge variant="outline" className="text-xs">{(file.size / 1024).toFixed(1)} KB</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <label className="text-sm font-medium mb-2 block">
                Or paste your content directly
              </label>
              <Textarea
                placeholder="Enter your content here for detailed AI analysis including sentiment, clarity, engagement, and specific improvement recommendations..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="text-xs text-gray-500 mt-1">
                {content.length} characters • Recommended: 500+ characters for detailed analysis
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={analyzeContent} 
              disabled={isAnalyzing || !user}
              className="flex-1"
            >
              {isAnalyzing ? 'Performing Advanced Analysis...' : 'Analyze Content with AI'}
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground mt-2">
                Please sign in to analyze content and save results to your history.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* Overall Metrics Dashboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>AI-Powered Performance Dashboard</span>
                  </CardTitle>
                </div>
                <Button 
                  onClick={downloadPDF}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.clarity}%</div>
                  <div className="text-sm text-gray-600">Clarity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.engagement}%</div>
                  <div className="text-sm text-gray-600">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.readability}%</div>
                  <div className="text-sm text-gray-600">Readability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysis.persuasiveness}%</div>
                  <div className="text-sm text-gray-600">Persuasiveness</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{analysis.overallScore || analysis.competitiveAnalysis.yourScore}%</div>
                  <div className="text-sm text-gray-600 font-medium">Overall Score</div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg py-1">{analysis.sentiment}</Badge>
                  <div className="text-sm text-gray-600">Sentiment</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Content Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Word Count:</span>
                      <span className="font-medium">{analysis.detailedMetrics.wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reading Level:</span>
                      <span className="font-medium">{analysis.detailedMetrics.readingLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sentence Complexity:</span>
                      <span className="font-medium">{analysis.detailedMetrics.sentenceComplexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emotional Tone:</span>
                      <span className="font-medium">{analysis.detailedMetrics.emotionalTone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Competitive Comparison</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Industry Average:</span>
                      <span className="font-medium">{analysis.competitiveAnalysis.industryStandard}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Score:</span>
                      <span className="font-medium text-green-600">{analysis.competitiveAnalysis.yourScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Percentile Rank:</span>
                      <span className="font-medium text-blue-600">{analysis.competitiveAnalysis.percentile}th</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Content Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{strength.area}</h4>
                      <Badge variant="outline">{strength.score}%</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{strength.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Actionable Improvement Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(suggestion.priority)}
                        <h4 className="font-medium">{suggestion.category}</h4>
                      </div>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority} priority
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Recommendation:</h5>
                        <p className="text-sm">{suggestion.suggestion}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Expected Impact:</h5>
                        <p className="text-sm text-green-700">{suggestion.impact}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">How to Implement:</h5>
                        <p className="text-sm text-blue-700">{suggestion.implementation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Structure Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Content Structure Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.introduction}%</div>
                  <div className="text-sm text-gray-600">Introduction</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.bodyDevelopment}%</div>
                  <div className="text-sm text-gray-600">Body Development</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.conclusion}%</div>
                  <div className="text-sm text-gray-600">Conclusion</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.flow}%</div>
                  <div className="text-sm text-gray-600">Overall Flow</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
