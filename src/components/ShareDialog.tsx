import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScoreResult } from '@/utils/scoreCalculator';
import { Share2, Copy, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateShareableLink, copyToClipboard } from '@/utils/shareUtils';

interface ShareDialogProps {
  scoreResult: ScoreResult;
}

export const ShareDialog = ({ scoreResult }: ShareDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const { toast } = useToast();

  useState(() => {
    if (scoreResult) {
      setShareableLink(generateShareableLink(scoreResult));
    }
  }, [scoreResult]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareableLink);
    if (success) {
      toast({
        title: "Copied to clipboard!",
        description: "Shareable link has been copied to your clipboard.",
      });
    } else {
      toast({
        title: "Error copying",
        description: "Unable to copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareTwitter = () => {
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Check out my Startup Investment Readiness Score: ${shareableLink}`
    )}`;
    window.open(twitterURL, '_blank');
  };

  const handleShareLinkedIn = () => {
    const linkedInURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`;
    window.open(linkedInURL, '_blank');
  };

  const handleShareFacebook = () => {
    const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`;
    window.open(facebookURL, '_blank');
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
          <DialogTitle>Share Your Results</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input id="link" value={shareableLink} readOnly className="col-span-3" />
            <Button variant="secondary" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={handleShareTwitter}>
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShareLinkedIn}>
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShareFacebook}>
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
