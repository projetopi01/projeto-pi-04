import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area 
} from 'recharts';
import RiskIndicator from './RiskIndicator';
import GestationalAgeCard from './GestationalAgeCard';

interface SinaisVitaisData {
  timestamp: string;
  batimentos: number;
  oxigenacao: number;
  pressao_sistolica: number;
  pressao_diastolica: number;
}

interface DashboardProps {
  cpf: string;
  dum?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ cpf, dum }) => {
  const [dados, setDados] = useState<SinaisVitaisData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      if (!cpf) return;
      try {
        const response = await api.get(`/api/sinais-vitais/${cpf}`);
        const dadosFormatados = response.data.map((d: SinaisVitaisData) => ({
          ...d,
          // Hora formatada para o eixo X
          horaCurta: new Date(d.timestamp + " Z").toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second:'2-digit' }),
        }));
        setDados(dadosFormatados);
      } catch (err) {
        console.error("Erro ao buscar dados", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
    const intervalId = setInterval(fetchDados, 2000); 
    return () => clearInterval(intervalId);
  }, [cpf]); 

  if (loading) return <p className="text-center p-4">A carregar monitoramento...</p>;

  // Pega o dado mais recente para os quadros numéricos
  const ultimaLeitura = dados.length > 0 ? dados[dados.length - 1] : null;

  return (
    <section className="mt-8">
      
      {/* GRID SUPERIOR: IDADE E RISCO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GestationalAgeCard dum={dum || ""} />
        <RiskIndicator cpf={cpf} />
      </div>

      {/* ÁREA DO MONITOR TIPO HOSPITALAR */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1a5276] flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Monitor de Sinais Vitais
          </h2>
          <div className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase tracking-widest">
            Live Stream
          </div>
        </div>

        {dados.length > 0 && ultimaLeitura ? (
          <>
            {/* --- QUADRO DE NÚMEROS (Telinha Digital) --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Batimentos */}
              <div className="bg-rose-50 border-b-4 border-rose-500 p-4 rounded-lg shadow-sm">
                <p className="text-[10px] font-bold text-rose-500 uppercase">Batimentos</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-rose-700">{Math.round(ultimaLeitura.batimentos)}</span>
                  <span className="text-xs font-bold text-rose-400">BPM</span>
                </div>
              </div>

              {/* Oxigenação */}
              <div className="bg-blue-50 border-b-4 border-blue-500 p-4 rounded-lg shadow-sm">
                <p className="text-[10px] font-bold text-blue-500 uppercase">Oxigenação</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-700">{Math.round(ultimaLeitura.oxigenacao)}</span>
                  <span className="text-xs font-bold text-blue-400">%</span>
                </div>
              </div>

              {/* Pressão Sistólica */}
              <div className="bg-amber-50 border-b-4 border-amber-500 p-4 rounded-lg shadow-sm">
                <p className="text-[10px] font-bold text-amber-600 uppercase">P. Sistólica</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-700">{ultimaLeitura.pressao_sistolica}</span>
                  <span className="text-xs font-bold text-amber-500">mmHg</span>
                </div>
              </div>

              {/* Pressão Diastólica */}
              <div className="bg-purple-50 border-b-4 border-purple-500 p-4 rounded-lg shadow-sm">
                <p className="text-[10px] font-bold text-purple-500 uppercase">P. Diastólica</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-700">{ultimaLeitura.pressao_diastolica}</span>
                  <span className="text-xs font-bold text-purple-400">mmHg</span>
                </div>
              </div>
            </div>

            {/* --- GRÁFICO --- */}
            <div className="h-[350px] w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dados}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="horaCurta" tick={{fontSize: 10}} minTickGap={40} />
                  
                  {/* Eixo para BPM e Pressão */}
                  <YAxis yAxisId="left" domain={[40, 180]} tick={{fontSize: 10}} />
                  
                  {/* Eixo exclusivo para Oxigênio (para não achatar a linha) */}
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} hide />

                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" height={36}/>

                  {/* Oxigênio como uma sombra azul no fundo */}
                  <Area yAxisId="right" type="monotone" dataKey="oxigenacao" name="Oxigênio" fill="#dbeafe" stroke="#3b82f6" isAnimationActive={false} />
                  
                  {/* Linhas principais */}
                  <Line yAxisId="left" type="monotone" dataKey="batimentos" name="BPM" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="pressao_sistolica" name="Sistólica" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="pressao_diastolica" name="Diastólica" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Aguardando sinais do simulador...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
