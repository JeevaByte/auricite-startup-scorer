import { useState, useEffect } from 'react';
import { Users, UserPlus, MessageSquare, Award, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export const CollaborationHub = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [syndicates, setSyndicates] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load recommendations
      const { data: recs, error: recsError } = await supabase.functions.invoke(
        'investor-recommendations'
      );
      if (recsError) throw recsError;
      setRecommendations(recs.recommendations || []);

      // Load following
      const { data: follows, error: followsError } = await supabase
        .from('investor_follows')
        .select('*, profiles:following_id(*)');
      if (followsError) throw followsError;
      setFollowing(follows || []);

      // Load syndicates
      const { data: synds, error: syndsError } = await supabase
        .from('investor_syndicates')
        .select('*, syndicate_members(count)');
      if (syndsError) throw syndsError;
      setSyndicates(synds || []);

      // Load messages
      const { data: msgs, error: msgsError } = await supabase
        .from('investor_messages')
        .select('*, sender:sender_id(full_name), recipient:recipient_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (msgsError) throw msgsError;
      setMessages(msgs || []);
    } catch (error: any) {
      console.error('Failed to load collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const followInvestor = async (investorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('investor_follows')
        .insert([{ follower_id: user.id, following_id: investorId }] as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You are now following this investor"
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!selectedInvestor || !messageContent.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('investor_messages')
        .insert([{
          sender_id: user.id,
          recipient_id: selectedInvestor.investor_id,
          subject: messageSubject,
          message: messageContent
        }] as any);

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your message has been delivered"
      });

      setMessageDialogOpen(false);
      setMessageSubject('');
      setMessageContent('');
      setSelectedInvestor(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Investor Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="discover">
            <TabsList className="w-full">
              <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
              <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
              <TabsTrigger value="syndicates" className="flex-1">Syndicates</TabsTrigger>
              <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Investors with similar investment preferences
              </p>
              {loading ? (
                <p className="text-center py-8">Loading...</p>
              ) : recommendations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recommendations available yet
                </p>
              ) : (
                recommendations.map((rec) => (
                  <Card key={rec.investor_id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {rec.profile?.full_name?.charAt(0) || 'I'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{rec.profile?.full_name || 'Investor'}</p>
                            <div className="flex gap-2 mt-1">
                              {rec.sectors?.slice(0, 2).map((sector: string) => (
                                <Badge key={sector} variant="secondary" className="text-xs">
                                  {sector}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {rec.similarityScore}% match
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInvestor(rec);
                              setMessageDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => followInvestor(rec.investor_id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-4">
              {following.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  You're not following anyone yet
                </p>
              ) : (
                following.map((follow) => (
                  <Card key={follow.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {follow.profiles?.full_name?.charAt(0) || 'I'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{follow.profiles?.full_name || 'Investor'}</p>
                          <p className="text-sm text-muted-foreground">
                            {follow.profiles?.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="syndicates" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Join or create investment syndicates
              </p>
              {syndicates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No syndicates available yet
                </p>
              ) : (
                syndicates.map((syndicate) => (
                  <Card key={syndicate.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{syndicate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {syndicate.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {syndicate.syndicate_members?.[0]?.count || 0} members
                          </p>
                        </div>
                        <Button size="sm">
                          <Award className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet
                </p>
              ) : (
                messages.map((msg) => (
                  <Card key={msg.id} className={!msg.is_read ? 'bg-primary/5' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{msg.subject || 'No Subject'}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs text-muted-foreground">
                            From: {msg.sender?.full_name || 'Unknown'}
                          </p>
                        </div>
                        {!msg.is_read && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedInvestor?.profile?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              placeholder="Subject"
            />
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Your message..."
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendMessage} disabled={!messageContent.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};