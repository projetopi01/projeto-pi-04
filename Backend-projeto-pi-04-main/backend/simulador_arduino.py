import requests
import time
import random

BACKEND_URL = 'http://localhost:5000'
CPF_GESTA_TESTE = '89865603055' # Mude para um CPF válido da sua base de dados

def enviar_dados_vitais(cpf, batimentos, oxigenacao, pressao_sistolica, pressao_diastolica):
    url = f"{BACKEND_URL}/api/sinais-vitais/{cpf}"
    payload = {
        "batimentos": batimentos,
        "oxigenacao": oxigenacao,
        "pressao_sistolica": pressao_sistolica,
        "pressao_diastolica": pressao_diastolica
    }
    try:
        session = requests.Session()
        login_payload = {"username": "usuario", "password": "123456"}
        login_response = session.post(f"{BACKEND_URL}/api/login", json=login_payload)
        
        if login_response.status_code == 200:
            print("Login do simulador bem-sucedido!")
            response = session.post(url, json=payload)
            if response.status_code == 201:
                print(f"Dados enviados com sucesso para o CPF {cpf}: {payload}")
            else:
                print(f"Erro ao enviar dados: {response.status_code} - {response.text}")
        else:
            print(f"Falha no login do simulador: {login_response.text}")
    except requests.exceptions.ConnectionError as e:
        print(f"Erro de conexão: Verifique se o backend Flask está a ser executado. Detalhes: {e}")

if __name__ == '__main__':
    if CPF_GESTA_TESTE == '12345678900':
        print("!!! ATENÇÃO: Por favor, abra o ficheiro 'simulador_arduino.py' e altere a variável 'CPF_GESTA_TESTE' para um CPF válido da sua base de dados antes de o executar. !!!")
    else:
        while True:
            batimentos_simulados = random.uniform(70.0, 110.0)
            oxigenacao_simulada = random.uniform(95.0, 99.5)
            # Simula pressão arterial (sistólica/diastólica)
            pressao_sistolica_simulada = random.randint(110, 140)
            pressao_diastolica_simulada = random.randint(70, 90)

            enviar_dados_vitais(
                CPF_GESTA_TESTE,
                round(batimentos_simulados, 2),
                round(oxigenacao_simulada, 2),
                pressao_sistolica_simulada,
                pressao_diastolica_simulada
            )
            
            print("A aguardar 10 segundos para a próxima leitura...")
            time.sleep(10)

