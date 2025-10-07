import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Loader2 } from 'lucide-react';

interface DonationButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const DonationButton: React.FC<DonationButtonProps> = ({ 
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const predefinedAmounts = [10, 25, 50, 100, 250];

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount (minimum $1).",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-donation', {
        body: {
          amount: Math.round(donationAmount * 100), // Convert to cents
          donorName: donorName.trim() || null,
          message: message.trim() || null,
          email: email.trim()
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "Please complete your donation in the new tab. Thank you for your generosity!",
        });
        
        setIsOpen(false);
        // Reset form
        setAmount('');
        setDonorName('');
        setMessage('');
        setEmail('');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast({
        title: "Donation Failed",
        description: "Unable to process your donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Heart className="h-4 w-4" />
          Donate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support Our Mission
          </DialogTitle>
          <DialogDescription>
            Your donation helps us provide free tools and resources to help startups succeed. 
            Donors get access to premium features including our investor directory and learning resources.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleDonation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount ($)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {predefinedAmounts.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  type="button"
                  variant={amount === presetAmount.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(presetAmount.toString())}
                >
                  ${presetAmount}
                </Button>
              ))}
            </div>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorName">Your Name (Optional)</Label>
            <Input
              id="donorName"
              type="text"
              placeholder="Enter your name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Leave a message of support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">What you get:</h4>
            <ul className="text-sm space-y-1">
              <li>Access to Investor Directory</li>
              <li>Premium Learning Resources</li>
              <li>Pitch Deck Upload & Management</li>
              <li>Priority Support</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !amount || !email}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Donate ${amount || '0'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};