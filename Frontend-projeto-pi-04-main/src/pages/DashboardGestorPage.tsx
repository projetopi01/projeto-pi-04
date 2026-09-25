import { useState, useEffect } from 'react';
import api from '../services/api';
import { UNIDADES } from '../types';

type Alerta = {
  cpf: string;
  nome: string;
  unidade: string;
  pontuacao: number;
  pressao: string;
  oxigenacao: number;
  batimentos: number;
  ultima_leitura: string;
};

type Indicadores = {
  total_gestantes: number;
  por_unidade: Record<string, number>;
  por_risco: Record<string, number>;
  gestantes_sem_afericao_30_dias: number;
  gestantes_sem_sinal_registrado: number;
  media_idade: number | null;
  alertas_alto_risco: Alerta[];
};

const COR = '#1a5276';
const TODAS = 'Todas as unidades';

function CardResumo({
  titulo,
  valor,
  legenda,
  cor,
}: {
  titulo: string;
  valor: string | number;
  legenda?: string;
  cor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {titulo}
      </div>
      <div className="mt-2 text-3xl font-black" style={{ color: cor }}>
        {valor}
      </div>
      {legenda && (
        <div className="mt-1 text-xs text-gray-400 font-medium">{legenda}</div>
      )}
    </div>
  );
}

