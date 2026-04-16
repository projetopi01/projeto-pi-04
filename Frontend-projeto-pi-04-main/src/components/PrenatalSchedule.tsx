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
  
  const statusClasses: Record<CellStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    completed: 'bg-green-100 text-green-800 hover:bg-green-200',
    upcoming: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };

  const tableHeaders = [
      'Abertura do Pré-Natal', 'Consulta inicial', 'Avaliação odontológica', 'Exames laboratoriais',
      'Sorologias e Teste rápido', 'Exames Radiológicos', 'Toxoplasmose', 'SUAB', 'Laqueadura', 'Vacinas'
  ];

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <SectionTitle title="Cronograma Pré-Natal" />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border border-gray-300">Semana</th>
              {tableHeaders.map(header => (
                <th key={header} className="p-2 border border-gray-300 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="p-2 border border-gray-300 font-medium bg-gray-50">{row.week}</td>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    onClick={() => handleStatusChange(rowIndex, cellIndex)}
                    onBlur={(e) => handleTextChange(e, rowIndex, cellIndex)}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    className={`p-2 border border-gray-300 cursor-pointer transition-colors ${statusClasses[cell.status]}`}
                  >
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">Clique em uma célula para alterar seu status de cor. </p><p className="text-xs text-gray-500 mt-4 text-center">O texto também é editável.</p>
    </section>
  );
}

export default PrenatalSchedule;