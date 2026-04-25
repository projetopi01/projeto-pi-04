import React from 'react';

type CellStatus = 'pending' | 'completed' | 'upcoming';
interface CellData { text: string; status: CellStatus; }
interface RowData { week: string; cells: CellData[]; }

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-2xl font-bold text-center text-[#1a5276] mb-6">{title}</h2>
);

interface PrenatalScheduleProps {
  scheduleData: RowData[];
  setScheduleData: React.Dispatch<React.SetStateAction<RowData[]>>;
}

function PrenatalSchedule({ scheduleData, setScheduleData }: PrenatalScheduleProps) {

  const handleStatusChange = (rowIndex: number, cellIndex: number) => {
    const newSchedule = JSON.parse(JSON.stringify(scheduleData));
    const currentStatus = newSchedule[rowIndex].cells[cellIndex].status;

    let nextStatus: CellStatus = 'pending';
    if (currentStatus === 'pending') nextStatus = 'completed';
    else if (currentStatus === 'completed') nextStatus = 'upcoming';
    else if (currentStatus === 'upcoming') nextStatus = 'pending';

    newSchedule[rowIndex].cells[cellIndex].status = nextStatus;
    setScheduleData(newSchedule);
  };

  const handleTextChange = (event: React.FocusEvent<HTMLTableCellElement>, rowIndex: number, cellIndex: number) => {
    const newSchedule = JSON.parse(JSON.stringify(scheduleData));
    newSchedule[rowIndex].cells[cellIndex].text = event.currentTarget.textContent || '';
    setScheduleData(newSchedule);
  };
  
  // Cores mais modernas e suaves (estilo SaaS médico)
  const statusClasses: Record<CellStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    upcoming: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
  };

  const tableHeaders = [
      'Abertura', 'Consulta', 'Odonto', 'Laboratório',
      'Testes Rápidos', 'Radiologia', 'Toxoplas.', 'SUAB', 'Laqueadura', 'Vacinas'
  ];

  return (
    <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <SectionTitle title="Cronograma Pré-Natal Municipal" />
      
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-[11px] text-center">
          <thead>
            <tr className="bg-[#1a5276] text-white">
              <th className="p-3 border-r border-blue-400/30 font-bold uppercase tracking-wider">Semana</th>
              {tableHeaders.map(header => (
                <th key={header} className="p-3 border-r border-blue-400/30 font-semibold leading-tight">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scheduleData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 border-r border-gray-200 font-bold bg-gray-50 text-[#1a5276] sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0,05)]">
                  {row.week}
                </td>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    onClick={() => handleStatusChange(rowIndex, cellIndex)}
                    onBlur={(e) => handleTextChange(e, rowIndex, cellIndex)}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    className={`p-3 border-r border-gray-200 cursor-pointer transition-all duration-200 min-w-[80px] h-12 align-middle font-medium
                      ${statusClasses[cell.status]} 
                      ${cell.status === 'completed' ? 'italic opacity-80' : ''}`}
                  >
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span> Realizado
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300"></span> Pendente
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-100 border border-sky-300"></span> Agendado
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-4 text-center italic">
        Dica: Clique para alternar status • Edite o texto diretamente na célula
      </p>
    </section>
  );
}

export default PrenatalSchedule;
