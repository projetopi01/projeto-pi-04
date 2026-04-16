<h1 align="center">
  Rede Cegonha: Sistema de Acompanhamento Pré-Natal
</h1>

<blockquote align="center">"Cuidar do início da vida é construir um futuro saudável e promissor."</blockquote>
<br>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-funcionalidades">Funcionalidades</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-estrutura-do-projeto">Estrutura</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-como-executar">Como Executar</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-desenvolvedores">Desenvolvedores</a>
</p>

---

## 📋 Sobre o Projeto

O **Rede Cegonha** é um sistema web para o acompanhamento pré-natal de gestantes. O projeto consiste em uma **API RESTful robusta** (Backend) e uma **interface de usuário moderna, reativa e responsiva** (Frontend), ambas separadas em repositórios distintos dentro desta monorepo.

**Objetivos:**

- Facilitar o acompanhamento médico do pré-natal
- Gerenciar consultas e exames de gestantes
- Integração com dados de sensores Arduino para monitoramento em tempo real
- Prever riscos gestacionais através de machine learning

---

## ✨ Funcionalidades Principais

- **Autenticação de usuário** segura baseada em sessão
- **Cadastro completo e busca** de gestantes por CPF
- **Cronograma pré-natal interativo** para gerenciar consultas e exames com status editáveis
- **Cálculo de semanas de gestação** automático
- **Preenchimento automático de endereço** via CEP (API ViaCEP)
- **Testes automatizados** robustos para garantir qualidade
- **Integração com Arduino** para coleta de dados biométricos
- **Análise de riscos gestacionais** com machine learning

---

## 🛠️ Tecnologias

### Backend (API)

- **Linguagem:** Python 3
- **Framework:** Flask
- **Banco de Dados:** SQLAlchemy com SQLite
- **Autenticação:** Sessão (Cookies)
- **Comunicação:** Flask-CORS
- **Testes:** Pytest
- **Hardware:** Arduino para coleta de dados biométricos

### Frontend (Interface)

- **Framework:** React com TypeScript
- **Build Tool:** Vite
- **Estilização:** Tailwind CSS
- **Roteamento:** React Router DOM
- **Cliente HTTP:** Axios
- **Testes:** Vitest + React Testing Library

---

## 📁 Estrutura do Projeto

```
projeto-pi-04/
├── Backend-projeto-pi-04-main/          # API RESTful em Flask
│   ├── backend/
│   │   ├── api.py                       # Rotas da API
│   │   ├── app.py                       # Aplicação principal
│   │   ├── models.py                    # Modelos do banco de dados
│   │   ├── train_model.py               # Treinamento do modelo ML
│   │   ├── simulador_arduino.py         # Simulador de dados Arduino
│   │   ├── requirements.txt             # Dependências Python
│   │   └── instance/
│   │       └── risk_model.joblib        # Modelo treinado
│   └── README.md                        # Documentação do Backend
│
├── Frontend-projeto-pi-04-main/         # Interface em React + TypeScript
│   ├── src/
│   │   ├── components/                  # Componentes React
│   │   ├── pages/                       # Páginas da aplicação
│   │   ├── services/                    # Serviços de API
│   │   ├── contexts/                    # Contextos React
│   │   └── App.tsx                      # Componente principal
│   ├── package.json                     # Dependências Node.js
│   ├── tsconfig.json                    # Configuração TypeScript
│   ├── tailwind.config.js               # Configuração Tailwind CSS
│   ├── vite.config.ts                   # Configuração Vite
│   └── README.md                        # Documentação do Frontend
│
└── README.md                            # Este arquivo (documentação geral)
```

### Separação Frontend e Backend

O projeto foi dividido em **duas estruturas independentes**:

- **Backend** (`Backend-projeto-pi-04-main/`): Contém toda a lógica de negócio, API REST, banco de dados e integração com Arduino
- **Frontend** (`Frontend-projeto-pi-04-main/`): Interface de usuário interativa que se comunica com o Backend via API REST

Ambas as partes precisam estar rodando simultaneamente para a aplicação completa funcionar.

