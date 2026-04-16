import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, type Mock } from 'vitest';
import SearchByCpf from './SearchByCpf';
import type { IGestante } from '../types';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Componente SearchByCpf', () => {
  const mockGestanteData: IGestante = {
    id: 1, cpf: '12345678900', nome: 'Maria da Silva', data_nascimento: '1990-05-15',
    idade: 35, nome_mae: 'Ana da Silva', data_prevista_parto: '2025-12-25',
    ultima_menstruacao: '2025-03-20', endereco: 'Rua das Flores, 123', cep: '08500100',
    cidade: 'Suzano', estado: 'SP', telefone: '11987654321', cronograma: null,
  };

  // --- Teste da Ação de Busca ---
  it('deve chamar onGestanteFound com os dados corretos em uma busca bem-sucedida', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnGestanteFound = vi.fn();
    (api.get as Mock).mockResolvedValue({ data: mockGestanteData });

    render(
      <SearchByCpf 
        onGestanteFound={mockOnGestanteFound}
        onClear={vi.fn()}
        gestanteEncontrada={null}
      />
    );

    const inputCpf = screen.getByPlaceholderText(/Digite o CPF para buscar/i);
    const searchButton = screen.getByRole('button', { name: /Buscar/i });

    // ACT
    await user.type(inputCpf, '123.456.789-00');
    await user.click(searchButton);

    // ASSERT
    // A verificação mais importante: a função de callback foi chamada corretamente?
    await waitFor(() => {
      expect(mockOnGestanteFound).toHaveBeenCalledWith(mockGestanteData);
    });
  });

  // --- Teste da Exibição dos Dados ---
  it('deve exibir os dados da gestante quando a prop gestanteEncontrada é fornecida', () => {
    // ARRANGE
    // Renderizamos o componente já passando os dados, sem simular clique.
    render(
      <SearchByCpf 
        onGestanteFound={vi.fn()}
        onClear={vi.fn()}
        gestanteEncontrada={mockGestanteData}
      />
    );

    // ASSERT
    // Agora sim, verificamos se o texto aparece na tela.
    expect(screen.getByText('Maria da Silva')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
    expect(screen.getByText('15/05/1990')).toBeInTheDocument();
  });
  
  it('deve exibir uma mensagem de erro local em caso de falha na busca', async () => {
    // ARRANGE
    const user = userEvent.setup();
    (api.get as Mock).mockRejectedValue(new Error('Not Found'));

    render(
      <SearchByCpf 
        onGestanteFound={vi.fn()}
        onClear={vi.fn()}
        gestanteEncontrada={null}
      />
    );

    const inputCpf = screen.getByPlaceholderText(/Digite o CPF para buscar/i);
    const searchButton = screen.getByRole('button', { name: /Buscar/i });

    // ACT
    await user.type(inputCpf, '000.000.000-00');
    await user.click(searchButton);

    // ASSERT
    expect(await screen.findByText('Gestante não encontrada.')).toBeInTheDocument();
  });
});