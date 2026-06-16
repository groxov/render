import { PageType } from '../types';
import { CompanySection } from './landing/CompanySection';
import { ContactsSection } from './landing/ContactsSection';
import { HeroSection } from './landing/HeroSection';
import { LandingFooter } from './landing/LandingFooter';
import { LandingHeader } from './landing/LandingHeader';
import { PortfolioSection } from './landing/PortfolioSection';
import { ProcessSection } from './landing/ProcessSection';
import { ServicesSection } from './landing/ServicesSection';

interface LandingPageProps {
  onLogin: () => void;
  onNavigate: (page: PageType) => void;
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export default function LandingPage({
  onLogin,
  onNavigate,
  isLoggedIn = false,
  userName = '',
  onLogout,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.12),transparent_18%),linear-gradient(180deg,#fbfdff_0%,#eef4fb_100%)]">
      <LandingHeader
        onLogin={onLogin}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={onLogout}
      />

      <main>
        <HeroSection onNavigate={onNavigate} />
        <CompanySection onNavigate={onNavigate} />
        <ServicesSection onNavigate={onNavigate} />
        <ProcessSection />
        <PortfolioSection />
        <ContactsSection onLogin={onLogin} onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      </main>

      <LandingFooter />
    </div>
  );
}
