import React, { useEffect } from 'react';
import axios from 'axios';
import type { FormData } from '../types';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-2xl font-black text-center text-[#1a5276] mb-6 uppercase tracking-tighter">{title}</h2>
);

interface RegistrationFormProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function RegistrationForm({ formData, setFormData }: RegistrationFormProps) {
    const labels: Record<string, string> = { 
        cpf: 'CPF', nome: 'Nome Completo', data_nascimento: 'Data de Nascimento', 
        idade: 'Idade', nome_mae: 'Nome da Mãe', data_prevista_parto: 'Data Prevista do Parto (DPP)', 
        ultima_menstruacao: 'DUM (Última Menstruação)', endereco: 'Endereço Completo', 
        cep: 'CEP', cidade: 'Cidade', estado: 'Estado', telefone: 'Telefone / WhatsApp' 
    };
    
    const dateFields = ['data_nascimento', 'data_prevista_parto', 'ultima_menstruacao'];
    const fieldOrder: (keyof FormData)[] = [ 'cpf', 'nome', 'data_nascimento', 'idade', 'nome_mae', 'data_prevista_parto', 'ultima_menstruacao', 'cep', 'endereco', 'cidade', 'estado', 'telefone' ];
    
    // FUNÇÕES DE MÁSCARA
    const aplicarMascaraCPF = (v: string) => {
        v = v.replace(/\D/g, "");
        if (v.length <= 11) {
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return v.substring(0, 14);
    };

    const aplicarMascaraTelefone = (v: string) => {
        v = v.replace(/\D/g, "");
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d)(\d{4})$/, "$1-$2");
        return v.substring(0, 15);
    };

    const aplicarMascaraCEP = (v: string) => {
        v = v.replace(/\D/g, "");
        v = v.replace(/^(\d{5})(\d)/, "$1-$2");
        return v.substring(0, 9);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let valorProcessado = value;

        if (name === 'cpf') valorProcessado = aplicarMascaraCPF(value);
        if (name === 'telefone') valorProcessado = aplicarMascaraTelefone(value);
        if (name === 'cep') valorProcessado = aplicarMascaraCEP(value);

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
        const cepLimpo = formData.cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            try {
                const { data } = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                if (!data.erro) {
                    setFormData(prev => ({ 
                        ...prev, 
                        endereco: data.logradouro, 
                        cidade: data.localidade, 
                        estado: data.uf 
                    }));
                }
            } catch (error) { console.error("Erro ao buscar CEP", error); }
        }
    };

    return (
        <section className="bg-white p-2 md:p-4 rounded-xl mb-4" translate="no">
            <SectionTitle title="Ficha Cadastral" />
            
            <div className="space-y-10">
                {/* GRUPO 1: IDENTIFICAÇÃO */}
                <div>
                    <h3 className="notranslate text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 flex items-center justify-center rounded-full text-[10px]">01</span>
                        Identificação da Paciente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fieldOrder.slice(0, 5).map((key) => (
                            <div key={key} className="flex flex-col">
                                <label htmlFor={key} className="notranslate mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-tight">{labels[key]}</label>
                                <input
                                    type={dateFields.includes(key) ? 'date' : 'text'}
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    readOnly={key === 'idade'}
                                    placeholder={key === 'cpf' ? '000.000.000-00' : ''}
                                    className={`p-3 border-2 border-gray-100 rounded-xl outline-none transition-all focus:border-[#1a5276] focus:ring-4 focus:ring-blue-50 font-bold text-gray-700 ${key === 'idade' ? 'bg-gray-50 text-gray-400 border-dashed' : 'bg-white'}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRUPO 2: DADOS GESTACIONAIS */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-inner">
                    <h3 className="notranslate text-xs font-black text-[#1a5276] uppercase tracking-widest mb-6 flex items-center gap-2">
                         <span className="w-6 h-6 bg-blue-200 flex items-center justify-center rounded-full text-[10px]">02</span>
                         Informações do Pré-Natal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fieldOrder.slice(5, 7).map((key) => (
                            <div key={key} className="flex flex-col">
                                <label htmlFor={key} className="notranslate mb-1.5 text-xs font-black text-[#1a5276] uppercase">{labels[key]}</label>
                                <input
                                    type="date"
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    className="p-3 border-2 border-blue-100 rounded-xl focus:border-[#1a5276] focus:ring-4 focus:ring-blue-100 bg-white font-bold text-[#1a5276]"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRUPO 3: ENDEREÇO E CONTATO */}
                <div>
                    <h3 className="notranslate text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded-full text-[10px]">03</span>
                        Localização e Contato
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {fieldOrder.slice(7).map((key) => (
                            <div key={key} className={`flex flex-col ${key === 'endereco' ? 'lg:col-span-2' : ''}`}>
                                <label htmlFor={key} className="notranslate mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-tight">{labels[key]}</label>
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    onBlur={key === 'cep' ? handleCepSearch : undefined}
                                    placeholder={key === 'telefone' ? '(00) 00000-0000' : key === 'cep' ? '00000-000' : ''}
                                    className="p-3 border-2 border-gray-100 rounded-xl focus:border-[#1a5276] focus:ring-4 focus:ring-blue-50 bg-white font-bold text-gray-700"
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
