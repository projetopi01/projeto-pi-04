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

  const ultimaLeitura = dados.length > 0 ? dados[dados.length - 1] : null;

  // LÓGICA DE PROCESSAMENTO (MANUAL DE FERRAZ)
  const getPressaoStatus = (sistolica: number) => {
    if (sistolica >= 140) return { label: 'ALTA (RISCO)', color: 'bg-rose-600 text-white border-rose-800' };
    if (sistolica >= 130) return { label: 'ALERTA', color: 'bg-amber-100 text-amber-700 border-amber-300' };
    return { label: 'NORMAL', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <section className="mt-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GestationalAgeCard dum={dum || ""} />
        <RiskIndicator cpf={cpf} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-[#1a5276] flex items-center gap-2 uppercase tracking-tighter">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Sinais Vitais em Tempo Real
          </h2>
        </div>

        {dados.length > 0 && ultimaLeitura ? (
          <>
            {/* --- QUADRO DE NÚMEROS PROCESSADOS --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              
              {/* Batimentos */}
              <div className="bg-white border-2 border-gray-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Batimentos</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-rose-600 tracking-tighter">{Math.round(ultimaLeitura.batimentos)}</span>
                  <span className="text-xs font-bold text-gray-400">BPM</span>
                </div>
              </div>

              {/* Oxigenação */}
              <div className="bg-white border-2 border-gray-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Oxigenação</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">{Math.round(ultimaLeitura.oxigenacao)}</span>
                  <span className="text-xs font-bold text-gray-400">%</span>
                </div>
              </div>

              {/* P. Sistólica DINÂMICA (AQUI ESTÁ A ANÁLISE) */}
              <div className={`p-4 rounded-2xl border-2 transition-all duration-500 shadow-md ${getPressaoStatus(ultimaLeitura.pressao_sistolica).color}`}>
                <p className="text-[10px] font-black uppercase mb-2 opacity-80 text-current">P. Sistólica</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">{ultimaLeitura.pressao_sistolica}</span>
                  <span className="text-xs font-bold opacity-80">mmHg</span>
                </div>
                <p className="text-[9px] font-black mt-2 tracking-widest">{getPressaoStatus(ultimaLeitura.pressao_sistolica).label}</p>
              </div>

              {/* P. Diastólica */}
              <div className="bg-white border-2 border-gray-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">P. Diastólica</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-purple-600 tracking-tighter">{ultimaLeitura.pressao_diastolica}</span>
                  <span className="text-xs font-bold text-gray-400">mmHg</span>
                </div>
              </div>
            </div>

            {/* --- GRÁFICO --- */}
            <div className="h-[350px] w-full bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dados}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="horaCurta" tick={{fontSize: 10, fontWeight: 'bold'}} minTickGap={40} />
                  <YAxis yAxisId="left" domain={[40, 180]} tick={{fontSize: 10}} />
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{fontWeight: 'bold', fontSize: '12px'}}/>
                  <Area yAxisId="right" type="monotone" dataKey="oxigenacao" name="Oxigênio" fill="#dbeafe" stroke="#3b82f6" isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="batimentos" name="BPM" stroke="#ef4444" strokeWidth={4} dot={false} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="pressao_sistolica" name="Sistólica" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aguardando telemetria da paciente...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
