import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RiskIndicator from './RiskIndicator';

interface SinaisVitaisData {
  timestamp: string;
  batimentos: number;
  oxigenacao: number;
  pressao_sistolica: number;
  pressao_diastolica: number;
}

interface DashboardProps {
  cpf: string;
}

const Dashboard: React.FC<DashboardProps> = ({ cpf }) => {
  const [dados, setDados] = useState<SinaisVitaisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDados = async () => {
      if (!cpf) return;
      
      if(loading) {
        setError(null);
      }

      try {
        const response = await api.get(`/api/sinais-vitais/${cpf}`);
        const dadosFormatados = response.data.map((d: SinaisVitaisData) => ({
          ...d,
          timestamp: new Date(d.timestamp).toLocaleTimeString('pt-BR'),
        }));
        setDados(dadosFormatados);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard", err);
        setError("Não foi possível carregar os dados de monitoramento.");
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
    const intervalId = setInterval(fetchDados, 10000);
    return () => clearInterval(intervalId);
  }, [cpf, loading]);

  if (loading) return <p className="text-center p-4">A carregar dados do monitoramento...</p>;
  if (error) return <p className="text-center p-4 text-red-500">{error}</p>;

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold text-center text-[#1a5276] mb-6">Dashboard de Monitoramento</h2>
      
      <RiskIndicator cpf={cpf} />

      {dados.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="batimentos" name="Batimentos Cardíacos" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="oxigenacao" name="Oxigenação (SpO2 %)" stroke="#82ca9d" />
            <Line type="monotone" dataKey="pressao_sistolica" name="Pressão Sistólica" stroke="#ffc658" />
            <Line type="monotone" dataKey="pressao_diastolica" name="Pressão Diastólica" stroke="#ff8042" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500 p-4">Nenhum dado de monitoramento encontrado para esta gestante.</p>
      )}
    </section>
  );
};

export default Dashboard;

