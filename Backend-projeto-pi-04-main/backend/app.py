import traceback
import os
from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from functools import wraps
import re
import joblib
import pandas as pd

app = Flask(__name__)
app.config.update(
    SESSION_COOKIE_SAMESITE='None', 
    #para permitir que o Front converse com o back porque eles estão em URLs diferentes
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True
)

instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
os.makedirs(instance_path, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "usuarios.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'erlandsonsilvadonascimento')

CORS(app, supports_credentials=True, origins=["http://localhost:5173", "https://projeto-pi-04-1.onrender.com", "https://projeto-pi-04-c4je.onrender.com", "https://projeto-pi-04-1-7si2.onrender.com"])

db = SQLAlchemy(app)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    idade = db.Column(db.Integer)
    nome_mae = db.Column(db.String(100), nullable=False)
    data_prevista_parto = db.Column(db.Date, nullable=False)
    ultima_menstruacao = db.Column(db.Date, nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    cep = db.Column(db.String(8), nullable=False)
    cidade = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    cronograma = db.Column(db.JSON, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'cpf': self.cpf,
            'nome': self.nome,
            'data_nascimento': self.data_nascimento.strftime('%Y-%m-%d'),
            'idade': self.idade,
            'nome_mae': self.nome_mae,
            'data_prevista_parto': self.data_prevista_parto.strftime('%Y-%m-%d'),
            'ultima_menstruacao': self.ultima_menstruacao.strftime('%Y-%m-%d'),
            'endereco': self.endereco,
            'cep': self.cep,
            'cidade': self.cidade,
            'estado': self.estado,
            'telefone': self.telefone,
            'cronograma': self.cronograma,
        }

class SinaisVitais(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_cpf = db.Column(db.String(11), db.ForeignKey('usuario.cpf'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    batimentos_cardiacos = db.Column(db.Float)
    oxigenacao_sangue = db.Column(db.Float)
    pressao_sistolica = db.Column(db.Integer)
    pressao_diastolica = db.Column(db.Integer)

    usuario = db.relationship('Usuario', backref=db.backref('sinais_vitais', lazy=True))


def create_tables():
    with app.app_context():
        db.create_all()

create_tables()


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Acesso não autorizado'}), 401
        return f(*args, **kwargs)
    return decorated_function

def parse_date_flexible(date_string):
    formats_to_try = ['%Y-%m-%d', '%d/%m/%Y']
    for fmt in formats_to_try:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    raise ValueError(f"Formato de data inválido: '{date_string}'. Use AAAA-MM-DD ou DD/MM/AAAA.")

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Requisição inválida'}), 400
    username = os.getenv('APP_USERNAME', 'usuario')
    password = os.getenv('APP_PASSWORD', '123456')
    if data.get('username') == username and data.get('password') == password:
        session['user_id'] = data.get('username')
        return jsonify({'message': 'Login realizado com sucesso'}), 200
    else:
        return jsonify({'error': 'Usuário ou senha incorretos'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout realizado com sucesso'}), 200

@app.route('/api/status')
@login_required
def status():
    return jsonify({'message': 'Sessão ativa'}), 200

@app.route('/api/gestantes', methods=['POST'])
@login_required
def create_gestante():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    try:
        cpf_limpo = re.sub(r'\D', '', data.get('cpf', ''))
        if not cpf_limpo or len(cpf_limpo) != 11:
            return jsonify({'error': 'CPF inválido'}), 400
        if Usuario.query.filter_by(cpf=cpf_limpo).first():
            return jsonify({'error': 'CPF já cadastrado'}), 409
        data_nascimento = parse_date_flexible(data.get('data_nascimento'))
        idade = (datetime.now() - data_nascimento).days // 365
        novo_usuario = Usuario(
            cpf=cpf_limpo, nome=data.get('nome'), data_nascimento=data_nascimento,
            idade=idade, nome_mae=data.get('nome_mae'),
            data_prevista_parto=parse_date_flexible(data.get('data_prevista_parto')),
            ultima_menstruacao=parse_date_flexible(data.get('ultima_menstruacao')),
            endereco=data.get('endereco'), cep=data.get('cep'),
            cidade=data.get('cidade'), estado=data.get('estado'),
            telefone=data.get('telefone'), cronograma=data.get('cronograma')
        )
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify(novo_usuario.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro interno ao cadastrar', 'details': str(e)}), 500

@app.route('/api/gestantes', methods=['GET'])
@login_required
def get_all_gestantes():
    usuarios = Usuario.query.all()
    return jsonify([usuario.to_dict() for usuario in usuarios]), 200

@app.route('/api/gestantes/<cpf>', methods=['GET'])
@login_required
def get_gestante_by_cpf(cpf):
    cpf_limpo = re.sub(r'\D', '', cpf)
    usuario = Usuario.query.filter_by(cpf=cpf_limpo).first()
    if usuario:
        return jsonify(usuario.to_dict()), 200
    else:
        return jsonify({'error': 'Usuário não encontrado'}), 404

@app.route('/api/gestantes/<cpf>', methods=['PUT'])
@login_required
def update_gestante(cpf):
    cpf_limpo = re.sub(r'\D', '', cpf)
    usuario = Usuario.query.filter_by(cpf=cpf_limpo).first_or_404()
    data = request.get_json()

    # 1. Atualiza os dados de texto
    campos_texto = ['nome', 'nome_mae', 'endereco', 'cep', 'cidade', 'estado', 'telefone']
    for campo in campos_texto:
        if campo in data and data[campo] is not None:
            setattr(usuario, campo, data[campo])

    # 2. Atualiza as datas 
    try:
        if 'ultima_menstruacao' in data and data['ultima_menstruacao']:
            usuario.ultima_menstruacao = parse_date_flexible(data['ultima_menstruacao'])
        
        if 'data_prevista_parto' in data and data['data_prevista_parto']:
            usuario.data_prevista_parto = parse_date_flexible(data['data_prevista_parto'])
            
        if 'data_nascimento' in data and data['data_nascimento']:
            usuario.data_nascimento = parse_date_flexible(data['data_nascimento'])
            # Recalcula a idade se a data de nascimento mudar
            usuario.idade = (datetime.now() - usuario.data_nascimento).days // 365
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    # 3. Mantém a atualização do cronograma
    if 'cronograma' in data:
        usuario.cronograma = data['cronograma']

    # 4. Salva no banco de dados
    try:
        db.session.commit()
        return jsonify(usuario.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao atualizar no banco', 'details': str(e)}), 500

@app.route('/api/sinais-vitais/<cpf>', methods=['POST'])
@login_required
def adicionar_sinal_vital(cpf):
    data = request.get_json()
    if not data or 'batimentos' not in data or 'oxigenacao' not in data or 'pressao_sistolica' not in data or 'pressao_diastolica' not in data:
        return jsonify({'error': 'Dados incompletos'}), 400
    cpf_limpo = re.sub(r'\D', '', cpf)
    usuario = Usuario.query.filter_by(cpf=cpf_limpo).first()
    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    novo_sinal = SinaisVitais(
        usuario_cpf=cpf_limpo,
        batimentos_cardiacos=data['batimentos'],
        oxigenacao_sangue=data['oxigenacao'],
        pressao_sistolica=data['pressao_sistolica'],
        pressao_diastolica=data['pressao_diastolica']
    )
    db.session.add(novo_sinal)
    db.session.commit()
    return jsonify({'message': 'Dados recebidos com sucesso'}), 201

@app.route('/api/sinais-vitais/<cpf>', methods=['GET'])
@login_required
def obter_sinais_vitais(cpf):
    cpf_limpo = re.sub(r'\D', '', cpf)
    sinais = SinaisVitais.query.filter_by(usuario_cpf=cpf_limpo).order_by(SinaisVitais.timestamp.asc()).all()
    resultado = [{
        'timestamp': sinal.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'batimentos': sinal.batimentos_cardiacos,
        'oxigenacao': sinal.oxigenacao_sangue,
        'pressao_sistolica': sinal.pressao_sistolica,
        'pressao_diastolica': sinal.pressao_diastolica
    } for sinal in sinais]
    return jsonify(resultado), 200

@app.route('/api/sinais-vitais/<cpf>', methods=['DELETE'])
@login_required
def delete_sinais_vitais(cpf):
    """
    Apaga TODOS os registros de sinais vitais associados a um CPF.
    """
    cpf_limpo = re.sub(r'\D', '', cpf)

    usuario = Usuario.query.filter_by(cpf=cpf_limpo).first()
    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404

    try:
        num_registros_apagados = SinaisVitais.query.filter_by(usuario_cpf=cpf_limpo).delete()
        db.session.commit()

        if num_registros_apagados > 0:
            return jsonify({'message': f'{num_registros_apagados} registros de sinais vitais foram apagados com sucesso para o CPF {cpf_limpo}.'}), 200
        else:
            return jsonify({'error': 'Nenhum registro de sinais vitais encontrado para este CPF.'}), 404

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao deletar sinais vitais: {e}")
        return jsonify({'error': 'Erro interno ao apagar os registros.'}), 500

@app.route('/api/risco/<cpf>', methods=['GET'])
@login_required
def prever_risco(cpf):
    model_path = os.path.join(instance_path, 'risk_model.joblib')
    
    # Captura os sintomas enviados pelo Checklist do médico (0 ou 1)
    # Ex: /api/risco/12345678900?sangramento=1&cefaleia=0&edema=0
    sangramento = request.args.get('sangramento', 0, type=int)
    cefaleia = request.args.get('cefaleia', 0, type=int)
    edema = request.args.get('edema', 0, type=int)

    cpf_limpo = re.sub(r'\D', '', cpf)
    usuario = Usuario.query.filter_by(cpf=cpf_limpo).first()
    sinais = SinaisVitais.query.filter_by(usuario_cpf=cpf_limpo).order_by(SinaisVitais.timestamp.desc()).all()

    if not usuario or not sinais:
        return jsonify({'error': 'Dados insuficientes para fazer a predição.'}), 404
    
    ultimo_sinal = sinais[0]
    idade = usuario.idade

    # --- INÍCIO DO PROTOCOLO FERRAZ DE VASCONCELOS (Pág 25-26) ---
    pontos_ferraz = 0

    # 1. Pontuação por Sintomas (Dados do Checklist Médico)
    if sangramento: pontos_ferraz += 10  # Peso máximo no manual
    if cefaleia: pontos_ferraz += 5     # Sinal de pré-eclâmpsia
    if edema: pontos_ferraz += 1        # Sinal de alerta leve

    # 2. Pontuação por Sinais Vitais (Dados do Sensor/Simulador)
    if ultimo_sinal.pressao_sistolica >= 140 or ultimo_sinal.pressao_diastolica >= 90:
        pontos_ferraz += 10
    if ultimo_sinal.batimentos_cardiacos > 110:
        pontos_ferraz += 5
    if ultimo_sinal.oxigenacao_sangue < 94:
        pontos_ferraz += 10

    # 3. Pontuação por Idade (Fator Reprodutivo)
    if idade >= 40 or idade <= 15:
        pontos_ferraz += 5

    # --- CLASSIFICAÇÃO DE RISCO FINAL ---
    # Conforme o manual, pontos acumulados definem a urgência
    if pontos_ferraz >= 10:
        risco_final = "Alto"
    elif pontos_ferraz >= 5:
        risco_final = "Médio"
    else:
        risco_final = "Baixo"

    # Se o risco for baixo pelos pontos, ainda rodamos a IA para checar tendências
    metodo_usado = "Protocolo Clínico Ferraz 2025"
    
    if risco_final == "Baixo" and os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            sinais_df = pd.DataFrame([{
                'bat': s.batimentos_cardiacos, 'oxi': s.oxigenacao_sangue,
                'sis': s.pressao_sistolica, 'dia': s.pressao_diastolica
            } for s in sinais])

            dados_para_prever = pd.DataFrame([[
                idade, sinais_df['bat'].mean(), sinais_df['oxi'].mean(),
                sinais_df['sis'].mean(), sinais_df['dia'].mean()
            ]], columns=['idade', 'batimentos_avg', 'oxigenacao_avg', 'pressao_sistolica_avg', 'pressao_diastolica_avg'])
            
            dados_para_prever.columns = dados_para_prever.columns.astype(str)
            predicao = model.predict(dados_para_prever)
            
            if predicao[0] != "Baixo":
                risco_final = predicao[0]
                metodo_usado = "Machine Learning (Tendência Histórica)"
        except:
            pass # Se a IA falhar, mantemos o risco clínico por segurança

    return jsonify({
        'risco': risco_final,
        'pontuacao_total': pontos_ferraz,
        'metodo': metodo_usado,
        'detalhes': {
            'sangramento': bool(sangramento),
            'pressao': f"{ultimo_sinal.pressao_sistolica}/{ultimo_sinal.pressao_diastolica}"
        }
    }), 200

if __name__ == '__main__':
   port = int(os.environ.get("PORT", 5000))
   print("\n--- INSPECIONANDO ROTAS REGISTRADAS NO FLASK ---")
   app.run(host="0.0.0.0", port=port)

