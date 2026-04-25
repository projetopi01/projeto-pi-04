import React from 'react';

interface GestationalAgeProps {
  dum: string;
}

const GestationalAgeCard: React.FC<GestationalAgeProps> = ({ dum }) => {
  const calcularSemanas = (dataDUM: string) => {
    if (!dataDUM) return { semanas: 0, diasRestantes: 0 };
    const hoje = new Date();
    const dataInicio = new Date(dataDUM + "T00:00:00"); 
    const diffInMs = hoje.getTime() - dataInicio.getTime();
    const totalDias = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden h-full flex flex-col justify-between select-none">
      {/* Círculo de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Topo do Card */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            Idade Gestacional Atual
          </h3>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
            trimestre === 1 ? 'bg-sky-100 text-sky-700' : 
            trimestre === 2 ? 'bg-purple-100 text-purple-700' : 
            'bg-emerald-100 text-emerald-700'
          }`}>
            {trimestre}º Trimestre
          </span>
        </div>

        {/* Bloco Central - NÚMERO GRANDE */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-6xl font-black text-[#1a5276] tabular-nums">
            {semanas}
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-300 leading-none">Semanas</span>
            {diasRestantes > 0 && (
              <span className="text-sm font-bold text-sky-500">+{diasRestantes} dias</span>
            )}
          </div>
        </div>

        {/* Rodapé do Card */}
        <div className="mt-auto">
          <div className="flex justify-between text-[10px] mb-2 font-bold text-gray-400 uppercase">
            <span>Início</span>
            <span className="text-[#1a5276] font-extrabold">Hoje</span>
            <span>40 Sem</span>
          </div>
          
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-[#1a5276]"
              style={{ width: `${porcentagem}%` }}
            ></div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
             <div className="text-[11px] text-gray-600 font-bold bg-gray-50 py-1.5 rounded-lg text-center border border-gray-100">
                {semanas < 13 && "🌱 Formação dos órgãos"}
                {semanas >= 13 && semanas < 27 && "👶 Crescimento e movimentos"}
                {semanas >= 27 && semanas < 37 && "🧠 Amadurecimento final"}
                {semanas >= 37 && "✅ Pronto para o nascimento"}
             </div>
             <p className="text-[10px] text-gray-400 text-center font-medium">
               {semanas >= 37 ? "Gestação a termo." : `Faltam ${40 - semanas} semanas.`}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestationalAgeCard;
