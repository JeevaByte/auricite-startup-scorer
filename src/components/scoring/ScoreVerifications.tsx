import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScoreVerificationsProps {
  scoreId: string;
  userId: string;
}

interface Verification {
  id: string;
  component: string;
  verification_type: 'self_reported' | 'document_verified' | 'third_party_verified' | 'audited';
  confidence_boost: number;
  verification_date: string;
  verified_by?: string;
}

const VERIFICATION_TYPES = {
  self_reported: { label: 'Self Reported', icon: AlertCircle, color: 'text-muted-foreground' },
  document_verified: { label: 'Document Verified', icon: CheckCircle2, color: 'text-blue-500' },
  third_party_verified: { label: 'Third Party Verified', icon: Shield, color: 'text-purple-500' },
  audited: { label: 'Audited', icon: Shield, color: 'text-green-500' }
};

const COMPONENTS = [
  { value: 'business_idea', label: 'Business Idea' },
  { value: 'team', label: 'Team' },
  { value: 'traction', label: 'Traction' },
  { value: 'financials', label: 'Financials' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'cap_table', label: 'Cap Table' },
  { value: 'team_credentials', label: 'Team Credentials' }
];

export const ScoreVerifications: React.FC<ScoreVerificationsProps> = ({
  scoreId,
  userId
}) => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
  }, [scoreId]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('score_verifications')
        .select('*')
        .eq('score_id', scoreId)
        .eq('user_id', userId);

      if (error) throw error;
      setVerifications((data || []) as any);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async (component: string) => {
    try {
      const { error } = await supabase
        .from('score_verifications')
        .insert({
          user_id: userId,
          score_id: scoreId,
          component,
          verification_type: 'self_reported',
          confidence_boost: 1.0
        });

      if (error) throw error;

      toast({
        title: 'Verification requested',
        description: 'Upload supporting documents to increase your verification level'
      });

      fetchVerifications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getOverallConfidence = () => {
    if (verifications.length === 0) return 0;
    
    const totalBoost = verifications.reduce((sum, v) => sum + v.confidence_boost, 0);
    return Math.min(100, (totalBoost / verifications.length) * 50);
  };

  const confidence = getOverallConfidence();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Verification & Confidence</span>
          </div>
          <Badge variant={confidence > 70 ? 'default' : confidence > 40 ? 'secondary' : 'outline'}>
            {confidence.toFixed(0)}% Confidence
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verify components to boost your credibility score
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {COMPONENTS.map((component) => {
          const verification = verifications.find(v => v.component === component.value);
          const verifyType = verification ? VERIFICATION_TYPES[verification.verification_type] : null;
          const Icon = verifyType?.icon || Shield;

          return (
            <div key={component.value} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${verifyType?.color || 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">{component.label}</p>
                  {verification && (
                    <p className="text-xs text-muted-foreground">
                      {verifyType?.label} • {new Date(verification.verification_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              {!verification ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRequestVerification(component.value)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              ) : verification.verification_type === 'self_reported' ? (
                <Button size="sm" variant="ghost">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Proof
                </Button>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Verification Benefits:</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Higher visibility to investors</li>
            <li>• Increased trust and credibility</li>
            <li>• Better matching accuracy</li>
            <li>• Priority in recommendations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};