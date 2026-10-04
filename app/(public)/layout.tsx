import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">

      <SiteHeader />

      <main>
        {children}
      </main>

      <SiteFooter />

    </div>
  );
}