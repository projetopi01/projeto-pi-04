from flask import Blueprint, jsonify, request
from models import db, Gestante

api_bp = Blueprint('api', __name__, url_prefix='/api')

# =========================
# LOGIN
# =========================
@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    usuario = data.get("usuario")
    senha = data.get("senha")

    # LOGIN SIMPLES (trocar depois por banco se quiser)
    if usuario == "admin" and senha == "123":
        return jsonify({
            "success": True,
            "message": "Login realizado com sucesso"
        })

    return jsonify({
        "success": False,
        "message": "Usuário ou senha inválidos"
    }), 401


# =========================
# LISTAR GESTANTES
# =========================
@api_bp.route('/gestantes', methods=['GET'])
def get_gestantes():
    gestantes = Gestante.query.all()

    gestantes_lista = [
        {
            "id": gestante.id,
            "cpf": gestante.cpf,
            "nome": gestante.nome,
            "data_nascimento": gestante.data_nascimento.strftime('%Y-%m-%d') if gestante.data_nascimento else None,
            "idade": gestante.idade,
            "nome_mae": gestante.nome_mae,
            "data_prevista_parto": gestante.data_prevista_parto.strftime('%Y-%m-%d') if gestante.data_prevista_parto else None,
            "ultima_menstruacao": gestante.ultima_menstruacao.strftime('%Y-%m-%d') if gestante.ultima_menstruacao else None,
            "endereco": gestante.endereco,
            "cep": gestante.cep,
            "cidade": gestante.cidade,
            "estado": gestante.estado,
            "telefone": gestante.telefone
        }
        for gestante in gestantes
    ]

    return jsonify(gestantes_lista)