**Observação:** Para um maior detalhamento do Frontend e do Backend (configurações, scripts, rotas e documentação específica), consulte os README.md disponíveis em:

- Frontend-projeto-pi-04-main/README.md
- Backend-projeto-pi-04-main/README.md

Cada README contém instruções e informações detalhadas sobre sua respectiva frente.

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Python](https://www.python.org/) (versão 3.8 ou superior)
- [Git](https://git-scm.com/)

---

### 0️⃣ Clonar o Repositório

Primeiro, clone o repositório do GitHub:

```bash
# Clone o repositório
git clone https://github.com/CamilaVerso/projeto-pi-04.git

# Acesse a pasta do projeto
cd projeto-pi-04
```

Você terá a seguinte estrutura:

```
projeto-pi-04/
├── Backend-projeto-pi-04-main/
├── Frontend-projeto-pi-04-main/
└── README.md
```

---

### 1️⃣ Executar o Backend (API)

Abra um **primeiro terminal**:

```bash
# Acesse a pasta do backend
cd Backend-projeto-pi-04-main/backend

# Crie e ative o ambiente virtual
python -m venv venv

# No Windows (Git Bash):
source venv/Scripts/activate
# No Mac/Linux:
# source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor
python app.py
# ou
flask run --debug
```

✅ O backend estará rodando em `http://localhost:5000`

---

### 2️⃣ Executar o Frontend (Cliente)

Abra um **segundo terminal** (separado):

```bash
# Acesse a pasta do frontend
cd Frontend-projeto-pi-04-main

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

✅ O frontend estará acessível em `http://localhost:5173`

---

### 3️⃣ Testes

**Testes do Frontend:**

```bash
cd Frontend-projeto-pi-04-main

# Rodar testes uma vez
npm test

# Rodar testes com interface gráfica
npm run test:ui
```

**Testes do Backend:**

```bash
cd Backend-projeto-pi-04-main/backend

# Rodar testes com pytest
pytest
```

---

## 🔌 Integração com Arduino

### Com Arduino Físico

Para trabalhar com dados reais do Arduino:

1. **Conecte o Arduino** ao computador via porta USB
2. **Use a branch `arduino-integration`**:
   ```bash
   git checkout arduino-integration
   ```
3. **Configure a porta serial** no arquivo `simulador_arduino.py`
4. **Inicie a coleta de dados** executando o script apropriado

### Simulação de Dados (sem Arduino Físico)

Mesmo sem possuir um Arduino, é possível verificar o funcionamento completo do sistema através da simulação de dados biométricos:

1. **Inicie o simulador de Arduino**:

   ```bash
   cd Backend-projeto-pi-04-main/backend
   python simulador_arduino.py
   ```

   Este script gerará dados simulados de sinais vitais (frequência cardíaca, pressão arterial, etc.) que serão armazenados no banco de dados.

2. **Limpar dados do simulador**:
   Se precisar apagar os dados de sinais vitais gerados pelo simulador, execute:
   ```bash
   cd Backend-projeto-pi-04-main/backend
   python delete_data.py
   ```
   Este script remove todos os registros de sinais vitais simulados da base de dados.

---

## 📊 Branching Strategy

- **`main`**: Branch de produção, estável
- **`arduino-integration`**: Branch para integração com Arduino e dados reais

---

## 👥 Desenvolvedores

| Aluno                            | RA       |
| -------------------------------- | -------- |
| Adriano Alves do Nascimento      | 2230506  |
| Camila Nazare Pereira Gonçalves  | 23208252 |
| Erlandson Silva do Nascimento    | 2204739  |
| Fernando Caires Borges Goncalves | 23203515 |
| Klayton Rodrigues de Souza       | 2204509  |
| Marcia Alves Rodrigues da Silva  | 2201297  |
| Vinicius Torres Novaes           | 2214439  |
| Willians Soares de Souza         | 2229831  |

---

## 📝 Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE.MD` para mais detalhes.

---

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do GitHub.

---

<p align="center">
  Desenvolvido com ❤️ pelo grupo de desenvolvimento
</p>
