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
        {/* LOGO E TÍTULO PERSONALIZADO - REDE ALYNE */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1a5276] p-2.5 rounded-xl hidden sm:block shadow-md">
            {/* NOVO LOGOTIPO (O "Y" com a Rede e o Bebê) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               {/* Tronco do Y */}
               <path d="M12 14v8" />
               {/* Hastes do Y */}
               <path d="M6 4l6 10l6-10" />
               {/* Rede de descanso (Hammock) pendurada nas hastes */}
               <path d="M5 5c0 8 14 8 14 0" fill="rgba(255,255,255,0.2)" strokeWidth="1.5" />
               {/* Bebê (Círculo) na rede */}
               <circle cx="12" cy="8.5" r="2" fill="white" stroke="none" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-black text-[#1a5276] leading-none uppercase tracking-tighter">
              Rede <span className="text-blue-500">Alyne</span>
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
        &copy; 2026 <span className="font-bold text-gray-500">Rede Alyne Digital</span>. Todos os direitos reservados.
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
