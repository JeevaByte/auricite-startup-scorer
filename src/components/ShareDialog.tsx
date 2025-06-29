
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, CheckCircle, Twitter, Linkedin, Link } from 'lucide-react';
import { ScoreResult } from '@/pages/Index';
import { shareResults, copyToClipboard, generateShareableLink } from '@/utils/shareUtils';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  scoreResult: ScoreResult;
}

export const ShareDialog = ({ scoreResult }: ShareDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleNativeShare = async () => {
    try {
      const shared = await shareResults(scoreResult);
      if (shared) {
        toast({
          title: "Shared successfully!",
          description: "Your results have been shared.",
        });
        setIsOpen(false);
      } else {
        toast({
          title: "Copied to clipboard!",
          description: "Share text has been copied to your clipboard.",
        });
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error sharing",
        description: "Unable to share your results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareableLink = generateShareableLink(scoreResult);
      await copyToClipboard(shareableLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error copying link",
        description: "Unable to copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'linkedin') => {
    const text = `I scored ${scoreResult.totalScore}/999 on my startup investment readiness assessment! 🚀`;
    const url = window.location.origin;
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent('Startup Investment Readiness Assessment')}&summary=${encodeURIComponent(text)}`;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>Share Results</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Your Results</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-900">Your Score</p>
            <p className="text-2xl font-bold text-blue-600">{scoreResult.totalScore}/999</p>
            <div className="text-xs text-gray-600 mt-1">
              Business: {scoreResult.businessIdea} • Financials: {scoreResult.financials} • Team: {scoreResult.team} • Traction: {scoreResult.traction}
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleNativeShare}
              className="w-full justify-start"
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via device
            </Button>
            
            <Button
              onClick={handleCopyLink}
              className="w-full justify-start"
              variant="outline"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Link copied!' : 'Copy shareable link'}
            </Button>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleSocialShare('twitter')}
                className="flex-1 justify-start"
                variant="outline"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              
              <Button
                onClick={() => handleSocialShare('linkedin')}
                className="flex-1 justify-start"
                variant="outline"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Share your investment readiness score and encourage others to assess their startup too!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
