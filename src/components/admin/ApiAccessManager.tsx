
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Key, Eye, EyeOff, Code, RefreshCw } from 'lucide-react';

export const ApiAccessManager: React.FC = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResponse, setTestResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    // Generate a sample API key for demonstration
    const sampleKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(sampleKey);
  }, []);

  const generateNewKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    toast({
      title: 'New API Key Generated',
      description: 'Your new API key has been generated. Make sure to save it securely.',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const testApiCall = async () => {
    setTestLoading(true);
    try {
      // Simulate API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleResponse = {
        "data": [
          {
            "id": "uuid-1",
            "user_id": "user-123",
            "total_score": 750,
            "created_at": "2024-01-15T10:30:00Z",
            "scores": {
              "business_idea": 85,
              "financials": 70,
              "team": 90,
              "traction": 65
            }
          }
        ],
        "count": 1,
        "status": "success"
      };
      
      setTestResponse(JSON.stringify(sampleResponse, null, 2));
      toast({
        title: 'API Test Successful',
        description: 'Sample API call completed successfully',
      });
    } catch (error) {
      toast({
        title: 'API Test Failed',
        description: 'Failed to test API call',
        variant: 'destructive',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const exampleCode = `// Example API Usage
const apiKey = '${apiKey}';
const apiUrl = 'https://etadhhphjzztketgxnxl.supabase.co/functions/v1/api-access';

// Get assessments
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
  body: JSON.stringify({
    endpoint: 'assessments',
    method: 'GET',
    filters: {
      limit: 10,
      offset: 0
    }
  })
});

const data = await response.json();
console.log(data);`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Access Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(apiKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateNewKey}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Keep this key secure and never share it publicly.
            </p>
          </div>

          <div>
            <Label>Available Endpoints</Label>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">GET /assessments</Badge>
              <Badge variant="outline">POST /assessments</Badge>
              <Badge variant="outline">GET /scores</Badge>
              <Badge variant="outline">GET /scoring-config</Badge>
            </div>
          </div>

          <div>
            <Label>Rate Limits</Label>
            <div className="text-sm text-muted-foreground mt-1">
              <p>• 100 requests per minute</p>
              <p>• 1000 requests per hour</p>
              <p>• 10,000 requests per day</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>JavaScript/Node.js Example</Label>
              <Textarea
                value={exampleCode}
                readOnly
                rows={20}
                className="font-mono text-sm mt-1"
              />
            </div>
            <Button
              onClick={() => copyToClipboard(exampleCode)}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testApiCall}
            disabled={testLoading}
            className="flex items-center gap-2"
          >
            {testLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            Test API Call
          </Button>
          
          {testResponse && (
            <div>
              <Label>API Response</Label>
              <Textarea
                value={testResponse}
                readOnly
                rows={10}
                className="font-mono text-sm mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
