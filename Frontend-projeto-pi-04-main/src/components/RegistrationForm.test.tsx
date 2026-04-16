import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RegistrationForm from './RegistrationForm';
import type { FormData } from '../types';
import axios from 'axios';

export const initialFormState: FormData = {
    cpf: '', nome: '', data_nascimento: '', idade: '', nome_mae: '', data_prevista_parto: '', ultima_menstruacao: '',
    endereco: '', cep: '', cidade: '', estado: '', telefone: ''
};

const TestHost = () => {
    const [formData, setFormData] = useState<FormData>(initialFormState);
    return <RegistrationForm formData={formData} setFormData={setFormData} />;
};

describe('Componente RegistrationForm', () => {

  it('deve atualizar o valor do campo de nome quando o usuário digita', async () => {
    const user = userEvent.setup(); 
    render(<TestHost />);
    const nomeInput = screen.getByLabelText(/^Nome:$/i);
    await user.type(nomeInput, 'Maria');
    expect(nomeInput).toHaveValue('Maria');
  });
  
  it('deve aplicar a máscara de CPF corretamente', async () => {
    const user = userEvent.setup();
    render(<TestHost />);
    const cpfInput = screen.getByLabelText(/^CPF:$/i);
    await user.type(cpfInput, '12345678900');
    expect(cpfInput).toHaveValue('123.456.789-00');
  });

  it('deve preencher os campos de endereço ao digitar um CEP válido', async () => {
    const user = userEvent.setup();   
    const mockCepData = {
        logradouro: 'Rua das Flores',
        localidade: 'Suzano',
        uf: 'SP',
    };

    const axiosGetSpy = vi.spyOn(axios, 'get').mockResolvedValue({ data: mockCepData });

    render(<TestHost />);

    const cepInput = screen.getByLabelText(/CEP/i);
    const enderecoInput = screen.getByLabelText(/Endereço/i);
    const cidadeInput = screen.getByLabelText(/Cidade/i);
    const estadoInput = screen.getByLabelText(/Estado/i);

    await user.type(cepInput, '08675000');
 
    await user.tab();

    await waitFor(() => {
        expect(enderecoInput).toHaveValue('Rua das Flores');
        expect(cidadeInput).toHaveValue('Suzano');
        expect(estadoInput).toHaveValue('SP');
    });

    axiosGetSpy.mockRestore();
  });

  it('deve calcular e preencher a idade automaticamente ao inserir a data de nascimento', async () => {
    const user = userEvent.setup();
    render(<TestHost />);

    const dataNascimentoInput = screen.getByLabelText(/Data de Nascimento/i);
    const idadeInput = screen.getByLabelText(/^Idade:$/i) as HTMLInputElement;
    const today = new Date();
    const birthYear = today.getFullYear() - 30;
    const birthDate = new Date(birthYear, today.getMonth(), today.getDate());
    const formattedBirthDate = birthDate.toISOString().split('T')[0];

    await user.type(dataNascimentoInput, formattedBirthDate);

    await waitFor(() => {

        expect(['29', '30']).toContain(idadeInput.value);
    });
  });
});