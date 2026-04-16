import React, { useState, useEffect } from 'react';
import type { IGestante } from '../types';
import api from '../services/api';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-2xl font-bold text-center text-[#1a5276] mb-6">{title}</h2>
);

const aplicarMascaraCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('Gestante não encontrada.');
            onClear();
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <SectionTitle title="Buscar Cadastro" />
            <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
                <input type="text" value={cpf} onChange={handleCpfChange} placeholder="Digite o CPF para buscar" className="flex-grow w-full p-2 border border-gray-300 rounded" />
                <button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto bg-[#1a5276] text-white py-2 px-4 rounded hover:bg-[#0e3040] transition-colors disabled:bg-gray-400">
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </div>
            <div className="mt-4 text-left max-w-md mx-auto min-h-[7rem]">
                {error && <p className="text-red-500 font-semibold">{error}</p>}
                {gestanteEncontrada && (
                    <div className="space-y-1 p-4 bg-gray-50 rounded border border-gray-200">
                        <p><strong>Nome:</strong> {gestanteEncontrada.nome}</p>
                        <p><strong>CPF:</strong> {aplicarMascaraCPF(gestanteEncontrada.cpf)}</p>
                        <p><strong>Data de Nascimento:</strong> {formatarData(gestanteEncontrada.data_nascimento)}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default SearchByCpf;