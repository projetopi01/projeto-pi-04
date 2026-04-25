import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area 
} from 'recharts';
import RiskIndicator from './RiskIndicator';
import GestationalAgeCard from './GestationalAgeCard';

const GRAPH_FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

interface SinaisVitaisData {
  timestamp: string;
  batimentos: number;
  oxigenacao: number;
  pressao_sistolica: number;
  pressao_diastolica: number;
  horaCurta?: string;
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

  if (loading) return <div className="text-center p-10 font-bold text-gray-500 animate-pulse translate-no">A carregar monitoramento hemodinâmico...</div>;

  const ultimaLeitura = dados.length > 0 ? dados[dados.length - 1] : null;

  // Lógicas de cores dos Cards
  const getBpmStatus = (bpm: number) => {
    if (bpm >= 110 || bpm <= 60) return { label: 'CRÍTICO', bg: 'bg-red-600', border: 'border-red-800', text: 'text-white', pulse: 'animate-pulse shadow-lg shadow-red-200' };
    if (bpm >= 100) return { label: 'ATENÇÃO', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', pulse: '' };
    return { label: 'NORMAL', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', pulse: '' };
  };

  const getSistolicaStatus = (sistolica: number) => {
    if (sistolica >= 140) return { label: 'RISCO ALTO', bg: 'bg-red-600', border: 'border-red-800', text: 'text-white', pulse: 'animate-pulse shadow-lg shadow-red-200' };
    if (sistolica >= 130) return { label: 'ALERTA', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', pulse: '' };
    return { label: 'NORMAL', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', pulse: '' };
  };

  const getDiastolicaStatus = (diastolica: number) => {
    if (diastolica >= 90) return { label: 'ALTA', bg: 'bg-red-600', border: 'border-red-800', text: 'text-white', pulse: 'animate-pulse shadow-lg shadow-red-200' };
    return { label: 'NORMAL', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', pulse: '' };
  };

  const getO2Status = (o2: number) => {
    if (o2 < 95) return { label: 'BAIXA', bg: 'bg-red-600', border: 'border-red-800', text: 'text-white', pulse: 'animate-pulse shadow-lg shadow-red-200' };
    return { label: 'NORMAL', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', pulse: '' };
  };

  return (
    <section className="mt-8 space-y-8" translate="no">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GestationalAgeCard dum={dum || ""} />
        <RiskIndicator cpf={cpf} />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 transition-all duration-300 hover:shadow-cyan-100/30">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
          <h2 className="text-xl font-black text-[#1a5276] flex items-center gap-3 uppercase tracking-tighter">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>
            Telemetria de Sinais Vitais (IoT)
          </h2>
          <span className="text-[10px] font-black text-gray-400 border-2 border-gray-100 px-4 py-1.5 rounded-full uppercase tracking-widest bg-gray-50">
            Live Stream
          </span>
        </div>

        {dados.length > 0 && ultimaLeitura ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              
              {/* Card 1: BPM */}
              {(() => {
                const status = getBpmStatus(ultimaLeitura.batimentos);
                return (
                  <div className={`p-5 rounded-2xl border-2 transition-all duration-700 ${status.bg} ${status.border} ${status.text} ${status.pulse}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Freq. Cardíaca</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black tracking-tighter">{Math.round(ultimaLeitura.batimentos)}</span>
                      <span className="text-xs font-bold opacity-80 uppercase">BPM</span>
                    </div>
                    <p className="text-[9px] font-black mt-2 tracking-widest uppercase bg-black/10 px-2 py-0.5 rounded inline-block">{status.label}</p>
                  </div>
                );
              })()}

              {/* Card 2: P. Sistólica */}
              {(() => {
                const status = getSistolicaStatus(ultimaLeitura.pressao_sistolica);
                return (
                  <div className={`p-5 rounded-2xl border-2 transition-all duration-700 ${status.bg} ${status.border} ${status.text} ${status.pulse}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">P. Sistólica</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black tracking-tighter">{ultimaLeitura.pressao_sistolica}</span>
                      <span className="text-xs font-bold opacity-80 uppercase">mmHg</span>
                    </div>
                    <p className="text-[9px] font-black mt-2 tracking-widest uppercase bg-black/10 px-2 py-0.5 rounded inline-block">{status.label}</p>
                  </div>
                );
              })()}

              {/* Card 3: P. Diastólica */}
              {(() => {
                const status = getDiastolicaStatus(ultimaLeitura.pressao_diastolica);
                return (
                  <div className={`p-5 rounded-2xl border-2 transition-all duration-700 ${status.bg} ${status.border} ${status.text} ${status.pulse}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">P. Diastólica</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black tracking-tighter">{ultimaLeitura.pressao_diastolica}</span>
                      <span className="text-xs font-bold opacity-80 uppercase">mmHg</span>
                    </div>
                    <p className="text-[9px] font-black mt-2 tracking-widest uppercase bg-black/10 px-2 py-0.5 rounded inline-block">{status.label}</p>
                  </div>
                );
              })()}

              {/* Card 4: Oxigenação (O2) */}
              {(() => {
                const status = getO2Status(ultimaLeitura.oxigenacao);
                return (
                  <div className={`p-5 rounded-2xl border-2 transition-all duration-700 ${status.bg} ${status.border} ${status.text} ${status.pulse}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Saturação O₂</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black tracking-tighter">{Math.round(ultimaLeitura.oxigenacao)}</span>
                      <span className="text-xs font-bold opacity-80 uppercase">%</span>
                    </div>
                    <p className="text-[9px] font-black mt-2 tracking-widest uppercase bg-black/10 px-2 py-0.5 rounded inline-block">{status.label}</p>
                  </div>
                );
              })()}

            </div>

            <div className="h-[320px] w-full bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dados} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  
                  {/* GRID COM TRAÇOS VERTICAIS E HORIZONTAIS */}
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#D1D5DB" />
                  
                  <XAxis 
                    dataKey="horaCurta" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#6B7280', fontFamily: GRAPH_FONT, fontWeight: 600}} 
                    minTickGap={60} 
                  />
                  <YAxis 
                    yAxisId="left" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#6B7280', fontFamily: GRAPH_FONT, fontWeight: 600}} 
                    domain={[40, 180]} 
                  />
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} hide />
                  
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '2px solid #E5E7EB', boxShadow: '0 15px 30px -5px rgba(0,0,0,0.15)', fontFamily: GRAPH_FONT, padding: '12px' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 800, padding: '2px 0' }}
                    labelStyle={{ fontSize: '11px', color: '#6B7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
                    cursor={{ stroke: '#4B5563', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  />
                  
                  <Legend 
                    iconType="circle" 
                    iconSize={10}
                    verticalAlign="top" 
                    align="right" 
                    height={50} 
                    wrapperStyle={{ fontSize: '12px', fontFamily: GRAPH_FONT, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#111827', paddingBottom: '20px' }} 
                  />
                  
                  {/* Área de Oxigênio (Mais visível e com borda forte) */}
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="oxigenacao" 
                    name="Saturação O₂"
                    fill="#BFDBFE" 
                    fillOpacity={0.4}
                    stroke="#007BFF" 
                    strokeWidth={2}
                    isAnimationActive={false} 
                  />
                  
                  {/* Linhas Principais (Cores "Neon" super vivas) */}
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="batimentos" 
                    name="Frequência Cardíaca" 
                    stroke="#FF004D" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#FF004D', strokeWidth: 0 }} 
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                    isAnimationActive={false} 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="pressao_sistolica" 
                    name="P. Sistólica" 
                    stroke="#FF8A00" 
                    strokeWidth={2} 
                    strokeDasharray="6 4" 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="pressao_diastolica" 
                    name="P. Diastólica" 
                    stroke="#9D00FF" 
                    strokeWidth={2} 
                    strokeDasharray="6 4" 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-500"></span>
            </span>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs translate-no">
              Aguardando telemetria do simulador (IoT)...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
