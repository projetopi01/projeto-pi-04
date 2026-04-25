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

const formatarData = (dataString: string) => {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
};

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
        setLoading(true);
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
            {/* Banner Principal com Gradiente */}
            <div className="bg-gradient-to-br from-[#1a5276] to-[#2980b9] p-8 rounded-2xl shadow-xl mb-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-2 tracking-tight">Rede Cegonha Digital</h1>
                    <p className="text-blue-100 font-medium opacity-90">Gestão de prontuários e sinais vitais em tempo real.</p>
                </div>
                {/* Ícone de fundo decorativo */}
                <div className="absolute right-[-30px] top-[-30px] opacity-10 rotate-12 pointer-events-none">
                    <svg width="180" height="180" viewBox="0 0 24 24" fill="white">
                        <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                    </svg>
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
                        className="w-full sm:w-auto bg-[#1a5276] text-white py-4 px-10 rounded-xl font-black hover:bg-[#154360] transition-all disabled:bg-gray-200 disabled:text-gray-400 shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        {loading ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </div>

                {/* Mensagens de Feedback e Resultados */}
                <div className="mt-6 min-h-[4rem]">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse">
                            <p className="text-red-700 text-sm font-bold">
                                ⚠️ {error}
                            </p>
                        </div>
                    )}

                    {gestanteEncontrada && (
                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500 shadow-sm transition-all">
                            <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Paciente Identificada</p>
                                <h3 className="text-xl font-black text-emerald-900">{gestanteEncontrada.nome}</h3>
                                <p className="text-sm text-emerald-700 font-medium">CPF: {aplicarMascaraCPF(gestanteEncontrada.cpf)}</p>
                            </div>
                            <div className="text-right border-t md:border-t-0 md:border-l border-emerald-200 pt-3 md:pt-0 md:pl-6">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Nascimento</p>
                                <p className="text-lg font-black text-emerald-900">{formatarData(gestanteEncontrada.data_nascimento)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default SearchByCpf;
