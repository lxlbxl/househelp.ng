import { ReactNode } from 'react';
import Link from 'next/link';

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600">
                HouseHelp.ng
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/agency/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/agency/helpers" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                Helpers
              </Link>
              <Link href="/agency/finance" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                Finance
              </Link>
              <Link href="/agency/reputation" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                Reputation
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
