import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import PregnantRegisterPage from './pages/PregnantRegisterPage';
import SuccessPage from './pages/SuccessPage';
import ErrorPage from './pages/ErrorPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
        
          <Route path="/login" element={<LoginPage />} />   

           <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PregnantRegisterPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/sucesso" element={<SuccessPage />} />
          
          <Route 
            path="*" 
            element={
              <ErrorPage
                message="A página que você está procurando não foi encontrada."
                backLink="/"
                backLinkText="Voltar para a Página de Registro"
              />
            } 
          />
          
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;