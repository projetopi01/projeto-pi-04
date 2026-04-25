import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface RiskIndicatorProps {
  cpf: string;
}

const riskStyles: { [key: string]: string } = {
  'Baixo': 'bg-green-100 text-green-800 border-green-300',
  'Médio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Alto': 'bg-red-100 text-red-800 border-red-300',
};

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ cpf }) => {
  const [risk, setRisk] = useState<string | null>(null);
  const [pontos, setPontos] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  // ESTADO DOS SINTOMAS (MANUAL DE FERRAZ)
  const [sintomas, setSintomas] = useState({
    sangramento: false,
    cefaleia: false,
    edema: false
  });

  const fetchRisk = useCallback(async () => {
    if (!cpf) return;
    try {
      // Enviamos os sintomas como parâmetros na URL (Query Params)
      const { sangramento, cefaleia, edema } = sintomas;
      const response = await api.get(
        `/api/risco/${cpf}?sangramento=${sangramento ? 1 : 0}&cefaleia=${cefaleia ? 1 : 0}&edema=${edema ? 1 : 0}`
      );
      setRisk(response.data.risco);
      setPontos(response.data.pontuacao_total); // Certifique-se que o backend retorna 'pontuacao_total'
    } catch (error) {
      console.error("Erro ao buscar risco:", error);
    } finally {
      setLoading(false);
    }
  }, [cpf, sintomas]);

  useEffect(() => {
    fetchRisk();
    const intervalId = setInterval(fetchRisk, 2000);
    return () => clearInterval(intervalId);
  }, [fetchRisk]);

  const toggleSintoma = (chave: keyof typeof sintomas) => {
    setSintomas(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  if (loading) return <div className="text-center p-4">Calculando risco...</div>;

  const style = risk ? riskStyles[risk] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-4">
      {/* SEÇÃO DE AVALIAÇÃO CLÍNICA - PROTOCOLO FERRAZ */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider text-center">
          Avaliação Clínica Manual (Protocolo Ferraz 2025)
        </h4>
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => toggleSintoma('sangramento')}
            className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${sintomas.sangramento ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {sintomas.sangramento ? '✓ Sangramento Vaginal' : '+ Sangramento Vaginal'}
          </button>
          <button 
            onClick={() => toggleSintoma('cefaleia')}
            className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${sintomas.cefaleia ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {sintomas.cefaleia ? '✓ Dor de Cabeça Forte' : '+ Dor de Cabeça Forte'}
          </button>
          <button 
            onClick={() => toggleSintoma('edema')}
            className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${sintomas.edema ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {sintomas.edema ? '✓ Edema (Inchaço)' : '+ Edema (Inchaço)'}
          </button>
        </div>
      </div>

      {/* RESULTADO DO RISCO - AQUI ESTÁ O AJUSTE */}
      <div className={`p-6 rounded-lg border-2 text-center transition-all duration-500 ${style}`}>
        <h3 className="font-bold text-lg">Status de Risco Gestacional</h3>
        <p className="text-4xl font-extrabold my-2">{risk || 'Baixo'}</p>
        
        {/* Melhorei o destaque do número aqui para não ficar escondido */}
        <p className="text-sm font-bold mt-2">
          Pontuação Total: <span className="text-xl underline">{pontos}</span> pontos
        </p>
      </div>
    </div>
  );
};

export default RiskIndicator;
