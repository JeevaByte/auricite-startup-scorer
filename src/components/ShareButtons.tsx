
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Linkedin, Mail } from 'lucide-react';

export const ShareButtons = () => {
  const shareUrl = window.location.href;
  const shareText = "I just completed my startup investment readiness assessment!";

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const subject = 'My Startup Assessment Results';
    const body = `${shareText}\n\nCheck it out: ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Button onClick={handleTwitterShare} variant="outline" className="flex items-center space-x-2">
        <Twitter className="h-4 w-4" />
        <span>Share on Twitter</span>
      </Button>
      
      <Button onClick={handleLinkedInShare} variant="outline" className="flex items-center space-x-2">
        <Linkedin className="h-4 w-4" />
        <span>Share on LinkedIn</span>
      </Button>
      
      <Button onClick={handleEmailShare} variant="outline" className="flex items-center space-x-2">
        <Mail className="h-4 w-4" />
        <span>Share via Email</span>
      </Button>
      
      <Button onClick={handleCopyLink} variant="outline" className="flex items-center space-x-2">
        <Share2 className="h-4 w-4" />
        <span>Copy Link</span>
      </Button>
    </div>
  );
};
