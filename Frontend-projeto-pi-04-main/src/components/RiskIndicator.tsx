import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface RiskIndicatorProps {
  cpf: string;
}

// Mapeamento de riscos para cores e textos
const riskStyles: { [key: string]: string } = {
  'Baixo': 'bg-green-100 text-green-800 border-green-300',
  'Médio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Alto': 'bg-red-100 text-red-800 border-red-300',
};

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ cpf }) => {
  const [risk, setRisk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      if (!cpf) return;
      try {
        // Chama o novo endpoint da API que criamos
        const response = await api.get(`/api/risco/${cpf}`);
        setRisk(response.data.risco);
      } catch (error) {
        console.error("Erro ao buscar previsão de risco:", error);
        setRisk('Indeterminado');
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
  }, [cpf]);

  if (loading) {
    return <div className="text-center p-4">Calculando risco gestacional...</div>;
  }

  const style = risk ? riskStyles[risk] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';

  return (
    <div className={`p-4 mt-6 mb-8 rounded-lg border-2 text-center ${style}`}>
      <h3 className="font-bold text-lg">Risco Gestacional Previsto</h3>
      <p className="text-2xl font-extrabold">{risk || 'N/A'}</p>
    </div>
  );
};

export default RiskIndicator;