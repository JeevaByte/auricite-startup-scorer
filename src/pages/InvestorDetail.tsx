import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSavedItems } from '@/hooks/useSavedItems';
import { ArrowLeft, DollarSign, MapPin, Building2, Heart, Send } from 'lucide-react';

export default function InvestorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveInvestor, unsaveInvestor, isInvestorSaved } = useSavedItems();
  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInvestor();
  }, [id]);

  const fetchInvestor = async () => {
    try {
      const { data, error } = await supabase
        .from('investor_directory')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setInvestor(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!message.trim()) {
      toast({ title: 'Please enter a message', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please log in to connect', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('contact_requests').insert({
        investor_user_id: id,
        startup_user_id: user.id,
        message: message.trim()
      });

      if (error) throw error;

      toast({ title: 'Connection request sent successfully' });
      setMessage('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">Investor not found</h3>
          <Button onClick={() => navigate('/fundraiser-dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/fundraiser-dashboard')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{investor.name}</CardTitle>
                  {investor.organization && (
                    <p className="text-lg text-muted-foreground">
                      {investor.organization} {investor.title && `• ${investor.title}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isInvestorSaved(investor.id) ? unsaveInvestor(investor.id) : saveInvestor(investor.id)}
                  >
                    <Heart className={`h-4 w-4 ${isInvestorSaved(investor.id) ? 'fill-current' : ''}`} />
                  </Button>
                  {investor.is_verified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {investor.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{investor.bio}</p>
                </div>
              )}

              {investor.investment_thesis && (
                <div>
                  <h3 className="font-semibold mb-2">Investment Thesis</h3>
                  <p className="text-muted-foreground">{investor.investment_thesis}</p>
                </div>
              )}

              {investor.notable_investments && (
                <div>
                  <h3 className="font-semibold mb-2">Notable Investments</h3>
                  <p className="text-muted-foreground">{investor.notable_investments}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Investment Range</h3>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${investor.ticket_min?.toLocaleString()} - ${investor.ticket_max?.toLocaleString()}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  {investor.email && <p className="text-muted-foreground">{investor.email}</p>}
                  {investor.phone && <p className="text-muted-foreground">{investor.phone}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Investment Stages</h3>
                <div className="flex flex-wrap gap-2">
                  {investor.stages?.map((stage: string) => (
                    <Badge key={stage} variant="outline">{stage}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {investor.sectors?.map((sector: string) => (
                    <Badge key={sector} variant="secondary">{sector}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Regions</h3>
                <div className="flex flex-wrap gap-2">
                  {investor.regions?.map((region: string) => (
                    <Badge key={region} variant="outline">{region}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Send Connection Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Introduce yourself and explain why you'd like to connect..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
              <Button 
                className="w-full" 
                onClick={handleConnect}
                disabled={sending || !message.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Request'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
