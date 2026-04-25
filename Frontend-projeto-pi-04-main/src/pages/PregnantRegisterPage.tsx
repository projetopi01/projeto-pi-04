import React, { useState } from 'react';
import api from '../services/api';
import axios from 'axios';
import SearchByCpf from '../components/SearchByCpf';
import RegistrationForm from '../components/RegistrationForm';
import PrenatalSchedule from '../components/PrenatalSchedule';
import Dashboard from '../components/Dashboard';
import PatientSummaryCard from '../components/PatientSummaryCard'; 
import type { IGestante, FormData, RowData } from '../types';

export const initialFormState: FormData = {
    cpf: '', nome: '', data_nascimento: '', idade: '', nome_mae: '', data_prevista_parto: '', ultima_menstruacao: '',
    endereco: '', cep: '', cidade: '', estado: '', telefone: ''
};

const initialScheduleData: RowData[] = [
    { week: '1º Trimestre (Até 12 sem)', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '2º Trimestre (13 a 27 sem)', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '3º Trimestre (28 a 35 sem)', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: 'Reta Final (Após 36 sem)', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: 'Exames de Rotina (Trimestral)', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: 'Vacinação e Odonto', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
];

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="h-[2px] flex-grow bg-gray-100"></div>
        <h2 className="text-xl font-black text-[#1a5276] uppercase tracking-tighter">{title}</h2>
        <div className="h-[2px] flex-grow bg-gray-100"></div>
    </div>
);

function PregnantRegisterPage() {
    const [formData, setFormData] = useState<FormData>(initialFormState);
    const [scheduleData, setScheduleData] = useState<RowData[]>(initialScheduleData);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [currentCpf, setCurrentCpf] = useState('');
    const [lastRegistered, setLastRegistered] = useState<IGestante | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const onGestanteFound = (gestante: IGestante) => {
        const { id, cronograma, idade, ...restOfData } = gestante;
        setFormData({ ...restOfData, idade: idade.toString() });
        
        if (cronograma && cronograma.length === initialScheduleData.length) {
            setScheduleData(cronograma);
        } else {
            setScheduleData(initialScheduleData);
        }

        setIsEditing(true);
        setCurrentCpf(gestante.cpf);
        setMessage(null);
        setLastRegistered(null);
        setShowEditForm(false);
    };

    const handleClear = () => {
        setFormData(initialFormState);
        setScheduleData(initialScheduleData);
        setIsEditing(false);
        setCurrentCpf('');
        setMessage(null);
        setShowEditForm(false);
        window.scroll({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async () => {
        setMessage(null);
        setIsLoading(true);
        try {
            await api.put(`/api/gestantes/${currentCpf}`, { ...formData, cronograma: scheduleData });
            setMessage({ type: 'success', text: 'Prontuário atualizado com sucesso!' });
            setShowEditForm(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar o prontuário.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setLastRegistered(null);
        try {
            const response = await api.post('/api/gestantes', { ...formData, cronograma: scheduleData });
            setMessage({ type: 'success', text: 'Cadastro realizado com sucesso!' });
            setLastRegistered(response.data);
            setFormData(initialFormState);
            setScheduleData(initialScheduleData);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) setMessage({ type: 'error', text: error.response.data.error || 'Erro.' });
            else setMessage({ type: 'error', text: 'Erro de conexão.' });
        } finally {
            setIsLoading(false);
            window.scroll({ top: 0, behavior: 'smooth' });
        }
    };

    const handleViewLastRegistered = () => {
        if (lastRegistered) onGestanteFound(lastRegistered);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
            
            <SearchByCpf 
                onGestanteFound={onGestanteFound} 
                onClear={handleClear} 
                gestanteEncontrada={isEditing ? { ...formData, id: 0, cronograma: scheduleData, idade: parseInt(formData.idade) || 0 } : null} 
            />

            {message && (
                <div className={`p-4 text-center font-bold rounded-xl shadow-lg border-2 animate-in fade-in duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {message.text}
                    {message.type === 'success' && lastRegistered && (
                        <button onClick={handleViewLastRegistered} className="ml-4 font-black underline hover:text-emerald-900 transition-all">Visualizar Prontuário</button>
                    )}
                </div>
            )}

            {!isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <SectionTitle title="Ficha de Cadastro" />
                        <RegistrationForm formData={formData} setFormData={setFormData} />
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <SectionTitle title="Cronograma de Consultas" />
                        <PrenatalSchedule scheduleData={scheduleData} setScheduleData={setScheduleData} />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full sm:w-auto bg-[#1a5276] text-white font-black py-4 px-12 rounded-2xl hover:bg-[#154360] transition-all shadow-xl active:scale-95 disabled:bg-gray-300 uppercase tracking-widest"
                        >
                            {isLoading ? 'PROCESSANDO...' : 'REGISTRAR '}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleClear}
                            className="text-gray-400 font-bold hover:text-gray-600 transition-colors"
                        >
                            Limpar Formulário
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                    
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative">
                        <SectionTitle title="Prontuário Médico Digital" />

                        {showEditForm ? (
                            <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-200 mb-8 animate-in fade-in duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-[#1a5276]">Editando Dados Pessoais</h3>
                                    <button type="button" onClick={() => setShowEditForm(false)} className="text-rose-500 font-bold px-4 py-2 bg-white rounded-xl shadow-sm hover:bg-rose-50 transition-all border border-rose-100">
                                        Cancelar Edição
                                    </button>
                                </div>
                                <RegistrationForm formData={formData} setFormData={setFormData} />
                            </div>
                        ) : (
                            <PatientSummaryCard patient={formData} onEditClick={() => setShowEditForm(true)} />
                        )}

                        <Dashboard cpf={currentCpf} dum={formData.ultima_menstruacao} />

                        <div className="mt-12">
                            <SectionTitle title="Calendário Pré-Natal Municipal" />
                            <PrenatalSchedule scheduleData={scheduleData} setScheduleData={setScheduleData} />
                        </div>
                        
                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={handleUpdate} disabled={isLoading} className="bg-[#1a5276] text-white py-4 px-10 rounded-2xl hover:bg-[#154360] transition-all font-black shadow-lg active:scale-95 disabled:bg-gray-300 uppercase tracking-widest">
                                {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </button>
                            <button type="button" onClick={handleClear} className="bg-gray-100 text-gray-500 font-bold py-4 px-10 rounded-2xl hover:bg-gray-200 transition-all border border-gray-200 uppercase tracking-widest text-xs">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PregnantRegisterPage;
