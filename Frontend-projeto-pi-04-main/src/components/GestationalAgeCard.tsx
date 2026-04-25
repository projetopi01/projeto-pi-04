import React from 'react';

interface GestationalAgeProps {
  dum: string; // Data da Última Menstruação (formato YYYY-MM-DD)
}

const GestationalAgeCard: React.FC<GestationalAgeProps> = ({ dum }) => {
  const calcularSemanas = (dataDUM: string) => {
    if (!dataDUM) return { semanas: 0, diasRestantes: 0 };
    
    // Pegando a data local ignorando o fuso horário que poderia alterar o dia
    const hoje = new Date();
    const dataInicio = new Date(dataDUM + "T00:00:00"); 
    
    const diffInMs = hoje.getTime() - dataInicio.getTime();
    const totalDias = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Evitar números negativos se a data for no futuro (erro de cadastro)
    if (totalDias < 0) return { semanas: 0, diasRestantes: 0 };

    const semanas = Math.floor(totalDias / 7);
    const diasRestantes = totalDias % 7;
    
    return { semanas, diasRestantes };
  };

  const { semanas, diasRestantes } = calcularSemanas(dum);
  
  let trimestre = 1;
  if (semanas > 12 && semanas <= 26) trimestre = 2;
  if (semanas > 26) trimestre = 3;

  const porcentagem = Math.min(Math.max((semanas / 40) * 100, 0), 100);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform hover:scale-110"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-gray-500 font-bold uppercase text-[11px] tracking-widest">
            Idade Gestacional Atual
          </h3>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
            trimestre === 1 ? 'bg-sky-100 text-sky-700 border border-sky-200' : 
            trimestre === 2 ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
            'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}>
            {trimestre}º Trimestre
          </span>
        </div>

        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-6xl font-black text-[#1a5276] tabular-nums tracking-tighter">
            {semanas}
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-400 leading-none">Semanas</span>
            {diasRestantes > 0 && (
              <span className="text-sm font-bold text-sky-500">+ {diasRestantes} dias</span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex justify-between text-[10px] mb-1.5 font-bold text-gray-400 uppercase">
            <span>Início</span>
            <span className="text-[#1a5276]">Semana {semanas}</span>
            <span>40 Sem</span>
          </div>
          <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-200 shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-[#1a5276] transition-all duration-1000 shadow-sm"
              style={{ width: `${porcentagem}%` }}
            ></div>
          </div>
          <p className="mt-3 text-[11px] text-gray-400 text-center font-medium">
            {semanas >= 37 
              ? "Próximo ao parto (Gestação a termo)" 
              : `Faltam ${40 - semanas} semanas para o parto.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestationalAgeCard;
