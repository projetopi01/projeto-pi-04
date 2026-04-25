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
          horaCurta: new Date(d.timestamp + " Z").toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
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

  const ultimaLeitura = dados.length > 0 ? dados[dados.length - 1] : null;

  const getPressaoStatus = (sistolica: number) => {
    if (sistolica >= 140) return { label: 'ALTA (RISCO)', color: 'bg-rose-600 text-white border-rose-800' };
    if (sistolica >= 130) return { label: 'ALERTA', color: 'bg-amber-100 text-amber-700 border-amber-300' };
    return { label: 'NORMAL', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' };
  };

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GestationalAgeCard dum={dum || ""} />
        <RiskIndicator cpf={cpf} />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-black text-[#1a5276] flex items-center gap-3 uppercase tracking-tighter">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Monitoramento Hemodinâmico
          </h2>
          <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded-full uppercase tracking-widest">
            Tempo Real
          </span>
        </div>

        {dados.length > 0 && ultimaLeitura ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {/* Batimentos */}
              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Frequência Cardíaca</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-rose-500 tracking-tighter">{Math.round(ultimaLeitura.batimentos)}</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase">BPM</span>
                </div>
              </div>

              {/* Oxigenação */}
              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Saturação O₂</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-blue-500 tracking-tighter">{Math.round(ultimaLeitura.oxigenacao)}</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase">%</span>
                </div>
              </div>

              {/* P. Sistólica DINÂMICA */}
              <div className={`p-5 rounded-2xl border transition-all duration-700 shadow-md ${getPressaoStatus(ultimaLeitura.pressao_sistolica).color}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Pressão Sistólica</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">{ultimaLeitura.pressao_sistolica}</span>
                  <span className="text-[10px] font-bold opacity-80 uppercase">mmHg</span>
                </div>
                <p className="text-[9px] font-black mt-2 tracking-widest uppercase">{getPressaoStatus(ultimaLeitura.pressao_sistolica).label}</p>
              </div>

              {/* P. Diastólica */}
              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pressão Diastólica</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-purple-500 tracking-tighter">{ultimaLeitura.pressao_diastolica}</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase">mmHg</span>
                </div>
              </div>
            </div>

            {/* GRÁFICO REFINADO */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="horaCurta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} minTickGap={50} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} domain={[40, 180]} />
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" verticalAlign="top" align="right" height={40} wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold'}} />
                  
                  <Area yAxisId="right" type="monotone" dataKey="oxigenacao" fill="#EFF6FF" stroke="none" isAnimationActive={false} />
                  
                  <Line yAxisId="left" type="monotone" dataKey="batimentos" name="BPM" stroke="#EF4444" strokeWidth={1.5} dot={{ r: 2, fill: '#EF4444' }} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="pressao_sistolica" name="Sistólica" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="pressao_diastolica" name="Diastólica" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aguardando telemetria...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
