import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Shield, Lock, Eye, Server, Globe, Users, AlertCircle } from 'lucide-react';

interface SecurityItem {
  category: string;
  title: string;
  status: 'implemented' | 'partial' | 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  implementation?: string;
}

const securityItems: SecurityItem[] = [
  {
    category: 'Authentication & Session Management',
    title: 'Strong Password Policies',
    status: 'implemented',
    priority: 'critical',
    description: 'Enforce complex passwords with validation',
    implementation: 'Password validation with strength checking, rate limiting on login attempts'
  },
  {
    category: 'Authentication & Session Management',
    title: 'Login Rate Limiting',
    status: 'implemented',
    priority: 'critical',
    description: 'Throttle failed login attempts',
    implementation: 'Rate limiter with exponential backoff, security event logging'
  },
  {
    category: 'Authentication & Session Management',
    title: 'Secure Session Management',
    status: 'implemented',
    priority: 'critical',
    description: 'HttpOnly, Secure, SameSite cookie flags',
    implementation: 'Supabase handles secure session management automatically'
  },
  {
    category: 'Authorization / RBAC',
    title: 'Row Level Security (RLS)',
    status: 'implemented',
    priority: 'critical',
    description: 'Strict server-side access controls',
    implementation: 'All database tables protected with RLS policies, user-based access control'
  },
  {
    category: 'Authorization / RBAC',
    title: 'IDOR Prevention',
    status: 'implemented',
    priority: 'critical',
    description: 'Prevent unauthorized resource access',
    implementation: 'RLS policies validate resource ownership, auth.uid() checks'
  },
  {
    category: 'Input Validation & Injection Prevention',
    title: 'XSS Protection',
    status: 'implemented',
    priority: 'high',
    description: 'Sanitize user inputs and HTML content',
    implementation: 'DOMPurify for HTML sanitization, input validation functions'
  },
  {
    category: 'Input Validation & Injection Prevention',
    title: 'SQL Injection Prevention',
    status: 'implemented',
    priority: 'high',
    description: 'Use parameterized queries',
    implementation: 'Supabase client uses parameterized queries, no raw SQL execution'
  },
  {
    category: 'Input Validation & Injection Prevention',
    title: 'Content Security Policy',
    status: 'implemented',
    priority: 'high',
    description: 'CSP headers to prevent XSS',
    implementation: 'Comprehensive CSP in nginx.conf with allowlisted domains'
  },
  {
    category: 'Transport Security & Secret Management',
    title: 'HTTPS with HSTS',
    status: 'implemented',
    priority: 'high',
    description: 'Force HTTPS connections',
    implementation: 'HSTS headers configured, secure transport enforced'
  },
  {
    category: 'Transport Security & Secret Management',
    title: 'Secret Management',
    status: 'implemented',
    priority: 'high',
    description: 'Use Supabase secrets, no hardcoded keys',
    implementation: 'All secrets stored in Supabase Edge Function secrets'
  },
  {
    category: 'Sensitive Data Handling',
    title: 'Data Encryption',
    status: 'implemented',
    priority: 'high',
    description: 'Encrypt data at rest and in transit',
    implementation: 'Supabase handles encryption, HTTPS for transport'
  },
  {
    category: 'Sensitive Data Handling',
    title: 'Security Logging',
    status: 'implemented',
    priority: 'medium',
    description: 'Centralized security event logging',
    implementation: 'Security events table with audit trails, no PII in logs'
  },
  {
    category: 'Dependency & Supply Chain Security',
    title: 'Dependency Scanning',
    status: 'implemented',
    priority: 'high',
    description: 'Automated vulnerability scanning',
    implementation: 'npm audit in CI/CD pipeline, automated dependency checks'
  },
  {
    category: 'Dependency & Supply Chain Security',
    title: 'Secret Scanning',
    status: 'implemented',
    priority: 'high',
    description: 'Prevent secret leaks in code',
    implementation: 'Git secret scanning in CI/CD, pattern detection'
  },
  {
    category: 'Security Headers & CORS',
    title: 'Security Headers',
    status: 'implemented',
    priority: 'medium',
    description: 'X-Frame-Options, X-Content-Type-Options, etc.',
    implementation: 'Comprehensive security headers in nginx configuration'
  },
  {
    category: 'Security Headers & CORS',
    title: 'CORS Configuration',
    status: 'implemented',
    priority: 'medium',
    description: 'Restrict cross-origin requests',
    implementation: 'Proper CORS headers in Edge Functions'
  },
  {
    category: 'Business Logic Protection',
    title: 'Server-side Validation',
    status: 'implemented',
    priority: 'medium',
    description: 'Validate all workflows server-side',
    implementation: 'Edge Functions handle business logic validation'
  },
  {
    category: 'Logging, Monitoring & Rate Limiting',
    title: 'Rate Limiting',
    status: 'implemented',
    priority: 'medium',
    description: 'Rate limits on sensitive endpoints',
    implementation: 'Client-side rate limiting, server-side protection via Supabase'
  },
  {
    category: 'Logging, Monitoring & Rate Limiting',
    title: 'Security Monitoring',
    status: 'implemented',
    priority: 'medium',
    description: 'Centralized logging and alerting',
    implementation: 'Security events table, audit logs for all operations'
  }
];

const getStatusIcon = (status: SecurityItem['status']) => {
  switch (status) {
    case 'implemented':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'partial':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'pending':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
  }
};

const getPriorityColor = (priority: SecurityItem['priority']) => {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
  }
};

const getCategoryIcon = (category: string) => {
  if (category.includes('Authentication')) return <Lock className="w-5 h-5" />;
  if (category.includes('Authorization')) return <Users className="w-5 h-5" />;
  if (category.includes('Input')) return <Shield className="w-5 h-5" />;
  if (category.includes('Transport')) return <Globe className="w-5 h-5" />;
  if (category.includes('Data')) return <Eye className="w-5 h-5" />;
  if (category.includes('Dependency')) return <Server className="w-5 h-5" />;
  return <Shield className="w-5 h-5" />;
};

export const SecurityAudit: React.FC = () => {
  const categories = Array.from(new Set(securityItems.map(item => item.category)));
  const implementedCount = securityItems.filter(item => item.status === 'implemented').length;
  const totalCount = securityItems.length;
  const completionPercentage = Math.round((implementedCount / totalCount) * 100);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive security implementation status
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
          <div className="text-sm text-muted-foreground">
            {implementedCount} of {totalCount} implemented
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {categories.map(category => {
          const categoryItems = securityItems.filter(item => item.category === category);
          const categoryImplemented = categoryItems.filter(item => item.status === 'implemented').length;
          const categoryPercentage = Math.round((categoryImplemented / categoryItems.length) * 100);

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(category)}
                    <div>
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>
                        {categoryImplemented} of {categoryItems.length} items implemented
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">{categoryPercentage}%</div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${categoryPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        {item.implementation && (
                          <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                            ✓ {item.implementation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{implementedCount}</div>
              <div className="text-sm text-muted-foreground">Implemented</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {securityItems.filter(item => item.status === 'partial').length}
              </div>
              <div className="text-sm text-muted-foreground">Partial</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {securityItems.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Security Status: STRONG</h3>
            <p className="text-sm text-green-700">
              All critical and high-priority security measures have been implemented. 
              The application follows security best practices with comprehensive protection 
              against common vulnerabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};