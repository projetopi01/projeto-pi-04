//import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  message: string;
  backLink?: string;
  backLinkText?: string;
}

function ErrorPage({
  message,
  backLink = '/',
  backLinkText = 'Voltar para o Início'
}: ErrorPageProps) {
  return (
    
    <div className="max-w-3xl mx-auto p-5 text-center">
      <div className="mt-[50px]">
        
        <div className="bg-white p-8 rounded-lg shadow-md inline-block w-full max-w-sm">
          <div className="text-5xl text-red-500 mb-4">
            &#x26A0; 
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Ocorreu um Erro
          </h1>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <Link
            to={backLink}
            className="inline-block bg-[#1a5276] text-white font-bold py-2 px-6 rounded hover:bg-[#0e3040] transition-colors"
          >
            {backLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
