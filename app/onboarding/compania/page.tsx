'use client';

import { useRouter } from 'next/navigation';
import { CompanyOnboardingWizard } from '@/components/company/CompanyOnboardingWizard';
import { routes } from '@/lib/routes/web';

export default function CompanyOnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CompanyOnboardingWizard
          onComplete={() => {
            router.push(routes.dashboard);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
