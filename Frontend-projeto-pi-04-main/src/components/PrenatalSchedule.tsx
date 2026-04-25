import React from 'react';
import type { RowData } from '../types';

interface PrenatalScheduleProps {
  scheduleData: RowData[];
  setScheduleData: React.Dispatch<React.SetStateAction<RowData[]>>;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  done: { label: 'Realizado', color: 'bg-emerald-500 text-white border-emerald-600', icon: '✓' },
  upcoming: { label: 'Pendente', color: 'bg-rose-50 text-rose-500 border-rose-200', icon: '!' },
  pending: { label: 'Pendente', color: 'bg-rose-50 text-rose-500 border-rose-200', icon: '!' },
  scheduled: { label: 'Agendado', color: 'bg-blue-500 text-white border-blue-600', icon: '◔' },
};

const PrenatalSchedule: React.FC<PrenatalScheduleProps> = ({ scheduleData, setScheduleData }) => {
  
  const toggleStatus = (rowIndex: number, cellIndex: number) => {
    const newData = [...scheduleData];
    const currentStatus = newData[rowIndex].cells[cellIndex].status;
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
            <div key={key} className="flex items-center gap-1.5 px-2">
              <span className={`w-3 h-3 rounded-full ${statusConfig[key].color.split(' ')[0]}`}></span>
              <span className="text-[9px] font-black text-gray-500 uppercase">{statusConfig[key].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-gray-100 shadow-xl bg-white">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="bg-[#1a5276]">
              <th className="w-40 p-4 text-[10px] font-black text-blue-100 uppercase tracking-widest border-r border-blue-800/30">Semanas</th>
              {columns.map((col, i) => (
                <th key={i} className="p-3 text-[9px] font-black text-white uppercase tracking-tighter text-center border-l border-blue-800/30">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {scheduleData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/40 transition-colors border-b border-gray-100 last:border-0 group">
                <td className="p-4 text-[11px] font-black text-[#1a5276] bg-gray-50/30 border-r border-gray-100 group-hover:bg-blue-50">
                  {row.week}
                </td>
                {row.cells.map((cell, cellIndex) => {
                  const config = statusConfig[cell.status] || statusConfig.pending;
                  return (
                    <td key={cellIndex} className="p-2 border-l border-gray-50">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(rowIndex, cellIndex)}
                          className={`
                            w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all
                            hover:scale-110 active:scale-95 shadow-md border-2
                            ${config.color}
                          `}
                          title={`${row.week} - ${columns[cellIndex]}`}
                        >
                          {config.icon}
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-widest animate-pulse">
        🎯 Clique nos ícones para gerenciar o acompanhamento
      </p>
    </div>
  );
};

export default PrenatalSchedule;
