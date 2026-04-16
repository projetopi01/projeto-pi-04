import React from 'react';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-2xl font-bold text-center text-[#1a5276] mb-6">{title}</h2>
);


interface WeeksCalculatorProps {
  lastMenstruation: string;
  setLastMenstruation: (value: string) => void;
  gestationalWeeks: number | null;
  setGestationalWeeks: (value: number | null) => void;
  message: string;
  setMessage: (value: string) => void;
}

function WeeksCalculator({
  lastMenstruation,
  setLastMenstruation,
  gestationalWeeks,
  setGestationalWeeks,
  message,
  setMessage,
}: WeeksCalculatorProps) {
    const handleCalculate = () => {
    if (!lastMenstruation) {
      setMessage('Por favor, insira a data da última menstruação.');
      setGestationalWeeks(null); 
      return;
    }

    const lastMenstruationDate = new Date(lastMenstruation);
    const today = new Date();

    if (lastMenstruationDate > today) {
        setMessage('A data não pode ser no futuro.');
        setGestationalWeeks(null);
        return;
    }

    const differenceInMillis = today.getTime() - lastMenstruationDate.getTime();
    const weeks = Math.floor(differenceInMillis / (1000 * 60 * 60 * 24 * 7));

    setGestationalWeeks(weeks);
    setMessage('');
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-8">
      <SectionTitle title="Calcular Semanas de Gestação" />
      <div className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="w-full flex-grow flex flex-col text-left">
            <label htmlFor="last-menstruation" className="mb-1 font-semibold text-gray-700">
              Última Menstruação:
            </label>
            <input
              type="date"
              id="last-menstruation"
              value={lastMenstruation}
              onChange={(e) => setLastMenstruation(e.target.value)} 
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <button 
            type="button" 
            onClick={handleCalculate} 
            className="w-full sm:w-auto mt-4 sm:mt-0 self-end bg-[#1a5276] text-white py-2 px-4 rounded hover:bg-[#0e3040] transition-colors"
          >
            Calcular
          </button>
        </div>
        
        <div className="mt-4 text-center h-8"> 
          {message && <p className="text-red-500 font-semibold">{message}</p>}
          {gestationalWeeks !== null && (
            <p className="text-lg font-bold text-green-700">
              A gestante está com aproximadamente {gestationalWeeks} semanas.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default WeeksCalculator;