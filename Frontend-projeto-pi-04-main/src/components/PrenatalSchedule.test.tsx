import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import PrenatalSchedule from './PrenatalSchedule';
import type { RowData } from '../types';

const mockInitialSchedule: RowData[] = [
  { week: 'Até 6 semanas', cells: [
    { text: 'Consulta inicial', status: 'pending' },
    { text: 'Avaliação odonto', status: 'upcoming' },
    ...Array(8).fill({ text: '', status: 'upcoming' })
  ]},
  { week: 'Até 28 semanas', cells: [
    { text: 'Uma vez por mês', status: 'upcoming' },
    ...Array(9).fill({ text: '', status: 'upcoming' })
  ]},
];

const TestHost = () => {
    const [scheduleData, setScheduleData] = useState<RowData[]>(mockInitialSchedule);
    return <PrenatalSchedule scheduleData={scheduleData} setScheduleData={setScheduleData} />;
};

describe('Componente PrenatalSchedule', () => {
  it('deve renderizar a tabela com os dados iniciais corretamente', () => {
    render(<TestHost />);

    const allCells = screen.getAllByRole('cell');
    
    expect(allCells.some(cell => cell.textContent === 'Até 6 semanas')).toBe(true);
    expect(allCells.some(cell => cell.textContent === 'Consulta inicial')).toBe(true);
    expect(allCells.some(cell => cell.textContent === 'Uma vez por mês')).toBe(true);
  });

  it('deve ciclar o status de uma célula ao ser clicada', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    const cell = screen.getByRole('cell', { name: /Consulta inicial/i });

    expect(cell).toHaveClass('bg-yellow-100');
   
    await user.click(cell);
    expect(cell).toHaveClass('bg-green-100');
  
    await user.click(cell);
    expect(cell).toHaveClass('bg-blue-100');
    
    await user.click(cell);
    expect(cell).toHaveClass('bg-yellow-100');
  });

  it('deve permitir a edição do texto de uma célula', async () => {
    const user = userEvent.setup();
    render(<TestHost />);
    
    const cell = screen.getByRole('cell', { name: /Avaliação odonto/i });

    await user.clear(cell);
    await user.type(cell, 'Texto foi editado');
    await user.tab();

    expect(screen.getByText('Texto foi editado')).toBeInTheDocument();
  });
});