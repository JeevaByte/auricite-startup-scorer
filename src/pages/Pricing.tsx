import { SubscriptionManager } from '@/components/premium/SubscriptionManager';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get the investment readiness insights and tools you need to grow your startup and attract investors.
          </p>
        </div>
        
        <SubscriptionManager />
      </div>
    </div>
  );
}