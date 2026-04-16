import requests

# --- CONFIGURAÇÕES ---
# O ENDEREÇO MUDOU para 127.0.0.1 para garantir que funcione se o script 
# estiver sendo executado no MESMO computador do backend.
# Se estiver em outro computador, use o IP real: 'http://192.168.0.13:5000'
BACKEND_URL = 'http://127.0.0.1:5000' 
CPF_PARA_LIMPAR = '89865603055' # CPF da Marcela da Silva
USERNAME = 'usuario'
PASSWORD = '123456'
# ---------------------

def limpar_sinais_vitais(cpf):
    """
    Faz o login e envia a requisição DELETE para a rota de sinais vitais.
    """
    session = requests.Session()
    login_payload = {"username": USERNAME, "password": PASSWORD}
    
    print(f"Tentando fazer login em {BACKEND_URL}/api/login...")
    
    try:
        # 1. Login no backend para obter a sessão/cookie
        login_response = session.post(f"{BACKEND_URL}/api/login", json=login_payload)
        
        if login_response.status_code == 200:
            print("Login realizado com sucesso.")
            
            # 2. Envio da requisição DELETE
            url_delete = f"{BACKEND_URL}/api/sinais-vitais/{cpf}"
            print(f"Enviando requisição DELETE para {url_delete}...")
            
            delete_response = session.delete(url_delete)
            
            if delete_response.status_code == 200:
                print("\n✅ LIMPEZA DE DADOS CONCLUÍDA!")
                print(delete_response.json().get('message'))
            elif delete_response.status_code == 404:
                 print("\n⚠️ ALERTA:")
                 print("Usuário não encontrado ou já está sem registros.")
                 print(delete_response.json().get('error'))
            else:
                print(f"\n❌ ERRO ao apagar dados: {delete_response.status_code}")
                print(f"Detalhes: {delete_response.text}")
                
        else:
            print(f"\n❌ Falha no login: {login_response.text}")

    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ Erro de conexão: Verifique se o backend Flask está sendo executado em {BACKEND_URL}. Detalhes: {e}")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")


if __name__ == '__main__':
    limpar_sinais_vitais(CPF_PARA_LIMPAR)