import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import WeeksCalculator from './WeeksCalculator';

const TestHost = () => {
  const [lastMenstruation, setLastMenstruation] = useState('');
  const [gestationalWeeks, setGestationalWeeks] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  return (
    <WeeksCalculator 
      lastMenstruation={lastMenstruation}
      setLastMenstruation={setLastMenstruation}
      gestationalWeeks={gestationalWeeks}
      setGestationalWeeks={setGestationalWeeks}
      message={message}
      setMessage={setMessage}
    />
  );
};

describe('Componente WeeksCalculator', () => {

  it('deve calcular e exibir as semanas de gestação corretamente', async () => {
  
    render(<TestHost />);
    const user = userEvent.setup();
    const dateInput = screen.getByLabelText(/Última Menstruação/i);
    const calculateButton = screen.getByRole('button', { name: /Calcular/i });

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 70); // 10 semanas atrás
    await user.type(dateInput, pastDate.toISOString().split('T')[0]);
    await user.click(calculateButton);

    const resultText = await screen.findByText(/A gestante está com aproximadamente 10 semanas./i);
    expect(resultText).toBeInTheDocument();
  });

  it('deve mostrar uma mensagem de erro se a data for no futuro', async () => {
    render(<TestHost />);
    const user = userEvent.setup();
    const dateInput = screen.getByLabelText(/Última Menstruação/i);
    const calculateButton = screen.getByRole('button', { name: /Calcular/i });

    await user.type(dateInput, '2099-01-01'); 
    await user.click(calculateButton);

    const errorText = await screen.findByText(/A data não pode ser no futuro/i);
    expect(errorText).toBeInTheDocument();
  });
});