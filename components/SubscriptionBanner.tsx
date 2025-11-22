import Link from 'next/link';

export default function SubscriptionBanner() {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold mb-2">Unlock All Features</h3>
          <p className="text-primary-100">
            Get daily actions that fit your situation, full health bar tracking, badges, journal, and Team Wins. 
            Try everything free for 7 days.
          </p>
        </div>
        <Link
          href="/dashboard/subscription"
          className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}


