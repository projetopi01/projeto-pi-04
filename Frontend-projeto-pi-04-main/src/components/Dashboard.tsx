import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RiskIndicator from './RiskIndicator';
import GestationalAgeCard from './GestationalAgeCard'; // <-- Novo Componente Importado

interface SinaisVitaisData {
  timestamp: string;
  batimentos: number;
  oxigenacao: number;
  pressao_sistolica: number;
  pressao_diastolica: number;
}

interface DashboardProps {
  cpf: string;
  dum?: string; // <-- Adicionado para receber a Data da Última Menstruação
}

const Dashboard: React.FC<DashboardProps> = ({ cpf, dum }) => {
  const [dados, setDados] = useState<SinaisVitaisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDados = async () => {
      if (!cpf) return;
      
      try {
        const response = await api.get(`/api/sinais-vitais/${cpf}`);
        const dadosFormatados = response.data.map((d: SinaisVitaisData) => ({
          ...d,
          timestamp: new Date(d.timestamp + " Z").toLocaleTimeString('pt-BR'),
        }));
        setDados(dadosFormatados);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
    const intervalId = setInterval(fetchDados, 2000); 

    return () => clearInterval(intervalId);
  }, [cpf]); 

  if (loading) return <p className="text-center p-4">A carregar dados do monitoramento...</p>;
  if (error && dados.length === 0) return <p className="text-center p-4 text-red-500">{error}</p>;

  return (
    <section className="mt-8">
      
      {/* --- GRID SUPERIOR: CARDS DE INFORMAÇÃO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Passamos a DUM recebida ou vazio caso não exista */}
        <GestationalAgeCard dum={dum || ""} />
        <RiskIndicator cpf={cpf} />
      </div>

      {/* --- GRID INFERIOR: GRÁFICO EM TEMPO REAL --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-[#1a5276] mb-6 flex items-center gap-2">
          📈 Sinais Vitais em Tempo Real
        </h2>

        {dados.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              {/* Otimização do Eixo X para não encavalar os horários */}
              <XAxis dataKey="timestamp" interval="preserveStartEnd" minTickGap={30} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {/* Removido as animações pesadas para sincronizar com o sensor imediatamente */}
              <Line type="monotone" dataKey="batimentos" name="BPM" stroke="#ef4444" strokeWidth={3} isAnimationActive={false} dot={false} />
              <Line type="monotone" dataKey="oxigenacao" name="SpO2 %" stroke="#3b82f6" strokeWidth={3} isAnimationActive={false} dot={false} />
              <Line type="monotone" dataKey="pressao_sistolica" name="Sistólica" stroke="#f59e0b" strokeWidth={3} isAnimationActive={false} dot={false} />
              <Line type="monotone" dataKey="pressao_diastolica" name="Diastólica" stroke="#8b5cf6" strokeWidth={3} isAnimationActive={false} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">Aguardando transmissão do sensor...</p>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
