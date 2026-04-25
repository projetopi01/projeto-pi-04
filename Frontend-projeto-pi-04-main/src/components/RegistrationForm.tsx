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

export function RegistrationForm({ formData, setFormData }: RegistrationFormProps) {
    const labels: Record<string, string> = { 
        cpf: 'CPF', nome: 'Nome', data_nascimento: 'Data de Nascimento', 
        idade: 'Idade', nome_mae: 'Nome da Mãe', data_prevista_parto: 'Data Prevista do Parto', 
        ultima_menstruacao: 'Última Menstruação', endereco: 'Endereço', 
        cep: 'CEP', cidade: 'Cidade', estado: 'Estado', telefone: 'Telefone' 
    };
    
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

    // O RETURN PRECISA FICAR AQUI DENTRO DA FUNÇÃO
    return (
        <section className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100">
            <SectionTitle title="Cadastro de Gestantes" />
            
            <div className="space-y-8">
                {/* GRUPO 1: IDENTIFICAÇÃO */}
                <div>
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2">
                        1. Identificação da Paciente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fieldOrder.slice(0, 5).map((key) => (
                            <div key={key} className="flex flex-col">
                                <label htmlFor={key} className="mb-1 text-sm font-semibold text-gray-600">{labels[key]}</label>
                                <input
                                    type={dateFields.includes(key) ? 'date' : 'text'}
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    readOnly={key === 'idade'}
                                    className={`p-2.5 border border-gray-200 rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${key === 'idade' ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRUPO 2: DADOS GESTACIONAIS */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-[#1a5276] uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">
                        2. Informações do Pré-Natal (Manual Ferraz)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fieldOrder.slice(5, 7).map((key) => (
                            <div key={key} className="flex flex-col">
                                <label htmlFor={key} className="mb-1 text-sm font-bold text-[#1a5276]">{labels[key]}</label>
                                <input
                                    type="date"
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    className="p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRUPO 3: ENDEREÇO E CONTATO */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                        3. Localização e Contato
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fieldOrder.slice(7).map((key) => (
                            <div key={key} className="flex flex-col">
                                <label htmlFor={key} className="mb-1 text-sm font-semibold text-gray-600">{labels[key]}</label>
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    onBlur={key === 'cep' ? handleCepSearch : undefined}
                                    className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RegistrationForm;
