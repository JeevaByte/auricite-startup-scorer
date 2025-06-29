
import { Building2 } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Auricite InvestX</h1>
              <p className="text-sm text-gray-500">Startup Investment Scoring</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Pre-Seed Assessment Platform
          </div>
        </div>
      </div>
    </header>
  );
};
