import { useEffect, useState } from 'react';
import RequestDetailsModal from './components/RequestDetailsModal';
import LandingPage from './components/LandingPage';
import LoginRegisterPage from './components/LoginRegisterPage';
import { isAdminPage, isStandalonePage, renderAdminPage, renderStandalonePage } from './config/page-registry';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { useAuthSession } from './hooks/useAuthSession';
import { PageType, RepairRequest } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isReady, isLoggedIn, userType, userName, login, logout } = useAuthSession();

  const handleViewRequest = (request: RepairRequest) => {
    setSelectedRequest(request);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setSelectedRequest(null);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleLogin = (type: 'admin' | 'user', name: string) => {
    login(type, name);
    setCurrentPage(type === 'admin' ? 'dashboard' : 'landing');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
    setMobileMenuOpen(false);
    setSelectedRequest(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isLoggedIn) {
      setCurrentPage(userType === 'admin' ? 'dashboard' : 'landing');
    }
  }, [isLoggedIn, userType]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentPage, isReady]);

  if (!isReady) {
    return <div className="min-h-screen" />;
  }

  if (currentPage === 'login') {
    return <LoginRegisterPage onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />;
  }

  if (isStandalonePage(currentPage)) {
    return renderStandalonePage(currentPage, navigateTo);
  }

  if (!isLoggedIn || (isLoggedIn && userType === 'user' && currentPage === 'landing')) {
    return (
      <LandingPage
        onLogin={handleLoginClick}
        onNavigate={navigateTo}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />
    );
  }

  if (userType !== 'admin') {
    return (
      <LandingPage
        onLogin={handleLoginClick}
        onNavigate={navigateTo}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        userName={userName}
        userType={userType}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        onMobileMenuToggle={handleMobileMenuToggle}
      />

      <div className="relative flex min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
        {mobileMenuOpen ? (
          <div
            className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        ) : null}

        <Sidebar
          currentPage={isAdminPage(currentPage) ? currentPage : 'dashboard'}
          onNavigate={navigateTo}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="min-w-0 flex-1 px-3 pb-8 pt-3 sm:px-5 sm:pt-5 lg:ml-[18.5rem] lg:px-7 lg:pb-12 lg:pt-7 xl:px-8 xl:pt-8">
          <div className="mx-auto w-full max-w-[1480px]">
            {selectedRequest ? (
              <RequestDetailsModal request={selectedRequest} onClose={handleCloseDetails} />
            ) : isAdminPage(currentPage) ? (
              renderAdminPage(currentPage, { onViewRequest: handleViewRequest })
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
