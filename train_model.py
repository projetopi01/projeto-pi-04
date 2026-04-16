import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# --- Configuração ---
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, 'instance', 'usuarios.db')
engine = create_engine(f'sqlite:///{db_path}')
model_path = os.path.join(base_dir, 'instance', 'risk_model.joblib')

def prepare_data():
    """
    Lê os dados das tabelas de utilizadores e sinais vitais,
    combina-os e prepara para o treino.
    """
    try:
        usuarios_df = pd.read_sql_table('usuario', engine)
        sinais_vitais_df = pd.read_sql_table('sinais_vitais', engine)
    except Exception as e:
        print(f"Erro ao ler as tabelas da base de dados: {e}")
        return None

    if sinais_vitais_df.empty or usuarios_df.empty:
        print("Uma ou ambas as tabelas estão vazias. Não é possível treinar o modelo.")
        return None

    sinais_agg = sinais_vitais_df.groupby('usuario_cpf').agg(
        batimentos_avg=('batimentos_cardiacos', 'mean'),
        oxigenacao_avg=('oxigenacao_sangue', 'mean'),
        pressao_sistolica_avg=('pressao_sistolica', 'mean'),
        pressao_diastolica_avg=('pressao_diastolica', 'mean')
    ).reset_index()

    full_df = pd.merge(usuarios_df, sinais_agg, left_on='cpf', right_on='usuario_cpf')

    def assign_risk(row):
        score = 0
        if row['idade'] > 35:
            score += 1
        if row['batimentos_avg'] > 100 or row['batimentos_avg'] < 60:
            score += 1
        if row['oxigenacao_avg'] < 96:
            score += 2
        if row['pressao_sistolica_avg'] > 140 or row['pressao_diastolica_avg'] > 90:
            score += 2
        
        if score >= 4:
            return 'Alto'
        elif score >= 2:
            return 'Médio'
        else:
            return 'Baixo'

    full_df['risco'] = full_df.apply(assign_risk, axis=1)
    
    print("Dados preparados com sucesso. Amostra:")
    print(full_df[['cpf', 'idade', 'batimentos_avg', 'oxigenacao_avg', 'pressao_sistolica_avg', 'risco']].head())
    
    return full_df

def train_model():
    """
    Treina um modelo de classificação e salva-o num ficheiro.
    """
    df = prepare_data()
    
    if df is None or len(df) < 2:
        print(f"Treino cancelado devido a dados insuficientes (necessárias pelo menos 2 amostras, encontradas: {len(df) if df is not None else 0}).")
        return

    features = ['idade', 'batimentos_avg', 'oxigenacao_avg', 'pressao_sistolica_avg', 'pressao_diastolica_avg']
    target = 'risco'

    X = df[features]
    y = df[target]
    
    # --- BLOCO DE CORREÇÃO DEFINITIVO ---
    # Converte explicitamente cada nome de coluna para string, um por um.
    # Isso é mais robusto que o .astype(str) que falhou anteriormente.
    X.columns = [str(col) for col in X.columns]
    # --- FIM DO BLOCO ---

    if len(df) >= 5 and len(df[target].unique()) > 1:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        print("\nA treinar o modelo com divisão de dados para teste...")
    else:
        print("\nAviso: Poucos dados ou classes para dividir. O modelo será treinado com todos os dados.")
        X_train, y_train = X, y

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    if 'X_test' in locals():
        predictions = model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        print(f"\nAcurácia do modelo nos dados de teste: {accuracy:.2f}")

    joblib.dump(model, model_path)
    print(f"Modelo treinado e salvo com sucesso em: {model_path}")


if __name__ == '__main__':
    train_model()
