import React from 'react';
// Correção 1: Importação do tipo usando 'type'
import type { RowData } from '../types';

interface PrenatalScheduleProps {
  scheduleData: RowData[];
  setScheduleData: React.Dispatch<React.SetStateAction<RowData[]>>;
}

// Correção 2: Mapeamento exato dos nomes que seu 'types.ts' usa
// Se no seu erro diz que 'pending' não existe, vamos garantir que o objeto aceite qualquer string de status
const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  done: { label: 'Realizado', color: 'bg-emerald-500 text-white', icon: '✓' },
  upcoming: { label: 'Pendente', color: 'bg-rose-100 text-rose-600 border-rose-200', icon: '!' },
  pending: { label: 'Pendente', color: 'bg-rose-100 text-rose-600 border-rose-200', icon: '!' },
  scheduled: { label: 'Agendado', color: 'bg-blue-500 text-white', icon: '◔' },
};

const PrenatalSchedule: React.FC<PrenatalScheduleProps> = ({ scheduleData, setScheduleData }) => {
  
  const toggleStatus = (rowIndex: number, cellIndex: number) => {
    const newData = [...scheduleData];
    const currentStatus = newData[rowIndex].cells[cellIndex].status;
    
    // Correção 3: Forçar o TypeScript a aceitar os tipos de status
    const statusOrder = ['upcoming', 'scheduled', 'done'] as const;
    const currentIndex = statusOrder.indexOf(currentStatus as any);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    newData[rowIndex].cells[cellIndex].status = nextStatus as any;
    setScheduleData(newData);
  };

  const columns = [
    "Abertura", "Consulta", "Odonto", "Laborat.", "Testes R.", 
    "Radio.", "Toxoplas.", "SUAB", "Laquead.", "Vacinas"
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-black text-[#1a5276] tracking-tighter uppercase italic">
            Cronograma Pré-Natal Municipal
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Protocolo de Acompanhamento • Suzano/SP
          </p>
        </div>

        <div className="flex gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
          {['done', 'pending', 'scheduled'].map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${statusConfig[key].color.split(' ')[0]}`}></span>
              <span className="text-[9px] font-black text-gray-500 uppercase">{statusConfig[key].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a5276]">
              <th className="p-4 text-[10px] font-black text-blue-100 uppercase tracking-widest border-b border-blue-800">Semanas</th>
              {columns.map((col, i) => (
                <th key={i} className="p-4 text-[10px] font-black text-white uppercase tracking-tighter border-b border-blue-800 text-center">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {scheduleData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="p-4 text-[11px] font-black text-[#1a5276] bg-gray-50/50 group-hover:bg-blue-50 transition-colors">
                  {row.week}
                </td>
                {row.cells.map((cell, cellIndex) => {
                  const config = statusConfig[cell.status] || statusConfig.pending;
                  return (
                    <td key={cellIndex} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(rowIndex, cellIndex)}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black transition-all
                          hover:scale-110 active:scale-95 shadow-sm border
                          ${config.color}
                        `}
                        title="Clique para alternar status"
                      >
                        {config.icon}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrenatalSchedule;
