
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              <strong>Effective Date:</strong> July 1, 2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Auricite InvestX ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Auricite InvestX is a startup assessment platform that evaluates investment readiness through scoring, 
              feedback, and recommendations. Our service is intended for informational purposes only and does not 
              constitute financial or investment advice.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and truthful information in assessments</li>
              <li>Use the service only for lawful purposes</li>
              <li>Respect intellectual property rights</li>
              <li>Maintain the confidentiality of your account credentials</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Usage and Privacy</h2>
            <p className="mb-4">
              We collect and process your data in accordance with our Privacy Policy. 
              By using our service, you consent to the collection and use of information as described in our Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Limitation of Liability</h2>
            <p className="mb-4">
              Auricite InvestX is provided "as is" without warranties of any kind. We shall not be liable for any 
              indirect, incidental, special, or consequential damages arising from your use of the service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Modifications</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us at legal@auricite.com.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
