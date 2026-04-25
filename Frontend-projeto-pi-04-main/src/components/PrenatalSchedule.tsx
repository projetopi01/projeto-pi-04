import React from 'react';
import type { RowData } from '../types';

interface PrenatalScheduleProps {
  scheduleData: RowData[];
  setScheduleData: React.Dispatch<React.SetStateAction<RowData[]>>;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  done: { label: 'OK', color: 'bg-emerald-500 text-white border-emerald-600', icon: '✓' },
  upcoming: { label: 'PENDENTE', color: 'bg-gray-50 text-gray-300 border-gray-200', icon: '!' },
  pending: { label: 'PENDENTE', color: 'bg-gray-50 text-gray-300 border-gray-200', icon: '!' },
  scheduled: { label: 'AGENDADO', color: 'bg-blue-500 text-white border-blue-600', icon: '◔' },
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
    "Abertura", "Consulta", "Odonto", "Exames", "Testes", 
    "Radio.", "Toxo.", "SUAB", "Laquead.", "Vacinas"
  ];

  return (
    <div className="mt-8 select-none">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-black text-[#1a5276] uppercase tracking-tighter">
            Cronograma Pré-Natal
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Protocolo Municipal Suzano
          </p>
        </div>
        
        <div className="flex gap-2">
          {['done', 'pending', 'scheduled'].map((key) => (
            <div key={key} className="flex items-center gap-1 bg-white border border-gray-100 px-2 py-1 rounded-md shadow-sm">
              <span className={`w-2 h-2 rounded-full ${statusConfig[key].color.split(' ')[0]}`}></span>
              <span className="text-[8px] font-black text-gray-400 uppercase">{statusConfig[key].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 shadow-2xl bg-white">
        {/* 'table-fixed' garante que as colunas tenham larguras idênticas e alinhamento reto */}
        <table className="w-full border-collapse table-fixed min-w-[900px]">
          <thead>
            <tr className="bg-[#1a5276]">
              <th className="w-44 p-4 text-[10px] font-black text-blue-100 uppercase border-r border-blue-900/50">
                Período/Semanas
              </th>
              {columns.map((col, i) => (
                <th key={i} className="p-2 text-[9px] font-black text-white uppercase text-center border-l border-blue-900/50">
                  <div className="flex flex-col items-center justify-center h-10">
                    {col}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((row, rowIndex) => (
              <tr key={rowIndex} className="group hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-0">
                <td className="p-4 text-[11px] font-bold text-[#1a5276] bg-gray-50/50 group-hover:bg-blue-50 border-r border-gray-100">
                  {row.week}
                </td>
                {row.cells.map((cell, cellIndex) => {
                  const config = statusConfig[cell.status] || statusConfig.pending;
                  return (
                    <td key={cellIndex} className="p-2 border-l border-gray-50 h-20">
                      <div className="flex items-center justify-center w-full h-full">
                        <button
                          type="button"
                          onClick={() => toggleStatus(rowIndex, cellIndex)}
                          className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all
                            hover:scale-110 active:scale-90 shadow-lg border-2
                            ${config.color}
                          `}
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
    </div>
  );
};

export default PrenatalSchedule;
