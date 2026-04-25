import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area 
} from 'recharts';
import RiskIndicator from './RiskIndicator';
import GestationalAgeCard from './GestationalAgeCard';

// Definição da fonte para uso direto no SVG do Recharts para garantir estilo
const GRAPH_FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

interface SinaisVitaisData {
  timestamp: string;
  batimentos: number;
  oxigenacao: number;
  pressao_sistolica: number;
  pressao_diastolica: number;
  horaCurta?: string; // Adicionado opcionalmente para evitar erro de TS
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
          // Formatação da hora otimizada
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
    // Intervalo de atualização (simulando IoT real)
    const intervalId = setInterval(fetchDados, 2000); 
    return () => clearInterval(intervalId);
  }, [cpf]); 

  if (loading) return <div className="text-center p-10 font-bold text-gray-500 animate-pulse translate-no">A carregar monitoramento hemodinâmico...</div>;

  const ultimaLeitura = dados.length > 0 ? dados[dados.length - 1] : null;

  // LÓGICA DE PROCESSAMENTO DE DADOS (MANUAL DE FERRAZ / PROTOCOLOS MÉDICOS)
  
  // 1. Análise da Frequência Cardíaca (BPM)
  const getBpmStatus = (bpm: number) => {
    // Alerta Crítico: Taquicardia (>=110) ou Bradicardia (<=60)
    if (bpm >= 110 || bpm <= 60) {
      return { label: 'CRÍTICO', color: 'bg-rose-600 text-white border-rose-800 animate-pulse shadow-lg' };
    }
    // Atenção: Pré-taquicardia
    if (bpm >= 100) {
      return { label: 'ATENÇÃO', color: 'bg-amber-100 text-amber-700 border-amber-300' };
    }
    // Normal
    return { label: 'NORMAL', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  // 2. Análise da Pressão Arterial Sistólica
  const getPressaoStatus = (sistolica: number) => {
    // Risco Imediato (Ferraz): >= 140 mmHg
    if (sistolica >= 140) {
      return { label: 'RISCO ALTO', color: 'bg-rose-600 text-white border-rose-800 animate-pulse shadow-lg' };
    }
    // Alerta: Hipertensão Estágio 1
    if (sistolica >= 130) {
      return { label: 'ALERTA', color: 'bg-amber-100 text-amber-700 border-amber-300' };
    }
    // Normal
    return { label: 'NORMAL', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <section className="mt-8 space-y-8" translate="no">
      {/* GRID SUPERIOR: IDADE E RISCO ACUMULADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GestationalAgeCard dum={dum || ""} />
        <RiskIndicator cpf={cpf} />
      </div>

      {/* ÁREA DO MONITOR HEMODINÂMICO REFINADO */}
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
            {/* --- QUADRO DE CARDS PROCESSADOS --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              
              {/* Card 1: BPM (DINÂMICO) */}
              <div className={`p-6 rounded-2xl border transition-all duration-700 shadow-md ${getBpmStatus(ultimaLeitura.batimentos).color}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-80">Frequência Cardíaca</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black tracking-tighter">{Math.round(ultimaLeitura.batimentos)}</span>
                  <span className="text-xs font-bold opacity-80 uppercase">BPM</span>
                </div>
                <p className="text-[9px] font-black mt-3 tracking-widest uppercase bg-black/10 px-2 py-0.5 rounded inline-block">
                  {getBpmStatus(ultimaLeitura.batimentos).label}
                </p>
              </div>

              {/* Card 2: Oxigenação */}
              <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl shadow-sm hover:border-blue-100 transition-colors">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Saturação O₂</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-light text-blue-600 tracking-tighter">{Math.round(ultimaLeitura.oxigenacao)}</span>
                  <span className="text-xs font-bold text-gray-300 uppercase">%</span>
                </div>
              </div>

              {/* Card 3: P. Sistólica (DINÂMICO - FERRAZ) */}
              <div className={`p-6 rounded-2xl border transition-all duration-700 shadow-md ${getPressaoStatus(ultimaLeitura.pressao_sistolica).color}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-80">Pressão Sistólica</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black tracking-tighter">{ultimaLeitura.pressao_sistolica}</span>
                  <span className="text-xs font-bold opacity-80 uppercase">mmHg</span>
                </div>
                <p className="text-[9px] font-black mt-3 tracking-widest uppercase bg-black/10 px-2 py-0.5 rounded inline-block">
                  {getPressaoStatus(ultimaLeitura.pressao_sistolica).label}
                </p>
              </div>

              {/* Card 4: P. Diastólica */}
              <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl shadow-sm hover:border-purple-100 transition-colors">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pressão Diastólica</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-light text-purple-600 tracking-tighter">{ultimaLeitura.pressao_diastolica}</span>
                  <span className="text-xs font-bold text-gray-300 uppercase">mmHg</span>
                </div>
              </div>
            </div>

            {/* --- GRÁFICO REFINADO COM TIPOGRAFIA BONITA --- */}
            <div className="h-[320px] w-full bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dados} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEEEEE" />
                  
                  {/* Eixo X: Hora (Letra fina e cinza) */}
                  <XAxis 
                    dataKey="horaCurta" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#9CA3AF', fontFamily: GRAPH_FONT, fontWeight: 400}} 
                    minTickGap={60} 
                  />
                  
                  {/* Eixo Y: Valores (Letra fina e cinza) */}
                  <YAxis 
                    yAxisId="left" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#9CA3AF', fontFamily: GRAPH_FONT, fontWeight: 400}} 
                    domain={[40, 180]} 
                  />
                  
                  {/* Eixo Y Direito (Oculto) */}
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} hide />
                  
                  {/* Tooltip (Balão que aparece no mouse - Letra bonita e negrito) */}
                  <Tooltip 
                    contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 15px 30px -5px rgba(0,0,0,0.15)', 
                        fontFamily: GRAPH_FONT,
                        padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700, padding: '2px 0' }}
                    labelStyle={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    cursor={{ stroke: '#1a5276', strokeWidth: 1, strokeDasharray: '6 6' }}
                  />
                  
                  {/* Legenda Superior (Letra bonita, negrito e uppercase) */}
                  <Legend 
                    iconType="circle" 
                    iconSize={8}
                    verticalAlign="top" 
                    align="right" 
                    height={50} 
                    wrapperStyle={{
                        fontSize: '11px', 
                        fontFamily: GRAPH_FONT, 
                        textTransform: 'uppercase', 
                        letterSpacing: '1.5px', 
                        fontWeight: 800,
                        color: '#333',
                        paddingBottom: '20px'
                    }} 
                  />
                  
                  {/* Área de Oxigênio (Fundo suave) */}
                  <Area yAxisId="right" type="monotone" dataKey="oxigenacao" fill="#EFF6FF" stroke="none" isAnimationActive={false} />
                  
                  {/* Linhas Principais (Grossura refinada = 1.5) */}
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="batimentos" 
                    name="Frequência Cardíaca" 
                    stroke="#EF4444" 
                    strokeWidth={1.5} 
                    dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} 
                    activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }}
                    isAnimationActive={false} 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="pressao_sistolica" 
                    name="P. Sistólica" 
                    stroke="#F59E0B" 
                    strokeWidth={1.5} 
                    strokeDasharray="5 5" 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="pressao_diastolica" 
                    name="P. Diastólica" 
                    stroke="#8B5CF6" 
                    strokeWidth={1.5} 
                    strokeDasharray="5 5" 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          {/* Tela de aguardando dados (IoT) */}
          <div className="text-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
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
