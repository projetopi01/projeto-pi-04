import React, { useEffect } from 'react';
import axios from 'axios';
import type { FormData } from '../types';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-2xl font-bold text-center text-[#1a5276] mb-6">{title}</h2>
);

interface RegistrationFormProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

function RegistrationForm({ formData, setFormData }: RegistrationFormProps) {
    const labels: Record<string, string> = { cpf: 'CPF', nome: 'Nome', data_nascimento: 'Data de Nascimento', idade: 'Idade', nome_mae: 'Nome da Mãe', data_prevista_parto: 'Data Prevista do Parto', ultima_menstruacao: 'Última Menstruação', endereco: 'Endereço', cep: 'CEP', cidade: 'Cidade', estado: 'Estado', telefone: 'Telefone' };
    const dateFields = ['data_nascimento', 'data_prevista_parto', 'ultima_menstruacao'];
    const fieldOrder: (keyof FormData)[] = [ 'cpf', 'nome', 'data_nascimento', 'idade', 'nome_mae', 'data_prevista_parto', 'ultima_menstruacao', 'cep', 'endereco', 'cidade', 'estado', 'telefone' ];
    
    const aplicarMascaraCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const valorProcessado = name === 'cpf' ? aplicarMascaraCPF(value) : value;
        setFormData(prev => ({ ...prev, [name]: valorProcessado }));
    };

    useEffect(() => {
        if (formData.data_nascimento) {
            const birthDate = new Date(formData.data_nascimento);
            const today = new Date();
            if (!isNaN(birthDate.getTime())) {
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                setFormData(prev => ({ ...prev, idade: age >= 0 ? age.toString() : '' }));
            }
        }
    }, [formData.data_nascimento, setFormData]);

    const handleCepSearch = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                if (!data.erro) {
                    setFormData(prev => ({ ...prev, endereco: data.logradouro, cidade: data.localidade, estado: data.uf }));
                }
            } catch (error) { console.error("Erro ao buscar CEP", error); }
        }
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <SectionTitle title="Cadastro de Gestantes" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldOrder.map((key) => (
                    <div key={key} className="flex flex-col">
                        <label htmlFor={key} className="mb-1 font-semibold text-gray-700">{labels[key]}:</label>
                        <input
                            type={dateFields.includes(key) ? 'date' : 'text'}
                            id={key}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            onBlur={key === 'cep' ? handleCepSearch : undefined}
                            readOnly={key === 'idade'}
                            required={key !== 'idade'}
                            className="p-2 border border-gray-300 rounded bg-gray-50 read-only:bg-gray-200"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default RegistrationForm;