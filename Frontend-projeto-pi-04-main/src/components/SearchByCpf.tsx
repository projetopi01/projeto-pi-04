import React, { useState, useEffect } from 'react';
import type { IGestante } from '../types';
import api from '../services/api';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-xl font-black text-[#1a5276] mb-4 flex items-center gap-2">
    <span className="bg-[#1a5276] text-white p-1 rounded-md text-sm shadow-sm">🔍</span> {title}
  </h2>
);

const aplicarMascaraCPF = (value: string) => 
  value.replace(/\D/g, '')
       .replace(/(\d{3})(\d)/, '$1.$2')
       .replace(/(\d{3})(\d)/, '$1.$2')
       .replace(/(\d{3})(\d{1,2})/, '$1-$2')
       .substring(0, 14);

interface SearchByCpfProps {
    onGestanteFound: (gestante: IGestante) => void;
    onClear: () => void;
    gestanteEncontrada: IGestante | null;
}

function SearchByCpf({ onGestanteFound, onClear, gestanteEncontrada }: SearchByCpfProps) {
    const [cpf, setCpf] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(cpf) setError('');
    }, [cpf]);

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valorFormatado = aplicarMascaraCPF(e.target.value);
        setCpf(valorFormatado);
        if (valorFormatado === '') {
            setError('');
            onClear();
        }
    };
    
    const handleSearch = async () => {
        if (!cpf) return;
        const cpfApenasNumeros = cpf.replace(/\D/g, '');
        if (cpfApenasNumeros.length !== 11) {
            setError('CPF inválido. Por favor, digite 11 números.');
            return;
        }
        loading(true);
        setError('');
        try {
            const response = await api.get<IGestante>(`/api/gestantes/${cpfApenasNumeros}`);
            onGestanteFound(response.data);
            setCpf('');
        } catch (err) {
            setError('Gestante não encontrada no banco de dados.');
            onClear();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4">
            {/* Banner Principal REDE ALYNE */}
            <div className="bg-gradient-to-br from-[#1a5276] via-[#154360] to-[#0e2a3b] p-10 rounded-3xl shadow-2xl mb-10 text-white relative overflow-hidden border-b-4 border-blue-400">
    
    {/* Ícone NOVO LOGOTIPO (Marca d'água) */}
    <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 pointer-events-none z-0">
        <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14v8" />
            <path d="M6 4l6 10l6-10" />
            <path d="M5 5c0 8 14 8 14 0" fill="rgba(255,255,255,0.2)" strokeWidth="1" />
            <circle cx="12" cy="8.5" r="2.5" fill="white" stroke="none" />
        </svg>
    </div>

    <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 px-3 py-1 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                Sistema Municipal • Suzano
            </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter text-white">
            REDE <span className="text-blue-400">ALYNE</span>
        </h1>
        
        <p className="text-base text-blue-100 font-medium max-w-2xl leading-relaxed">
            Gestão de prontuários e monitoramento de sinais específicos <span className="text-white font-bold">em tempo real.</span>
        </p>
    </div>
</div>
            
            {/* Seção de Busca */}
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <SectionTitle title="Acessar Cadastro" />
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-grow w-full">
                        <input 
                            type="text" 
                            value={cpf} 
                            onChange={handleCpfChange} 
                            placeholder="000.000.000-00" 
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#1a5276] focus:bg-white focus:ring-0 transition-all font-bold text-gray-700 text-lg" 
                        />
                    </div>
                    <button 
                        onClick={handleSearch} 
                        disabled={loading || !cpf} 
                        className="w-full sm:w-auto bg-[#1a5276] text-white py-4 px-10 rounded-xl font-black hover:bg-[#154360] transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        {loading ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </div>

                <div className="mt-6 min-h-[4rem]">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse">
                            <p className="text-red-700 text-sm font-bold">⚠️ {error}</p>
                        </div>
                    )}

                    {gestanteEncontrada && (
                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500 shadow-sm transition-all">
                            <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Paciente Identificada</p>
                                <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">{gestanteEncontrada.nome}</h3>
                                <p className="text-sm text-emerald-700 font-medium italic">CPF: {aplicarMascaraCPF(gestanteEncontrada.cpf)}</p>
                            </div>
                            <div className="text-right border-t md:border-t-0 md:border-l border-emerald-200 pt-3 md:pt-0 md:pl-6">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1 tracking-widest">Idade</p>
                                <p className="text-2xl font-black text-emerald-900">{gestanteEncontrada.idade} anos</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default SearchByCpf;
