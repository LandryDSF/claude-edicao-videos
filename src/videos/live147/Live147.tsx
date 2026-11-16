import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Montserrat';
import type {ZonaRosto} from '../../_shared/enquadramento';
import {
  CameraCard,
  type LayoutCamera,
  type Retangulo,
  layoutCard,
  layoutCheio,
  misturarLayouts,
  painelEntrando,
  painelSaindo,
} from '../../_shared/split-vertical';
import {PALAVRAS} from './palavras';

// 002.LIVE147 — Reels de divulgação da Live #147: colunas computadas e índices.
// Estilo Chamada Azul adaptado para live. Plano: projetos/002.LIVE147/plano.md. Estrutura herdada do 001.ADv004.

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});
const MONO = 'Consolas, "Cascadia Mono", "Courier New", monospace';

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const DURACAO = 4332; // quadros do master (72,214 s)

const PASTA = '002.LIVE147';
const MASTER = staticFile(`${PASTA}/video/Live 147 - Ori.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

const COR = {fundo: '#0A0A0A', azul: '#2EA3F2', amarelo: '#F5B800', branco: '#FFFFFF', cinza: '#9AA4AE', vermelho: '#FF3B30', verde: '#3DDC84'};
// Cores do editor do SSMS (tema claro), para os painéis de código combinarem com o print.
const SQL = {fundo: '#FFFFFF', chave: '#0000FF', funcao: '#FF00FF', texto: '#000000', nulo: '#808080', str: '#FF0000', linha: '#2B91AF'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
// Gravação ao ar livre (fundo claro): tudo que fica sobre a câmera cheia vai em fundo sólido.
const VEU = 'rgba(10,10,10,.84)';

// Zona do rosto medida em projetos/002.LIVE147/frames/sheet_rosto.jpg (1 quadro por segundo, vídeo inteiro).
const ROSTO: ZonaRosto = {x0: 260, y0: 500, x1: 820, y1: 1100};

// ---------- Layouts ----------
const PAINEL: Retangulo = {x: 30, y: 230, w: 1020, h: 640, r: 32};
const CARD_SPLIT: Retangulo = {x: 30, y: 1000, w: 1020, h: 880, r: 36};
const CARD_VERT: Retangulo = {x: 250, y: 1000, w: 580, h: 760, r: 36};
const CARD_MINI: Retangulo = {x: 40, y: 1320, w: 340, h: 420, r: 28};
const SPLIT = layoutCard(CARD_SPLIT, ROSTO, W, H);
const VERT = layoutCard(CARD_VERT, ROSTO, W, H);
const MINI = layoutCard(CARD_MINI, ROSTO, W, H);

type Tipo = 'cheio' | 'split' | 'vert' | 'mini';
type Cena = {ini: number; fim: number; tipo: Tipo; trans: number; zoom?: (t: number) => number};

const rampa = (t: number, pts: [number, number][]) =>
  interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {...clamp, easing: suave});

// Cortes do CapCut: 6,63 · 10,57 · 17,20 · 27,80 · 35,70 · 37,10 · 45,67 · 63,07.
const CENAS: Cena[] = [
  // 0 · gancho; punch-in seco em "melhorar" (2,85)
  {ini: 0, fim: 6.63, tipo: 'cheio', trans: 0, zoom: (t) => (t < 2.85 ? rampa(t, [[0, 1], [2.85, 1.03]]) : rampa(t, [[2.85, 1.08], [6.63, 1.1]]))},
  // 1 · o problema em código: WHERE com expressão, índice não aproveitado
  {ini: 6.63, fim: 17.23, tipo: 'split', trans: 1.0},
  // 2 · recurso pouco explorado; punch-in seco em "pouco" (18,83)
  {ini: 17.23, fim: 23.67, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 18.83 ? 1 : rampa(t, [[18.83, 1.07], [23.67, 1.09]]))},
  // 3 · SSMS: coluna calculada (computed column)
  {ini: 23.67, fim: 27.73, tipo: 'mini', trans: 0.9},
  // 4 · "o mais interessante"
  {ini: 27.73, fim: 29.97, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[28.4, 1], [29.97, 1.04]])},
  // 5 · CREATE INDEX sobre a coluna computada, sem PERSISTED
  {ini: 29.97, fim: 37.21, tipo: 'split', trans: 1.0},
  // 6 · "quer entender na prática?"; punch-in seco em "prática" (39,61)
  {ini: 37.21, fim: 40.55, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 39.61 ? rampa(t, [[37.9, 1], [39.61, 1.03]]) : 1.09)},
  // 7 · cartão da live: terça, 17/11, 20h, gratuita
  {ini: 40.55, fim: 47.39, tipo: 'split', trans: 1.0},
  // 8 · pauta (troca de painel, câmera parada)
  {ini: 47.39, fim: 54.25, tipo: 'split', trans: 0.3},
  // 9 · pauta continua; câmera muda para card vertical
  {ini: 54.25, fim: 58.75, tipo: 'vert', trans: 0.9},
  // 10 · SSMS inteiro: hands-on
  {ini: 58.75, fim: 63.35, tipo: 'mini', trans: 0.9},
  // 11 · CTA
  {ini: 63.35, fim: 71.23, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[64.2, 1], [71.23, 1.05]])},
  // 12 · fecho; punch-in seco em "Espero"
  {ini: 71.23, fim: 99, tipo: 'cheio', trans: 0.12, zoom: () => 1.1},
];

const layoutDe = (c: Cena, t: number): LayoutCamera =>
  c.tipo === 'split' ? SPLIT : c.tipo === 'vert' ? VERT : c.tipo === 'mini' ? MINI : layoutCheio(W, H, ROSTO, c.zoom ? c.zoom(t) : 1);

const estado = (t: number) => {
  const i = Math.max(0, CENAS.findIndex((c) => t >= c.ini && t < c.fim));
  const c = CENAS[i];
  const p = c.trans > 0 && i > 0 ? interpolate(t, [c.ini, c.ini + c.trans], [0, 1], {...clamp, easing: suave}) : 1;
  const layout = p < 1 ? misturarLayouts(layoutDe(CENAS[i - 1], c.ini), layoutDe(c, t), p) : layoutDe(c, t);
  const div = (k: Tipo) => (k === 'cheio' ? 0 : 1);
  const dividido = i > 0 ? div(CENAS[i - 1].tipo) + (div(c.tipo) - div(CENAS[i - 1].tipo)) * p : 0;
  return {i, cena: c, p, layout, dividido};
};

// Visibilidade de um painel que vai da cena `de` até a cena `ate` (inclusive).
const visPainel = (t: number, de: number, ate = de) => {
  const c = CENAS[de];
  const prox = CENAS[ate + 1];
  const pIn = interpolate(t, [c.ini, c.ini + c.trans], [0, 1], {...clamp, easing: suave});
  const pOut = prox ? interpolate(t, [prox.ini, prox.ini + prox.trans], [0, 1], {...clamp, easing: suave}) : 0;
  if (t < c.ini || (prox && t > prox.ini + prox.trans)) return 0;
  return painelEntrando(pIn) * (pOut > 0 ? painelSaindo(pOut) : 1);
};

const visFundo = (t: number, indice: number) => {
  const c = CENAS[indice];
  return Math.min(interpolate(t, [c.ini, c.ini + 12 / FPS], [0, 1], clamp), interpolate(t, [c.fim, c.fim + 0.3], [1, 0], clamp));
};

// ---------- Peças ----------
const Deslocamento = React.createContext(0);
const useQuadro = () => useCurrentFrame() + React.useContext(Deslocamento);
const useT = () => {
  const frame = useQuadro();
  const {fps} = useVideoConfig();
  return frame / fps;
};
const Trecho: React.FC<{de: number; dur?: number; children: React.ReactNode}> = ({de, dur, children}) => {
  const from = Math.round(de * FPS);
  return (
    <Sequence from={from} durationInFrames={dur ? Math.round(dur * FPS) : undefined} premountFor={FPS}>
      <Deslocamento.Provider value={from}>{children}</Deslocamento.Provider>
    </Sequence>
  );
};

const useMola = (t0: number, t1 = 999, saida = 0.25) => {
  const frame = useQuadro();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spring({frame: frame - t0 * fps, fps, config: {damping: 15, stiffness: 170}});
  const out = interpolate(t, [t1, t1 + saida], [1, 0], clamp);
  return {s, op: Math.min(1, s * 1.4) * out, ativo: t >= t0 && t <= t1 + saida};
};

const Pilula: React.FC<{
  t0: number;
  t1?: number;
  x: number;
  y: number;
  fundo?: string;
  cor?: string;
  tamanho?: number;
  centro?: boolean;
  rot?: number;
  borda?: boolean;
  children: React.ReactNode;
}> = ({t0, t1, x, y, fundo = COR.azul, cor = COR.branco, tamanho = 44, centro = false, rot = 0, borda = false, children}) => {
  const {s, op, ativo} = useMola(t0, t1);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y,
        transform: `${centro ? 'translateX(-50%) ' : ''}translateY(${(1 - s) * 30}px) scale(${0.85 + 0.15 * s}) rotate(${rot}deg)`,
        opacity: op, background: fundo, color: cor, fontWeight: 800, fontSize: tamanho,
        padding: `${tamanho * 0.3}px ${tamanho * 0.65}px`, borderRadius: 999, whiteSpace: 'nowrap',
        boxShadow: '0 12px 40px rgba(0,0,0,.45)', border: borda ? `2px solid ${COR.azul}` : undefined, letterSpacing: 1,
        display: 'flex', alignItems: 'center', gap: tamanho * 0.35,
      }}
    >
      {children}
    </div>
  );
};

// Título acima da cabeça, numa caixa escura (o fundo da gravação é claro).
const Titulo: React.FC<{t0: number; t1?: number; top: number; tamanho?: number; children: React.ReactNode}> = ({
  t0, t1, top, tamanho = 84, children,
}) => {
  const m = useMola(t0, t1);
  if (!m.ativo) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: m.op, transform: `scale(${0.8 + 0.2 * m.s})`}}>
      <div
        style={{
          background: VEU, color: COR.branco, fontWeight: 800, fontSize: tamanho, lineHeight: 1, padding: `${tamanho * 0.28}px ${tamanho * 0.45}px`,
          borderRadius: tamanho * 0.32, whiteSpace: 'nowrap', boxShadow: '0 16px 50px rgba(0,0,0,.45)', border: '2px solid rgba(46,163,242,.55)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Aparece: React.FC<{t0: number; children: React.ReactNode; cor?: string}> = ({t0, children, cor}) => {
  const m = useMola(t0);
  if (!m.ativo) return null;
  return <span style={{display: 'inline-block', color: cor, opacity: m.op, transform: `translateY(${(1 - m.s) * 24}px)`}}>{children}</span>;
};

// Contorno azul que se desenha em volta de um trecho de código.
const Contorno: React.FC<{t0: number; x: number; y: number; w: number; h: number}> = ({t0, x, y, w, h}) => {
  const t = useT();
  const p = interpolate(t, [t0, t0 + 0.35], [0, 1], {...clamp, easing: suave});
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 8, border: `4px solid ${COR.azul}`,
        boxShadow: `0 0 ${18 * p}px ${COR.azul}, inset 0 0 0 999px rgba(46,163,242,.12)`, opacity: p,
        transform: `scale(${1.15 - 0.15 * p})`, transformOrigin: 'left center',
      }}
    />
  );
};

const Painel: React.FC<{vis: number; children: React.ReactNode; fundo?: string}> = ({vis, children, fundo = '#111418'}) => {
  if (vis <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute', left: PAINEL.x, top: PAINEL.y, width: PAINEL.w, height: PAINEL.h, borderRadius: PAINEL.r,
        overflow: 'hidden', background: fundo, opacity: vis, transform: `translateY(${(1 - vis) * -40}px) scale(${0.96 + 0.04 * vis})`,
        boxShadow: '0 24px 70px rgba(0,0,0,.6), 0 0 0 2px rgba(46,163,242,.35)',
      }}
    >
      {children}
    </div>
  );
};

// Ponto vermelho pulsando + "AO VIVO".
const AoVivo: React.FC<{tamanho?: number}> = ({tamanho = 34}) => {
  const t = useT();
  const pisca = 0.5 + 0.5 * Math.abs(Math.sin(t * Math.PI * 1.4));
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: tamanho * 0.4, color: COR.branco, fontWeight: 800, fontSize: tamanho, letterSpacing: 2}}>
      <span style={{width: tamanho * 0.62, height: tamanho * 0.62, borderRadius: 999, background: COR.vermelho, opacity: pisca, boxShadow: `0 0 ${16 * pisca}px ${COR.vermelho}`}} />
      AO VIVO
    </span>
  );
};

const Sino: React.FC<{tamanho: number; cor: string}> = ({tamanho, cor}) => {
  const t = useT();
  const giro = Math.sin(t * Math.PI * 6) * 14 * Math.max(0, Math.sin(t * Math.PI * 0.8));
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{transform: `rotate(${giro}deg)`, transformOrigin: '50% 10%'}}>
      <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v.6A6.5 6.5 0 0 1 18.5 10.5v4.2l1.8 2.6a.8.8 0 0 1-.7 1.2H4.4a.8.8 0 0 1-.7-1.2l1.8-2.6v-4.2a6.5 6.5 0 0 1 5-6.4v-.6A1.5 1.5 0 0 1 12 2zm-2.5 17.5h5a2.5 2.5 0 0 1-5 0z" fill={cor} />
    </svg>
  );
};

// ---------- Código no estilo do SSMS ----------
type Tok = [string, keyof typeof SQL];
const Linha: React.FC<{n: number; toks: Tok[]; t0: number; tam: number; digitar?: number}> = ({n, toks, t0, tam, digitar}) => {
  const t = useT();
  const m = useMola(t0);
  if (!m.ativo) return null;
  const total = toks.reduce((a, [s]) => a + s.length, 0);
  let resto = digitar ? Math.floor(interpolate(t, [t0, t0 + digitar], [0, total], clamp)) : total;
  return (
    <div style={{display: 'flex', fontFamily: MONO, fontSize: tam, lineHeight: 1.45, whiteSpace: 'pre', opacity: digitar ? 1 : m.op, transform: digitar ? undefined : `translateX(${(1 - m.s) * -20}px)`}}>
      <span style={{color: SQL.linha, width: tam * 1.5, textAlign: 'right', marginRight: tam * 0.8}}>{n}</span>
      {toks.map(([s, c], i) => {
        const vis = s.slice(0, Math.max(0, resto));
        resto -= s.length;
        return (
          <span key={i} style={{color: SQL[c]}}>
            {vis}
          </span>
        );
      })}
    </div>
  );
};

const Editor: React.FC<{children: React.ReactNode; aba: string}> = ({children, aba}) => (
  <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 300, background: SQL.fundo}}>
    <div style={{height: 52, background: '#EEEEF2', display: 'flex', alignItems: 'flex-end', paddingLeft: 20}}>
      <div style={{background: '#68217A', color: COR.branco, fontFamily: 'Segoe UI, sans-serif', fontWeight: 700, fontSize: 24, padding: '8px 22px', borderRadius: '6px 6px 0 0'}}>
        {aba}
      </div>
    </div>
    <div style={{position: 'relative', padding: '22px 30px'}}>{children}</div>
  </div>
);

// ---------- Cenas sobre a câmera cheia ----------
const useCheio = (indice: number) => {
  const t = useT();
  const prox = CENAS[indice + 1];
  return prox ? interpolate(t, [prox.ini, prox.ini + Math.max(prox.trans * 0.4, 0.05)], [1, 0], clamp) : 1;
};

// MCT só aqui, como identificação.
const Abertura: React.FC = () => {
  const t = useT();
  const vis = useCheio(0);
  const mct = useMola(0.11, 2.55, 0.3);
  const halo = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.6);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={1.39} top={300} tamanho={72}>
        COLUNA <Aparece t0={1.85} cor={COR.azul}>COMPUTADA</Aparece>
      </Titulo>
      {mct.ativo && (
        <div
          style={{
            position: 'absolute', left: W / 2 - 180, top: 1060, width: 360, height: 360, opacity: mct.op,
            transform: `translateY(${(1 - mct.s) * 60}px) scale(${(0.6 + 0.4 * mct.s) * (1 + 0.025 * halo)})`,
            filter: `drop-shadow(0 0 ${20 + 24 * halo}px rgba(46,163,242,.7))`,
          }}
        >
          <Img src={img('MCT.png')} style={{width: 360, height: 360}} />
        </div>
      )}
      <Pilula t0={2.85} x={W / 2} y={1170} centro tamanho={60}>
        <span style={{fontSize: 70}}>↑</span> PERFORMANCE
      </Pilula>
      <Pilula t0={5.69} x={W / 2} y={1310} centro tamanho={46} fundo={VEU} borda>
        no seu <span style={{color: COR.azul}}>SQL Server</span>
      </Pilula>
    </AbsoluteFill>
  );
};

const Recurso: React.FC = () => {
  const vis = useCheio(2);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={18.25} top={300} tamanho={58}>
        RECURSO <Aparece t0={18.83} cor={COR.azul}>POUCO EXPLORADO</Aparece>
      </Titulo>
      <Pilula t0={20.55} t1={22.2} x={W / 2} y={1180} centro tamanho={48} fundo={VEU} borda>
        você pode usar
      </Pilula>
      <Pilula t0={22.41} x={W / 2} y={1180} centro tamanho={52}>
        ✓ RESOLVE O PROBLEMA
      </Pilula>
    </AbsoluteFill>
  );
};

const Interessante: React.FC = () => {
  const vis = useCheio(4);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={28.37} top={300} tamanho={66}>
        O MAIS <span style={{color: COR.azul}}>INTERESSANTE</span>
      </Titulo>
    </AbsoluteFill>
  );
};

const Pratica: React.FC = () => {
  const vis = useCheio(6);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={37.77} t1={39.45} top={300} tamanho={70}>
        QUER ENTENDER?
      </Titulo>
      <Titulo t0={39.61} top={290} tamanho={100}>
        NA <span style={{color: COR.azul}}>PRÁTICA?</span>
      </Titulo>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const vis = useCheio(11);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={63.97} t1={70.1} top={300} tamanho={64}>
        TER · <span style={{color: COR.azul}}>17/NOV</span> · 20h
      </Titulo>
      <Titulo t0={70.33} top={300} tamanho={72}>
        AULA <span style={{color: COR.azul}}>GRATUITA</span>
      </Titulo>
      <Pilula t0={64.79} t1={66.8} x={W / 2} y={1160} centro tamanho={66} fundo={COR.amarelo} cor="#111">
        LINK NO PERFIL
      </Pilula>
      <Pilula t0={66.97} x={W / 2} y={1160} centro tamanho={58} fundo={COR.amarelo} cor="#111">
        <Sino tamanho={64} cor="#111" /> ATIVE O LEMBRETE
      </Pilula>
      <Pilula t0={68.31} x={W / 2} y={1290} centro tamanho={44} fundo={VEU} borda>
        da live no <span style={{color: COR.branco}}>YouTube</span>
      </Pilula>
    </AbsoluteFill>
  );
};

// Fecho: o cartão da live volta compacto no peito (sem MCT).
const Fecho: React.FC = () => {
  const m = useMola(71.23);
  if (!m.ativo) return null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', opacity: m.op, transform: `scale(${0.8 + 0.2 * m.s})`}}>
        <div
          style={{
            background: VEU, borderRadius: 32, border: `3px solid ${COR.azul}`, padding: '24px 44px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12, boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          }}
        >
          <AoVivo tamanho={34} />
          <div style={{color: COR.branco, fontWeight: 800, fontSize: 72, lineHeight: 1}}>
            LIVE <span style={{color: COR.azul}}>#147</span>
          </div>
          <div style={{color: COR.branco, fontWeight: 700, fontSize: 46}}>TER · 17/NOV · 20h</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Painéis das telas divididas ----------
const VW = PAINEL.w;

const ArvoreIndice: React.FC<{t0: number}> = ({t0}) => {
  const t = useT();
  const m = useMola(t0);
  const x = interpolate(t, [t0 + 0.15, t0 + 0.5], [0, 1], {...clamp, easing: suave});
  if (!m.ativo) return null;
  const no = (cx: number, cy: number) => <rect x={cx - 34} y={cy - 18} width={68} height={36} rx={8} fill="none" stroke={COR.azul} strokeWidth={5} />;
  return (
    <svg width={240} height={190} viewBox="0 0 240 190" style={{opacity: m.op, transform: `scale(${0.8 + 0.2 * m.s})`}}>
      <line x1={120} y1={40} x2={50} y2={140} stroke={COR.azul} strokeWidth={4} />
      <line x1={120} y1={40} x2={120} y2={140} stroke={COR.azul} strokeWidth={4} />
      <line x1={120} y1={40} x2={190} y2={140} stroke={COR.azul} strokeWidth={4} />
      {no(120, 30)}
      {no(50, 150)}
      {no(120, 150)}
      {no(190, 150)}
      <g opacity={x} stroke={COR.vermelho} strokeWidth={14} strokeLinecap="round">
        <line x1={40} y1={20} x2={40 + 160 * x} y2={20 + 160 * x} />
        <line x1={200} y1={20} x2={200 - 160 * x} y2={20 + 160 * x} />
      </g>
    </svg>
  );
};

const BlocoWhere: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 1);
  const tam = 42;
  const brilhoWhere = t >= 11.41 ? 0.5 + 0.5 * Math.abs(Math.sin((t - 11.41) * Math.PI * 1.5)) : 0;
  const rotulo = useMola(16.23);
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 80% 100%, #0f2a40, #0b0d10 65%)">
      <Editor aba="SQLQuery1.sql">
        <Linha n={1} t0={7.29} tam={tam} toks={[['SELECT ', 'chave'], ['* ', 'nulo'], ['FROM ', 'chave'], ['dbo.SalesOrderHeader', 'texto']]} />
        <Linha
          n={2}
          t0={8.71}
          tam={tam}
          toks={[
            ['WHERE ', 'chave'], ['CAST', 'funcao'], ['(', 'nulo'], ['REPLACE', 'funcao'], ['(', 'nulo'], ['SalesOrderNumber', 'texto'], [',', 'nulo'],
          ]}
        />
        <Linha n={3} t0={8.71} tam={tam} toks={[['      ', 'texto'], ["'SO'", 'str'], [',', 'nulo'], ["''", 'str'], [') ', 'nulo'], ['AS ', 'chave'], ['int', 'chave'], [') ', 'nulo'], ['= ', 'nulo'], ['43659', 'texto']]} />
        {/* expressão aplicada sobre a coluna (linhas 2–3) */}
        <Contorno t0={10.11} x={250} y={80} w={720} h={126} />
        {brilhoWhere > 0 && (
          <div
            style={{
              position: 'absolute', left: 104, top: 82, width: 148, height: 58, borderRadius: 8, border: `4px solid ${COR.amarelo}`,
              opacity: brilhoWhere, boxShadow: `0 0 ${18 * brilhoWhere}px ${COR.amarelo}`,
            }}
          />
        )}
      </Editor>
      <div style={{position: 'absolute', left: 50, top: 350, display: 'flex', alignItems: 'center', gap: 40}}>
        <ArvoreIndice t0={13.39} />
        {rotulo.ativo && (
          <div style={{opacity: rotulo.op, transform: `translateX(${(1 - rotulo.s) * 30}px)`, color: COR.branco, fontWeight: 800, fontSize: 52, lineHeight: 1.1}}>
            ÍNDICE
            <br />
            <span style={{color: COR.vermelho}}>NÃO APROVEITADO</span>
          </div>
        )}
      </div>
      <Pilula t0={15.41} t1={16.1} x={330} y={410} tamanho={44} fundo={VEU} borda>
        índice?
      </Pilula>
    </Painel>
  );
};

const BlocoIndice: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 5);
  const tam = 42;
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 80% 100%, #0f2a40, #0b0d10 65%)">
      <Editor aba="SQLQuery1.sql">
        <Linha n={1} t0={30.29} tam={tam} digitar={0.6} toks={[['CREATE ', 'chave'], ['INDEX ', 'chave'], ['IX_SalesOrderNumber_Int', 'texto']]} />
        <Linha n={2} t0={30.87} tam={tam} digitar={0.5} toks={[['ON ', 'chave'], ['dbo.SalesOrderHeader', 'texto']]} />
        <Linha n={3} t0={31.45} tam={tam} digitar={0.6} toks={[['   (', 'nulo'], ['SalesOrderNumber_Int', 'texto'], [')', 'nulo']]} />
        <Contorno t0={32.05} x={190} y={142} w={520} h={60} />
      </Editor>
      <Pilula t0={32.05} x={50} y={340} tamanho={40} fundo={VEU} borda>
        índice na <span style={{color: COR.azul}}>coluna computada</span>
      </Pilula>
      <Pilula t0={32.87} x={50} y={470} tamanho={46} fundo={VEU} borda>
        sem <span style={{fontFamily: MONO, color: COR.azul}}>PERSISTED</span>
      </Pilula>
      <Pilula t0={36.15} x={560} y={470} tamanho={50} fundo={COR.azul}>
        ✓ FUNCIONA
      </Pilula>
    </Painel>
  );
};

const Bloco: React.FC<{t0: number; children: React.ReactNode; destaque?: boolean}> = ({t0, children, destaque}) => {
  const m = useMola(t0);
  if (!m.ativo) return <div style={{width: 280}} />;
  return (
    <div
      style={{
        width: 280, height: 170, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
        fontSize: 72, color: destaque ? COR.branco : COR.branco, background: destaque ? COR.azul : 'rgba(255,255,255,.06)',
        border: `3px solid ${COR.azul}`, opacity: m.op, transform: `translateY(${(1 - m.s) * 40}px) scale(${0.8 + 0.2 * m.s})`,
      }}
    >
      {children}
    </div>
  );
};

const BlocoLive: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 7);
  const sub = useMola(40.79);
  const carimbo = useMola(46.37);
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 50% 0%, #123a5a, #0b0d10 70%)">
      <div style={{position: 'absolute', left: 0, right: 0, top: 46, display: 'flex', justifyContent: 'center'}}>
        <AoVivo tamanho={36} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center', color: COR.branco, fontWeight: 800, fontSize: 110, lineHeight: 1}}>
        LIVE <span style={{color: COR.azul}}>#147</span>
      </div>
      {sub.ativo && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center', color: COR.cinza, fontWeight: 700, fontSize: 40, opacity: sub.op}}>
          Colunas computadas e índices
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 36}}>
        <Bloco t0={41.11}>TER</Bloco>
        <Bloco t0={42.19} destaque>
          17/11
        </Bloco>
        <Bloco t0={44.15}>20h</Bloco>
      </div>
      {carimbo.ativo && (
        <div
          style={{
            position: 'absolute', right: 40, top: 40, padding: '10px 26px', borderRadius: 14, border: `5px solid ${COR.azul}`, color: COR.azul,
            fontWeight: 800, fontSize: 44, letterSpacing: 3, background: 'rgba(10,10,10,.9)', opacity: carimbo.op,
            transform: `rotate(-10deg) scale(${1.6 - 0.6 * carimbo.s})`,
          }}
        >
          GRATUITA
        </div>
      )}
    </Painel>
  );
};

const Item: React.FC<{t0: number; children: React.ReactNode}> = ({t0, children}) => {
  const t = useT();
  const m = useMola(t0);
  const ok = interpolate(t, [t0 + 0.15, t0 + 0.45], [0, 1], {...clamp, easing: suave});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, opacity: m.ativo ? m.op : 0, transform: `translateX(${m.ativo ? (1 - m.s) * -30 : 0}px)`}}>
      <div
        style={{
          width: 74, height: 74, flexShrink: 0, borderRadius: 18, border: `4px solid ${COR.azul}`, background: m.ativo ? `rgba(46,163,242,${ok})` : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: COR.branco, fontSize: 52, fontWeight: 800,
        }}
      >
        <span style={{transform: `scale(${ok})`}}>✓</span>
      </div>
      <div style={{color: COR.branco, fontWeight: 800, fontSize: 48, lineHeight: 1.15}}>{children}</div>
    </div>
  );
};

const BlocoPauta: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 8, 9);
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 80% 0%, #0f2a40, #0b0d10 65%)">
      <div style={{position: 'absolute', left: 60, top: 44, color: COR.cinza, fontWeight: 700, fontSize: 38, letterSpacing: 4}}>
        NA LIVE <span style={{color: COR.azul}}>#147</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 50, top: 130, display: 'flex', flexDirection: 'column', gap: 54}}>
        <Item t0={48.41}>Criar colunas calculadas</Item>
        <Item t0={50.81}>
          <span style={{fontFamily: MONO, color: COR.azul}}>PERSISTED</span>: usar ou não?
        </Item>
        <Item t0={55.15}>Índices para mais desempenho</Item>
      </div>
    </Painel>
  );
};

// ---------- Tela cheia do SSMS atrás do card mini ----------
// Print cortado sempre na mesma posição: da aba até a linha 26 (sem a barra de status).
const SSMS_PNG = {w: 711, h: 771, corte: 740};
const ESC_SSMS = 1020 / SSMS_PNG.w;

const TelaSSMS: React.FC<{indice: number; zoom?: [number, number]; children?: React.ReactNode}> = ({indice, zoom, children}) => {
  const t = useT();
  const vis = visFundo(t, indice);
  const c = CENAS[indice];
  const z = zoom ? interpolate(t, [c.ini, c.fim], zoom, clamp) : 1;
  return (
    <AbsoluteFill style={{opacity: vis, background: 'radial-gradient(circle at 50% 20%, #0f2a40, #050a12 70%)'}}>
      <div
        style={{
          position: 'absolute', left: 30, top: 230, width: 1020, height: SSMS_PNG.corte * ESC_SSMS, borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 24px 70px rgba(0,0,0,.6), 0 0 0 2px rgba(46,163,242,.35)', transform: `scale(${z})`, transformOrigin: '50% 0%',
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, width: SSMS_PNG.w, height: SSMS_PNG.h, transform: `scale(${ESC_SSMS})`, transformOrigin: '0 0'}}>
          <Img src={img('SSMS.png')} style={{width: SSMS_PNG.w, height: SSMS_PNG.h}} />
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SSMSColuna: React.FC = () => (
  <>
    <TelaSSMS indice={3}>
      {/* linhas 22–23 do print: SalesOrderNumber_Int AS CAST(REPLACE(...) AS int) */}
      <Contorno t0={24.69} x={98} y={601} w={600} h={58} />
    </TelaSSMS>
    <Pilula t0={24.69} x={420} y={1340} tamanho={42}>
      COLUNA CALCULADA
    </Pilula>
    <Pilula t0={26.01} x={420} y={1450} tamanho={40} fundo={VEU} borda>
      computed column
    </Pilula>
  </>
);

const SSMSPratica: React.FC = () => (
  <>
    <TelaSSMS indice={10} zoom={[1, 1.04]} />
    <Pilula t0={60.51} x={420} y={1350} tamanho={46}>
      100% HANDS-ON
    </Pilula>
    <Pilula t0={61.99} x={420} y={1460} tamanho={38} fundo={VEU} borda>
      direto no SQL Server
    </Pilula>
  </>
);

// ---------- Legenda dinâmica ----------
type BlocoLeg = {s: number; e: number; palavras: typeof PALAVRAS};
const BLOCOS: BlocoLeg[] = (() => {
  const out: BlocoLeg[] = [];
  let atual: typeof PALAVRAS = [];
  PALAVRAS.forEach((p, i) => {
    atual.push(p);
    const prox = PALAVRAS[i + 1];
    const fimFrase = /[.,!?]$/.test(p.w);
    if (!prox || fimFrase || atual.length >= 3 || prox.s - p.e > 0.35) {
      out.push({s: atual[0].s, e: p.e, palavras: atual});
      atual = [];
    }
  });
  return out.map((b, i) => ({...b, e: Math.min(out[i + 1]?.s ?? b.e + 0.6, b.e + 0.6)}));
})();

const POS_LEGENDA: Record<Tipo, {top: number; left: number}> = {
  cheio: {top: 1420, left: 50},
  split: {top: 893, left: 50},
  vert: {top: 893, left: 50},
  mini: {top: 1390, left: 410},
};

// Sem legenda com código na tela (painéis de código e SSMS).
const SEM_LEGENDA: [number, number][] = [
  [6.63, 17.23],
  [23.67, 27.73],
  [29.97, 37.21],
  [58.75, 63.35],
];

const Legenda: React.FC<{de: Tipo; para: Tipo; p: number}> = ({de, para, p}) => {
  const frame = useQuadro();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (SEM_LEGENDA.some(([a, b]) => t >= a && t < b)) return null;
  const bloco = BLOCOS.find((b) => t >= b.s && t < b.e);
  if (!bloco) return null;
  const {top, left} = POS_LEGENDA[p < 0.5 ? de : para];
  const opacity = p < 1 ? interpolate(p, [0, 0.15, 0.85, 1], [1, 0, 0, 1], clamp) : 1;
  return (
    <div
      style={{
        opacity, position: 'absolute', left, right: 50, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '6px 18px', fontWeight: 800, fontSize: 58, lineHeight: 1.2, textTransform: 'uppercase',
      }}
    >
      {bloco.palavras
        .filter((w) => t >= w.s)
        .map((w) => {
          const pop = spring({frame: frame - w.s * fps, fps, config: {damping: 16, stiffness: 220}});
          const ativa = t >= w.s && t < w.e + 0.08;
          return (
            <span
              key={PALAVRAS.indexOf(w)}
              style={{
                display: 'inline-block', color: ativa ? COR.azul : COR.branco, transform: `scale(${0.8 + 0.2 * pop})`,
                textShadow: '0 4px 4px rgba(0,0,0,.85), 0 0 24px rgba(0,0,0,.7)', whiteSpace: 'nowrap',
              }}
            >
              {w.w.replace(/[.,!?]$/, '')}
            </span>
          );
        })}
    </div>
  );
};

// ---------- Composição ----------
export const Live147: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      {/* telas cheias do SSMS (atrás do card mini) */}
      <Trecho de={23.5} dur={4.6}>
        <SSMSColuna />
      </Trecho>
      <Trecho de={58.6} dur={5.1}>
        <SSMSPratica />
      </Trecho>

      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: W, height: H}} />
      </CameraCard>

      {/* pílulas das telas do SSMS ficam por cima do card mini */}

      {/* painéis das telas divididas */}
      <Trecho de={6.63} dur={11.2}>
        <BlocoWhere />
      </Trecho>
      <Trecho de={29.97} dur={7.8}>
        <BlocoIndice />
      </Trecho>
      <Trecho de={40.55} dur={7.2}>
        <BlocoLive />
      </Trecho>
      <Trecho de={47.39} dur={12.0}>
        <BlocoPauta />
      </Trecho>

      {/* elementos sobre a câmera cheia */}
      <Trecho de={0} dur={7.2}>
        <Abertura />
      </Trecho>
      <Trecho de={17.23} dur={7.0}>
        <Recurso />
      </Trecho>
      <Trecho de={27.73} dur={2.8}>
        <Interessante />
      </Trecho>
      <Trecho de={37.21} dur={3.9}>
        <Pratica />
      </Trecho>
      <Trecho de={63.35} dur={8.2}>
        <CTA />
      </Trecho>
      <Trecho de={71.23}>
        <Fecho />
      </Trecho>

      <Legenda de={i > 0 ? CENAS[i - 1].tipo : CENAS[0].tipo} para={CENAS[i].tipo} p={p} />
    </AbsoluteFill>
  );
};
