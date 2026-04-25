import React from 'react';
import { useAuth } from '../../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 

type LayoutProps = {
  children: React.ReactNode;
};

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <nav className="container mx-auto px-6 py-5 flex justify-between items-center">
        {/* LOGO E TÍTULO PERSONALIZADO */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1a5276] p-2 rounded-lg hidden sm:block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-black text-[#1a5276] leading-none uppercase tracking-tighter">
              Rede <span className="text-blue-500">Cegonha</span>
            </div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">
              Unidade • Suzano/SP
            </div>
          </div>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
          >
            <span>Sair</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        )}
      </nav>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-gray-400 text-xs font-medium">
        &copy; 2026 <span className="font-bold text-gray-500">Rede Cegonha Digital</span>. Todos os direitos reservados.
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sistema Operacional • Suzano</span>
      </div>
    </div>
  </footer>
);

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
