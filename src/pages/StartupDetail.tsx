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
import { ArrowLeft, DollarSign, MapPin, Building2, Heart, Send, Star, Users } from 'lucide-react';

export default function StartupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveStartup, unsaveStartup, isStartupSaved } = useSavedItems();
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchStartup();
  }, [id]);

  const fetchStartup = async () => {
    try {
      const { data, error } = await supabase
        .from('startup_directory')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setStartup(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!message.trim()) {
      toast({ title: 'Please enter a message', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please log in to express interest', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('contact_requests').insert({
        investor_user_id: user.id,
        startup_user_id: startup.user_id,
        message: message.trim()
      });

      if (error) throw error;

      toast({ title: 'Interest expressed successfully' });
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

  if (!startup) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">Startup not found</h3>
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
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-3xl">{startup.company_name}</CardTitle>
                    <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                      <Star className="h-5 w-5 text-primary fill-primary" />
                      <span className="text-lg font-semibold text-primary">{startup.readiness_score}/100</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {startup.location}
                    </div>
                    <Badge variant="secondary">{startup.stage}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isStartupSaved(startup.id) ? unsaveStartup(startup.id) : saveStartup(startup.id)}
                >
                  <Heart className={`h-4 w-4 ${isStartupSaved(startup.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {startup.description && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{startup.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Team Size</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {startup.team_size} employees
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Sector</h3>
                  <Badge variant="outline">{startup.sector}</Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Funding Goal</h3>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${startup.funding_goal?.toLocaleString() || 'N/A'}
                  </div>
                </div>

                {startup.funding_raised && (
                  <div>
                    <h3 className="font-semibold mb-2">Funding Raised</h3>
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${startup.funding_raised?.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {startup.current_mrr && (
                <div>
                  <h3 className="font-semibold mb-2">Monthly Recurring Revenue</h3>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${startup.current_mrr.toLocaleString()} MRR
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Funding Status</h3>
                <p className="text-muted-foreground">
                  {startup.seeking_funding ? '🟢 Actively fundraising' : '⚪ Not currently fundraising'}
                </p>
              </div>

              {startup.has_revenue && (
                <div>
                  <Badge variant="secondary" className="text-sm">Revenue Positive</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Express Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Tell them why you're interested in their startup..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
              <Button 
                className="w-full" 
                onClick={handleExpressInterest}
                disabled={sending || !message.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
