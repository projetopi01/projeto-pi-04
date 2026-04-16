import React, { useState } from 'react';
import api from '../services/api';
import axios from 'axios';
import SearchByCpf from '../components/SearchByCpf';
import RegistrationForm from '../components/RegistrationForm';
import PrenatalSchedule from '../components/PrenatalSchedule';
import WeeksCalculator from '../components/WeeksCalculator';
import Dashboard from '../components/Dashboard';
import type { IGestante, FormData, RowData } from '../types';

export const initialFormState: FormData = {
    cpf: '', nome: '', data_nascimento: '', idade: '', nome_mae: '', data_prevista_parto: '', ultima_menstruacao: '',
    endereco: '', cep: '', cidade: '', estado: '', telefone: ''
};

const initialScheduleData: RowData[] = [
    { week: 'Até 6 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: 'Até 28 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: 'De 29 a 35 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: 'Após 36 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: 'A cada Trimestre', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '11 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '12 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '20 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '24 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '25 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '28 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '32 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
    { week: '35 semanas', cells: Array(10).fill(null).map(() => ({ text: '', status: 'upcoming' })) },
];

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-2xl font-bold text-center text-[#1a5276] mb-6">{title}</h2>
);

function PregnantRegisterPage() {
    const [formData, setFormData] = useState<FormData>(initialFormState);
    const [scheduleData, setScheduleData] = useState<RowData[]>(initialScheduleData);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [currentCpf, setCurrentCpf] = useState('');
    const [lastRegistered, setLastRegistered] = useState<IGestante | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastMenstruation, setLastMenstruation] = useState('');
    const [gestationalWeeks, setGestationalWeeks] = useState<number | null>(null);
    const [calculatorMessage, setCalculatorMessage] = useState('');

    const onGestanteFound = (gestante: IGestante) => {
        const { id, cronograma, idade, ...restOfData } = gestante;
        setFormData({ ...restOfData, idade: idade.toString() });
        setScheduleData(cronograma || initialScheduleData);
        setIsEditing(true);
        setCurrentCpf(gestante.cpf);
        setMessage(null);
        setLastRegistered(null);
    };

    const handleClear = () => {
        setFormData(initialFormState);
        setScheduleData(initialScheduleData);
        setIsEditing(false);
        setCurrentCpf('');
        setMessage(null);
        setLastMenstruation('');
        setGestationalWeeks(null);
        setCalculatorMessage('');
        window.scroll({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async () => {
        setMessage(null);
        setIsLoading(true);
        try {
            await api.put(`/api/gestantes/${currentCpf}`, { cronograma: scheduleData });
            setMessage({ type: 'success', text: 'Alterações registradas com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar o cronograma.' });
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
            setMessage({ type: 'success', text: 'Gestante cadastrada com sucesso!' });
            setLastRegistered(response.data);
            setFormData(initialFormState);
            setScheduleData(initialScheduleData);
            setLastMenstruation('');
            setGestationalWeeks(null);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) setMessage({ type: 'error', text: error.response.data.error || 'Erro.' });
            else setMessage({ type: 'error', text: 'Erro de conexão.' });
        } finally {
            setIsLoading(false);
            window.scroll({ top: 0, behavior: 'smooth' });
        }
    };

    const handleViewLastRegistered = () => {
        if (lastRegistered) {
            onGestanteFound(lastRegistered);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-[#1a5276]">Rede Cegonha</h1>
                <p className="text-lg text-gray-600">Voando na Cidade de Suzano</p>
            </header>

            <SearchByCpf onGestanteFound={onGestanteFound} onClear={handleClear} gestanteEncontrada={isEditing ? { ...formData, id: 0, cronograma: scheduleData, idade: parseInt(formData.idade) || 0 } : null} />

            {message && (
                <div className={`p-4 text-center font-semibold rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                    {message.type === 'success' && lastRegistered && (
                        <button onClick={handleViewLastRegistered} className="ml-4 font-bold underline hover:text-green-800">Visualizar Cadastro</button>
                    )}
                </div>
            )}

            {!isEditing ? (
                <form onSubmit={handleSubmit}>
                    <RegistrationForm formData={formData} setFormData={setFormData} />
                    <WeeksCalculator lastMenstruation={lastMenstruation} setLastMenstruation={setLastMenstruation} gestationalWeeks={gestationalWeeks} setGestationalWeeks={setGestationalWeeks} message={calculatorMessage} setMessage={setCalculatorMessage} />
                    <PrenatalSchedule scheduleData={scheduleData} setScheduleData={setScheduleData} />
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full sm:w-auto bg-[#1a5276] text-white font-bold text-base py-3 px-8 rounded hover:bg-[#0e3040] transition-colors disabled:bg-gray-400"
                        >
                            {isLoading ? 'Registrando...' : 'Registrar'}
                        </button>
                         <button 
                            type="button" 
                            onClick={handleClear}
                            className="w-full sm:w-auto bg-[#1a5276] text-white font-bold py-3 px-8 rounded hover:bg-gray-600 transition-colors"
                        >
                            Limpar
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <SectionTitle title={`Editando Cronograma de ${formData.nome}`} />

                    <Dashboard cpf={currentCpf} />

                    <PrenatalSchedule scheduleData={scheduleData} setScheduleData={setScheduleData} />
                    <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={handleUpdate} disabled={isLoading} className="order-2 sm:order-1 bg-[#1a5276] text-white py-2 px-6 rounded hover:bg-[#0e3040] transition-colors font-bold disabled:bg-gray-400">
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                        <button type="button" onClick={handleClear} className="order-1 sm:order-2 bg-[#1a5276] text-white font-bold py-2 px-6 rounded hover:bg-gray-600 transition-colors">
                            Voltar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PregnantRegisterPage;