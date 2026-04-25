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
  
  const [sintomas, setSintomas] = useState({
    sangramento: false,
    cefaleia: false,
    edema: false
  });

  const fetchRisk = useCallback(async () => {
    if (!cpf) return;
    try {
      const { sangramento, cefaleia, edema } = sintomas;
      // A API recebe os sintomas e calcula junto com os sinais vitais do banco
      const response = await api.get(
        `/api/risco/${cpf}?sangramento=${sangramento ? 1 : 0}&cefaleia=${cefaleia ? 1 : 0}&edema=${edema ? 1 : 0}`
      );
      setRisk(response.data.risco);
      setPontos(response.data.pontuacao_total);
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
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider text-center translate-no">
          Avaliação Clínica (Protocolo Ferraz 2025)
        </h4>
        
        {/* BOTÕES DE SINTOMAS */}
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

        <p className="text-[10px] text-center text-blue-400 mt-3 italic">
          * A pontuação considera sintomas manuais + sinais vitais do prontuário.
        </p>
      </div>

      {/* RESULTADO DO RISCO */}
      <div className={`p-6 rounded-lg border-2 text-center transition-all duration-500 ${style}`}>
        <h3 className="font-bold text-lg uppercase tracking-tighter">Status de Risco Gestacional</h3>
        <p className="text-5xl font-black my-2 uppercase italic tracking-tighter">{risk || 'Avaliar'}</p>
        
        <div className="mt-2 pt-2 border-t border-black/10">
            <p className="text-sm font-medium">
              Pontuação Total: <span className="text-2xl font-black underline">{pontos}</span> pontos
            </p>
            <p className="text-[10px] font-bold opacity-70 uppercase mt-1">
                {pontos >= 6 ? '⚠️ Necessita avaliação hospitalar imediata' : 'Acompanhamento de rotina na UBS'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default RiskIndicator;
