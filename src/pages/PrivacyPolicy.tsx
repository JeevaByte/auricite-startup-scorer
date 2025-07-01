
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              <strong>Effective Date:</strong> July 1, 2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Account information (name, email, company details)</li>
              <li>Assessment responses and startup information</li>
              <li>Usage data and analytics</li>
              <li>Communication preferences</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and improve our assessment services</li>
              <li>Generate personalized recommendations and insights</li>
              <li>Communicate with you about our services</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this policy. We may share aggregated, non-personally identifiable information for 
              research and analytics purposes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Retention</h2>
            <p className="mb-4">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
              outlined in this policy, unless a longer retention period is required by law.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide 
              personalized content. You can control cookie settings through your browser.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Contact Us</h2>
            <p className="mb-4">
              For questions about this Privacy Policy or our data practices, please contact us at privacy@auricite.com.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
