import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Trash2, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PitchDeck {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export const PitchDeckUpload: React.FC = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadPitchDecks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pitch decks:', error);
        toast({
          title: "Error",
          description: "Failed to load your pitch decks.",
          variant: "destructive",
        });
      } else {
        setPitchDecks(data || []);
      }
    } catch (error) {
      console.error('Error loading pitch decks:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadPitchDecks();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, PPT, or PPTX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      const { data, error } = await supabase.functions.invoke('upload-pitch-deck', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Upload Successful",
        description: "Your pitch deck has been uploaded successfully.",
      });

      // Reload pitch decks
      await loadPitchDecks();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload pitch deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (pitchDeckId: string, fileName: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('pitch_decks')
        .delete()
        .eq('id', pitchDeckId);

      if (dbError) throw dbError;

      // Delete from storage
      const { data: pitchDeck } = await supabase
        .from('pitch_decks')
        .select('file_path')
        .eq('id', pitchDeckId)
        .single();

      if (pitchDeck) {
        await supabase.storage
          .from('pitch-decks')
          .remove([pitchDeck.file_path]);
      }

      toast({
        title: "Deleted",
        description: `${fileName} has been deleted.`,
      });

      // Reload pitch decks
      await loadPitchDecks();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete pitch deck. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Pitch Deck
          </CardTitle>
          <CardDescription>
            Upload your pitch deck in PDF, PPT, or PPTX format (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pitchDeck">Select File</Label>
              <Input
                ref={fileInputRef}
                id="pitchDeck"
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>
            
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading your pitch deck...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {pitchDecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Pitch Decks</CardTitle>
            <CardDescription>
              Manage your uploaded pitch decks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pitchDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(deck.file_type)}
                    <div>
                      <p className="font-medium">{deck.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(deck.file_size)} • {new Date(deck.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(deck.id, deck.file_name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pitchDecks.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No pitch decks yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload your first pitch deck to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};