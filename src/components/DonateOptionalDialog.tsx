import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DonationButton } from './DonationButton';
import { Heart, X, ArrowRight } from 'lucide-react';

interface DonateOptionalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

export const DonateOptionalDialog = ({ isOpen, onClose, onSkip }: DonateOptionalDialogProps) => {
  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center space-x-2 pr-8">
            <Heart className="h-5 w-5 text-primary" />
            <span>Support Our Mission</span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Help us keep these tools free for all entrepreneurs by making an optional donation.
          </p>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Why Donate?</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm text-muted-foreground">
              <p>• Keep assessment tools free for everyone</p>
              <p>• Support platform development</p>
              <p>• Help other entrepreneurs succeed</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <DonationButton 
              variant="default" 
              className="w-full"
            />
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="w-full"
            >
              Skip & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Donations are completely optional. You can continue using all features for free.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};