import React from 'react';
import type { FormData } from '../types';

interface PatientSummaryCardProps {
  patient: FormData;
  onEditClick: () => void;
}

const PatientSummaryCard: React.FC<PatientSummaryCardProps> = ({ patient, onEditClick }) => {
  const formatData = (dataSql: string) => {
    if (!dataSql) return 'N/I';
    const [ano, mes, dia] = dataSql.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-l-4 border-[#1a5276] overflow-hidden mb-8 transition-all hover:shadow-lg">
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-[#1a5276] rounded-full flex items-center justify-center text-xl font-bold uppercase shadow-sm">
            {patient.nome ? patient.nome.charAt(0) : '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 uppercase">{patient.nome}</h2>
            {/* TROCA REALIZADA: Sai Idade, entra Data de Nascimento */}
            <p className="text-sm text-gray-500 font-medium">
                CPF: {patient.cpf} • Nascimento: {formatData(patient.data_nascimento)}
            </p>
          </div>
        </div>

        <button 
          onClick={onEditClick}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
        >
          ✏️ Editar Dados Pessoais
        </button>

      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 mb-2">Dados Obstétricos</h4>
          <p className="text-sm"><span className="font-semibold text-gray-600">DUM:</span> {formatData(patient.ultima_menstruacao)}</p>
          <p className="text-sm"><span className="font-semibold text-gray-600">DPP:</span> {formatData(patient.data_prevista_parto)}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 mb-2">Contato e Endereço</h4>
          <p className="text-sm"><span className="font-semibold text-gray-600">Tel:</span> {patient.telefone || 'Não informado'}</p>
          <p className="text-sm truncate" title={patient.endereco}><span className="font-semibold text-gray-600">End:</span> {patient.endereco || 'Não informado'}</p>
          <p className="text-sm"><span className="font-semibold text-gray-600">Local:</span> {patient.cidade}{patient.estado ? ` - ${patient.estado}` : ''}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 mb-2">Filiação</h4>
          <p className="text-sm"><span className="font-semibold text-gray-600">Nome da Mãe:</span></p>
          <p className="text-sm font-medium text-gray-800 capitalize truncate" title={patient.nome_mae}>
            {patient.nome_mae || 'Não informado'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientSummaryCard;
