import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Twitter, Linkedin, Mail, MessageCircle, Facebook, Copy, Download } from 'lucide-react';
import { ScoreResult } from '@/utils/scoreCalculator';
import { generatePDFReport, PDFReportData } from '@/utils/pdfGenerator';
import { AssessmentData } from '@/utils/scoreCalculator';
import { RecommendationsData } from '@/utils/recommendationsService';
interface EnhancedShareButtonsProps {
  scoreResult: ScoreResult;
  assessmentData?: AssessmentData;
  recommendations?: RecommendationsData;
  userProfile?: {
    name?: string;
    email?: string;
    company?: string;
  };
}
export const EnhancedShareButtons = ({
  scoreResult,
  assessmentData,
  recommendations,
  userProfile
}: EnhancedShareButtonsProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const {
    toast
  } = useToast();
  const shareUrl = window.location.href;
  const shareText = `I scored ${scoreResult.totalScore}/999 on my startup investment readiness assessment! 🚀\n\n• Business Idea: ${scoreResult.businessIdea}/100\n• Financials: ${scoreResult.financials}/100\n• Team: ${scoreResult.team}/100\n• Traction: ${scoreResult.traction}/100`;
  const handleTwitterShare = () => {
    const text = `🚀 Just completed my startup investment readiness assessment!\n\nMy Score: ${scoreResult.totalScore}/999\n\n✅ Business Idea: ${scoreResult.businessIdea}/100\n💰 Financials: ${scoreResult.financials}/100\n👥 Team: ${scoreResult.team}/100\n📈 Traction: ${scoreResult.traction}/100\n\nTake yours:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=startup,investment,assessment`;
    window.open(url, '_blank');
  };
  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
  const handleWhatsAppShare = () => {
    const text = `🚀 *My Startup Investment Readiness Results*\n\nOverall Score: *${scoreResult.totalScore}/999*\n\n📊 Breakdown:\n• Business Idea: ${scoreResult.businessIdea}/100\n• Financials: ${scoreResult.financials}/100\n• Team: ${scoreResult.team}/100\n• Traction: ${scoreResult.traction}/100\n\nTake your assessment: ${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  const handleEmailShare = () => {
    const subject = 'My Startup Investment Readiness Assessment Results';
    const body = `Hi there!\n\nI just completed a comprehensive startup investment readiness assessment and wanted to share my results with you.\n\n${shareText}\n\nThe assessment covers key areas that investors look for and provides personalized recommendations for improvement.\n\nYou can take the assessment yourself here: ${shareUrl}\n\nBest regards!`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Share URL has been copied to your clipboard.'
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy link to clipboard.',
        variant: 'destructive'
      });
    }
  };
  const handlePDFDownload = async () => {
    if (!assessmentData) {
      toast({
        title: 'Cannot generate PDF',
        description: 'Assessment data is required to generate the PDF report.',
        variant: 'destructive'
      });
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const pdfData: PDFReportData = {
        assessmentData,
        scoreResult,
        recommendations,
        userProfile,
        generatedAt: new Date().toISOString(),
        includeDetailedAnalysis: true,
        includeScoreBreakdown: true,
        includeRecommendations: true
      };
      await generatePDFReport(pdfData);
      toast({
        title: 'PDF Generated!',
        description: 'Your comprehensive investment readiness report with recommendations and detailed analysis has been downloaded.'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Unable to generate PDF report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  return <div className="space-y-4">
      

      {/* PDF Download Button */}
      {assessmentData && <Button onClick={handlePDFDownload} disabled={isGeneratingPDF} className="w-full bg-red-600 hover:bg-red-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
        </Button>}

      {/* Social Media Share Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleWhatsAppShare} variant="outline" className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          <span>WhatsApp</span>
        </Button>
        
        <Button onClick={handleTwitterShare} variant="outline" className="flex items-center space-x-2">
          <Twitter className="h-4 w-4 text-blue-500" />
          <span>Twitter</span>
        </Button>
        
        <Button onClick={handleLinkedInShare} variant="outline" className="flex items-center space-x-2">
          <Linkedin className="h-4 w-4 text-blue-600" />
          <span>LinkedIn</span>
        </Button>
        
        <Button onClick={handleFacebookShare} variant="outline" className="flex items-center space-x-2">
          <Facebook className="h-4 w-4 text-blue-700" />
          <span>Facebook</span>
        </Button>
      </div>

      {/* Email and Copy Link */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleEmailShare} variant="outline" className="flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>Email</span>
        </Button>
        
        <Button onClick={handleCopyLink} variant="outline" className="flex items-center space-x-2">
          <Copy className="h-4 w-4" />
          <span>Copy Link</span>
        </Button>
      </div>
    </div>;
};