export default function DashboardGestorPage() {
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroUnidade, setFiltroUnidade] = useState<string>(TODAS);

  useEffect(() => {
    let ativo = true;

    api
      .get<Indicadores>('/api/indicadores')
      .then((r) => {
        if (ativo) {
          setDados(r.data);
          setErro(null);
        }
      })
      .catch((e) => {
        if (ativo) {
          setErro(
            e?.response?.status === 401
              ? 'Sessão expirada. Faça login novamente.'
              : 'Não foi possível carregar os indicadores.'
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-widest">
            Carregando indicadores...
          </span>
        </div>
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-8 text-center">
        <div className="text-rose-500 font-bold">{erro || 'Sem dados.'}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 rounded-full font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: COR }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ---- FILTRO POR UNIDADE ----
  const filtrando = filtroUnidade !== TODAS;

  const unidadesDisponiveis: string[] = [
    ...UNIDADES.filter((u) => u in dados.por_unidade),
    ...Object.keys(dados.por_unidade).filter(
      (u) => !UNIDADES.includes(u) && u !== TODAS
    ),
  ];

  const porUnidade = filtrando
    ? { [filtroUnidade]: dados.por_unidade[filtroUnidade] || 0 }
    : dados.por_unidade;

  const alertas = filtrando
    ? dados.alertas_alto_risco.filter((a) => a.unidade === filtroUnidade)
    : dados.alertas_alto_risco;

  // Recalcula os totais sobre o recorte atual
  const totalGestantes = filtrando
    ? dados.por_unidade[filtroUnidade] || 0
    : dados.total_gestantes;

  const alto = alertas.length;
  const totalComSinal = filtrando
    ? Math.max(0, totalGestantes - dados.gestantes_sem_sinal_registrado)
    : Math.max(0, dados.total_gestantes - dados.gestantes_sem_sinal_registrado);
  const baixo = Math.max(0, totalComSinal - alto);

  const semAfericao = filtrando
    ? Math.min(dados.gestantes_sem_afericao_30_dias, totalGestantes)
    : dados.gestantes_sem_afericao_30_dias;

  const mediaIdade = filtrando ? '--' : (dados.media_idade ?? '--');

  const unidades = Object.entries(porUnidade).sort((a, b) => b[1] - a[1]);
  const maiorUnidade = unidades.length ? unidades[0][1] : 1;
  const totalRisco = alto + baixo || 1;

  return (
    <div className="flex flex-col gap-8">
      {/* CABECALHO DA PAGINA + SELETOR DE UNIDADE */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            Painel de Gestão
          </div>
          <h1
            className="text-2xl font-black uppercase tracking-tighter mt-1"
            style={{ color: COR }}
          >
            Indicadores do Pré-Natal
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Visão agregada das gestantes acompanhadas na rede.
          </p>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="filtroUnidade"
            className="mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
          >
            Filtrar por unidade
          </label>
          <select
            id="filtroUnidade"
            value={filtroUnidade}
            onChange={(e) => setFiltroUnidade(e.target.value)}
            className="p-3 pr-10 border-2 border-gray-100 rounded-xl outline-none transition-all focus:border-[#1a5276] focus:ring-4 focus:ring-blue-50 font-bold text-gray-700 bg-white min-w-[240px] cursor-pointer"
          >
            <option value={TODAS}>{TODAS}</option>
            {unidadesDisponiveis.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtrando && (
        <div className="text-xs font-bold text-[#1a5276] bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          Exibindo apenas: {filtroUnidade} — {totalGestantes} gestante(s) e {alto} alerta(s).
        </div>
      )}

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardResumo
          titulo="Gestantes"
          valor={totalGestantes}
          legenda={filtrando ? filtroUnidade : 'acompanhadas na rede'}
          cor={COR}
        />
        <CardResumo
          titulo="Alto risco"
          valor={alto}
          legenda="requerem avaliação"
          cor="#e11d48"
        />
        <CardResumo
          titulo="Sem aferição"
          valor={semAfericao}
          legenda="nos últimos 30 dias"
          cor="#f59e0b"
        />
        <CardResumo
          titulo="Idade média"
          valor={mediaIdade}
          legenda={filtrando ? 'geral da rede' : 'anos'}
          cor="#0f766e"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* POR UNIDADE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">
            {filtrando ? 'Gestantes nesta unidade' : 'Gestantes por unidade'}
          </div>
          <div className="flex flex-col gap-4">
            {unidades.map(([nome, qtd]) => (
              <div key={nome}>
                <div className="flex justify-between items-baseline mb-1 gap-3">
                  <span className="text-sm font-bold text-gray-600">{nome}</span>
                  <span className="text-sm font-black shrink-0" style={{ color: COR }}>
                    {qtd}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(qtd / maiorUnidade) * 100}%`,
                      backgroundColor: COR,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POR RISCO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">
            {filtrando ? 'Risco nesta unidade' : 'Distribuição de risco'}
          </div>

          <div className="flex h-3 rounded-full overflow-hidden mb-5">
            <div
              className="bg-rose-500"
              style={{ width: `${(alto / totalRisco) * 100}%` }}
            />
            <div
              className="bg-emerald-500"
              style={{ width: `${(baixo / totalRisco) * 100}%` }}
            />
          </div>

          <div className="flex flex-col gap-3">
            {[
              { nome: 'Alto', qtd: alto, cor: '#e11d48' },
              { nome: 'Demais', qtd: baixo, cor: '#10b981' },
            ].map((r) => (
              <div key={r.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: r.cor }}
                  />
                  <span className="text-sm font-bold text-gray-600">{r.nome}</span>
                </div>
                <span className="text-sm font-black" style={{ color: r.cor }}>
                  {r.qtd}
                </span>
              </div>
            ))}
          </div>

          {dados.gestantes_sem_sinal_registrado > 0 && !filtrando && (
            <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-400 font-medium">
              {dados.gestantes_sem_sinal_registrado} gestante(s) sem nenhum sinal
              registrado.
            </div>
          )}
        </div>
      </div>

      {/* ALERTAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Alertas de alto risco
            {filtrando ? ` — ${filtroUnidade}` : ''}
          </div>
          <span
            className="text-xs font-black px-3 py-1 rounded-full shrink-0"
            style={{ backgroundColor: '#fee2e2', color: '#e11d48' }}
          >
            {alertas.length}
          </span>
        </div>

        {alertas.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
            Nenhuma gestante em alto risco no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="text-left px-6 py-3">Gestante</th>
                  <th className="text-left px-4 py-3">Unidade</th>
                  <th className="text-center px-4 py-3">PA</th>
                  <th className="text-center px-4 py-3">SpO₂</th>
                  <th className="text-center px-4 py-3">BPM</th>
                  <th className="text-center px-6 py-3">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a) => (
                  <tr
                    key={a.cpf}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-700">{a.nome}</div>
                      <div className="text-xs text-gray-400">{a.cpf}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-medium">
                      {a.unidade}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">
                      {a.pressao}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">
                      {a.oxigenacao}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">
                      {a.batimentos}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-black"
                        style={{ backgroundColor: '#fee2e2', color: '#e11d48' }}
                      >
                        {a.pontuacao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

