import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'; 
import api from '../services/api';

function LoginPage() {
 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

 const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const payload = {
      username: username,
      password: password,
    };

    await api.post('/api/login', payload);

    login();
    navigate('/');

  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      setError(err.response.data.error || 'Ocorreu um erro.');
    } else {
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto p-5 text-center">
      <div className="mt-[50px]">
        <h2 className="text-[#1a5276] text-2xl font-bold mb-5">
          Página de Login
        </h2>
        
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-5 rounded-lg shadow-md inline-block w-full max-w-sm text-left"
        >
          <div className="mb-5">
            <label htmlFor="username" className="font-bold text-sm text-[#333]">
              Usuário:
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-2 mt-1 border border-gray-300 rounded text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading} 
            />
          </div>
          
         
          <div className="mb-5">
            <label htmlFor="password" className="font-bold text-sm text-[#333]">
              Senha:
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 mt-1 border border-gray-300 rounded text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading} 
            />
          </div>
          
          
          <button 
            type="submit" 
            className="w-full bg-[#1a5276] text-white border-none rounded py-2.5 px-4 cursor-pointer text-base hover:bg-[#0e3040] transition-colors disabled:bg-gray-400"
            disabled={isLoading} 
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;