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

// 001.ADv005 — Demonstração técnica: busca vetorial no SQL Server 2025, DP-800 + chamada da Black Friday.
// Estilo Chamada Azul. Plano: projetos/001.ADv005/plano.md. Estrutura herdada do 001.ADv004.

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const DURACAO = 3472; // quadros do master (57,887 s)

const PASTA = '001.ADv005';
const MASTER = staticFile(`${PASTA}/video/ADv 005 Demonstração técnica - ori.mp4`);
const SSMS = staticFile(`${PASTA}/telas/SSMS IA.mp4`);
const VOLUME = staticFile(`${PASTA}/telas/Volume de Dados.mp4`);
const PROGRAMANDO = staticFile(`${PASTA}/telas/Programando.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

const COR = {fundo: '#0A0A0A', azul: '#2EA3F2', amarelo: '#F5B800', branco: '#FFFFFF', cinza: '#9AA4AE', vermelho: '#FF3B30'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const SOMBRA_TEXTO = '0 8px 30px rgba(0,0,0,.7)';
// Gravação ao ar livre (fundo claro): tudo que fica sobre a câmera cheia vai em fundo sólido.
const VEU = 'rgba(10,10,10,.84)';

// Zona do rosto medida em projetos/001.ADv005/frames/sheet_rosto_grade.jpg (1 quadro por segundo, vídeo inteiro).
const ROSTO: ZonaRosto = {x0: 320, y0: 500, x1: 840, y1: 1060};

// ---------- Layouts ----------
const PAINEL: Retangulo = {x: 30, y: 230, w: 1020, h: 640, r: 32};
const CARD_SPLIT: Retangulo = {x: 30, y: 1000, w: 1020, h: 880, r: 36};
const CARD_MINI: Retangulo = {x: 40, y: 1240, w: 340, h: 420, r: 28};
const SPLIT = layoutCard(CARD_SPLIT, ROSTO, W, H);
const MINI = layoutCard(CARD_MINI, ROSTO, W, H);

type Tipo = 'cheio' | 'split' | 'mini';
type Cena = {ini: number; fim: number; tipo: Tipo; trans: number; zoom?: (t: number) => number};

const rampa = (t: number, pts: [number, number][]) =>
  interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {...clamp, easing: suave});

// Cortes do CapCut: 0,80 · 6,67 · 21,57 · 27,37 · 29,93. Silêncios: 21,22–21,80 · 46,40–46,80.
const CENAS: Cena[] = [
  // 0 · gancho: punch-in seco no corte 0,80 e em "SQL Server" (6,00)
  {
    ini: 0,
    fim: 6.67,
    tipo: 'cheio',
    trans: 0,
    zoom: (t) => (t < 0.8 ? 1 : t < 6.0 ? rampa(t, [[0.8, 1.04], [6.0, 1.07]]) : 1.11),
  },
  // 1 · corte 6,67 → SSMS: busca vetorial
  {ini: 6.67, fim: 11.2, tipo: 'split', trans: 1.0},
  // 2 · Volume de Dados: pelo significado, não só pelas palavras
  {ini: 11.2, fim: 16.1, tipo: 'mini', trans: 0.8},
  // 3 · SSMS vector(1024): novos recursos do SQL Server 2025
  {ini: 16.1, fim: 21.57, tipo: 'split', trans: 1.0},
  // 4 · corte 21,57 → quer aprender / nova certificação; punch-in seco no corte 27,37 (DP-800)
  {
    ini: 21.57,
    fim: 29.93,
    tipo: 'cheio',
    trans: 0.5,
    zoom: (t) => (t < 27.37 ? rampa(t, [[21.57, 1.0], [27.37, 1.04]]) : rampa(t, [[27.37, 1.09], [29.93, 1.1]])),
  },
  // 5 · corte 29,93 → LP deitada (só o topo)
  {ini: 29.93, fim: 33.42, tipo: 'split', trans: 0.8},
  // 6 · 4 aulas / gratuitas / ao vivo; punch-in em "totalmente" (34,78)
  {ini: 33.42, fim: 36.6, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 34.78 ? rampa(t, [[33.42, 1], [34.78, 1.02]]) : rampa(t, [[34.78, 1.06], [36.6, 1.07]]))},
  // 7 · Programando: demonstrações práticas / inteligência artificial
  {ini: 36.6, fim: 41.1, tipo: 'mini', trans: 0.8},
  // 8 · certificações DP-300/DP-800 e, depois do silêncio 46,40, as datas (punch-ins secos)
  {
    ini: 41.1,
    fim: 51.5,
    tipo: 'cheio',
    trans: 0.8,
    zoom: (t) =>
      t < 42.88
        ? rampa(t, [[41.1, 1], [42.88, 1.02]])
        : t < 46.6
          ? rampa(t, [[42.88, 1.06], [46.6, 1.07]])
          : t < 49.08
            ? rampa(t, [[46.6, 1.0], [49.08, 1.02]])
            : rampa(t, [[49.08, 1.06], [51.5, 1.07]]),
  },
  // 9 · CTA com a LP em pé
  {ini: 51.5, fim: 55.6, tipo: 'split', trans: 1.0},
  // 10 · fecho com os selos
  {ini: 55.6, fim: 99, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[56.2, 1], [57.89, 1.04]])},
];

const layoutDe = (c: Cena, t: number): LayoutCamera =>
  c.tipo === 'split' ? SPLIT : c.tipo === 'mini' ? MINI : layoutCheio(W, H, ROSTO, c.zoom ? c.zoom(t) : 1);

const estado = (t: number) => {
  const i = Math.max(0, CENAS.findIndex((c) => t >= c.ini && t < c.fim));
  const c = CENAS[i];
  const p = c.trans > 0 && i > 0 ? interpolate(t, [c.ini, c.ini + c.trans], [0, 1], {...clamp, easing: suave}) : 1;
  const layout = p < 1 ? misturarLayouts(layoutDe(CENAS[i - 1], c.ini), layoutDe(c, t), p) : layoutDe(c, t);
  const div = (k: Tipo) => (k === 'cheio' ? 0 : 1);
  const dividido = i > 0 ? div(CENAS[i - 1].tipo) + (div(c.tipo) - div(CENAS[i - 1].tipo)) * p : 0;
  return {i, cena: c, p, layout, dividido};
};

const visPainel = (t: number, indice: number) => {
  const c = CENAS[indice];
  const prox = CENAS[indice + 1];
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

type Rect = {x: number; y: number; w: number; h: number};
const misturarRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  w: a.w + (b.w - a.w) * p,
  h: a.h + (b.h - a.h) * p,
});
const Enquadrado: React.FC<{vw: number; rect: Rect; children: React.ReactNode}> = ({vw, rect, children}) => {
  const s = vw / rect.w;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${s}) translate(${-rect.x}px, ${-rect.y}px)`}}>
      {children}
    </div>
  );
};

const MarcaTexto: React.FC<{t0: number; x: number; y: number; w: number; h: number; cor?: string; dur?: number}> = ({
  t0, x, y, w, h, cor = 'rgba(46,163,242,.42)', dur = 0.5,
}) => {
  const t = useT();
  const p = interpolate(t, [t0, t0 + dur], [0, 1], {...clamp, easing: suave});
  return <div style={{position: 'absolute', left: x, top: y, width: w * p, height: h, background: cor, borderRadius: 6}} />;
};

// Contorno azul que se desenha em volta de um trecho de código (o SSMS já tem seleção azul por cima).
const Contorno: React.FC<{t0: number; x: number; y: number; w: number; h: number}> = ({t0, x, y, w, h}) => {
  const t = useT();
  const p = interpolate(t, [t0, t0 + 0.35], [0, 1], {...clamp, easing: suave});
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 8, border: `3px solid ${COR.azul}`,
        boxShadow: `0 0 ${16 * p}px ${COR.azul}, inset 0 0 0 999px rgba(46,163,242,.12)`, opacity: p,
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

// Selos DP sem fundo (PNG transparente). Cada um é recortado pela área visível,
// medida no canal alfa, para os dois saírem exatamente com a mesma altura.
const SELOS = {
  dp300: {src: 'Dp-300.png', x0: 18, y0: 9, x1: 510, y1: 516},
  dp800: {src: 'DP-800.png', x0: 8, y0: 17, x1: 508, y1: 507},
} as const;
const LADO_PNG = 525;

const Selo: React.FC<{t0: number; t1?: number; x: number; y: number; h: number; qual: keyof typeof SELOS; brilho?: number}> = ({
  t0, t1, x, y, h, qual, brilho = 0,
}) => {
  const {s, op, ativo} = useMola(t0, t1);
  if (!ativo) return null;
  const b = SELOS[qual];
  const esc = h / (b.y1 - b.y0);
  const w = (b.x1 - b.x0) * esc;
  return (
    <div
      style={{
        position: 'absolute', left: x - w / 2, top: y, width: w, height: h, overflow: 'visible', opacity: op,
        transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`,
        filter: `drop-shadow(0 12px 22px rgba(0,0,0,.55)) drop-shadow(0 0 ${28 * brilho}px rgba(46,163,242,${0.9 * brilho}))`,
      }}
    >
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <Img src={img(b.src)} style={{position: 'absolute', left: -b.x0 * esc, top: -b.y0 * esc, width: LADO_PNG * esc, height: LADO_PNG * esc}} />
      </div>
    </div>
  );
};

// ---------- Cenas sobre a câmera cheia ----------
// ---------- Cenas em tela dividida ----------
const VW = PAINEL.w;

// SSMS cortado sempre na mesma posição: rente à aba "Embedd...(166)" (x 76, y 312 do SSMS), como no ADv003.
const SSMS_RECT: Rect = {x: 76, y: 312, w: 900, h: 565};
// ---------- Legenda dinâmica ----------
type Bloco = {s: number; e: number; palavras: typeof PALAVRAS};
const BLOCOS: Bloco[] = (() => {
  const out: Bloco[] = [];
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
  cheio: {top: 1400, left: 50},
  split: {top: 893, left: 50},
  mini: {top: 1390, left: 410},
};

// Sem legenda com o SSMS na tela e enquanto a tipografia grande repete a fala.
const SEM_LEGENDA: [number, number][] = [
  [6.67, 21.57],
  [37.18, 41.1],
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

// ---------- Cenas sobre a câmera cheia ----------
const useCheio = (indice: number) => {
  const t = useT();
  const prox = CENAS[indice + 1];
  return prox ? interpolate(t, [prox.ini, prox.ini + Math.max(prox.trans * 0.4, 1 / FPS)], [1, 0], clamp) : 1;
};

const brilhoDe = (t: number, t0: number) => (t >= t0 ? 0.5 + 0.5 * Math.sin((t - t0) * Math.PI * 1.4) : 0);

const Abertura: React.FC = () => {
  const vis = useCheio(0);
  const id = useMola(0.34, 3.5);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {id.ativo && (
        <div
          style={{
            position: 'absolute', left: 60, right: 60, top: 1130, height: 210, display: 'flex', alignItems: 'center', gap: 28,
            padding: '0 36px', borderRadius: 32, background: VEU, border: `2px solid ${COR.azul}`,
            opacity: id.op, transform: `translateY(${(1 - id.s) * 40}px)`, boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          }}
        >
          <Img src={img('MCT.png')} style={{width: 170, height: 170}} />
          <div>
            <div style={{color: COR.branco, fontWeight: 800, fontSize: 56}}>Landry Duailibe</div>
            <div style={{color: COR.azul, fontWeight: 700, fontSize: 34, marginTop: 6}}>Microsoft Certified Trainer</div>
          </div>
        </div>
      )}
      <Titulo t0={2.98} t1={4.2} top={330} tamanho={52}>
        INTELIGÊNCIA <Aparece t0={3.84} cor={COR.azul}>ARTIFICIAL</Aparece>
      </Titulo>
      <Titulo t0={4.36} top={330} tamanho={64}>
        DIRETO NO <Aparece t0={6.0} cor={COR.azul}>SQL SERVER</Aparece>
      </Titulo>
    </AbsoluteFill>
  );
};

// "Quer aprender ... nova certificação Microsoft DP-800?": o selo entra sozinho no punch-in do corte 27,37.
const Aprender: React.FC = () => {
  const t = useT();
  const vis = useCheio(4);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={21.8} t1={26.45} top={320} tamanho={80}>
        QUER <Aparece t0={22.1} cor={COR.azul}>APRENDER?</Aparece>
      </Titulo>
      <Pilula t0={23.58} t1={26.45} x={W / 2} y={1150} centro tamanho={46} fundo={VEU} borda>
        IA · BUSCA VETORIAL
      </Pilula>
      <Titulo t0={26.66} top={320} tamanho={62}>
        NOVA <Aparece t0={27.16} cor={COR.azul}>CERTIFICAÇÃO</Aparece>
      </Titulo>
      <Selo t0={28.26} x={W / 2} y={1100} h={270} qual="dp800" brilho={brilhoDe(t, 28.26)} />
    </AbsoluteFill>
  );
};

const QuatroAulas: React.FC = () => {
  const t = useT();
  const vis = useCheio(6);
  const n = Math.round(interpolate(t, [34.08, 34.38], [0, 4], clamp));
  const vivo = useMola(36.06);
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 1.6));
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={34.08} top={290} tamanho={104}>
        <span style={{color: COR.azul}}>{n}</span> <Aparece t0={34.38}>AULAS</Aparece>
      </Titulo>
      <Pilula t0={34.78} x={W / 2} y={1140} centro tamanho={60}>
        100% GRATUITAS
      </Pilula>
      {vivo.ativo && (
        <div
          style={{
            position: 'absolute', left: W / 2, top: 1262, display: 'flex', alignItems: 'center', gap: 16, opacity: vivo.op,
            transform: `translateX(-50%) scale(${0.85 + 0.15 * vivo.s})`, background: VEU, padding: '12px 30px',
            borderRadius: 999, color: COR.branco, fontWeight: 800, fontSize: 42, boxShadow: '0 12px 40px rgba(0,0,0,.45)',
          }}
        >
          <span style={{width: 24, height: 24, borderRadius: 12, background: COR.vermelho, opacity: pisca}} />
          AO VIVO
        </div>
      )}
    </AbsoluteFill>
  );
};

// Selos no padrão aprovado no ADv004 (y 1100, altura 270, x 540 ± 150). Saem no punch-in do silêncio 46,40.
const Certificacoes: React.FC = () => {
  const t = useT();
  const vis = useCheio(8);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={41.96} t1={46.4} top={290} tamanho={60}>
        <div style={{textAlign: 'center', lineHeight: 1.15}}>
          CONTEÚDOS DAS
          <br />
          <Aparece t0={43.7} cor={COR.azul}>CERTIFICAÇÕES</Aparece>
        </div>
      </Titulo>
      <Selo t0={44.38} t1={46.4} x={W / 2 - 150} y={1100} h={270} qual="dp300" brilho={brilhoDe(t, 45.7)} />
      <Selo t0={45.7} t1={46.4} x={W / 2 + 150} y={1100} h={270} qual="dp800" brilho={brilhoDe(t, 45.7)} />
    </AbsoluteFill>
  );
};

const Datas: React.FC = () => {
  const t = useT();
  const vis = useCheio(8);
  const a = useMola(47.5);
  const b = useMola(49.08);
  const seta = interpolate(t, [49.08, 49.46], [0, 1], {...clamp, easing: suave});
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {a.ativo && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 24, color: COR.branco, fontWeight: 800, fontSize: 100, background: VEU,
              padding: '14px 40px', borderRadius: 30, boxShadow: '0 16px 50px rgba(0,0,0,.45)', border: '2px solid rgba(46,163,242,.55)',
            }}
          >
            <span style={{opacity: a.op, transform: `scale(${0.8 + 0.2 * a.s})`}}>30/11</span>
            {b.ativo && (
              <>
                <span style={{color: COR.azul, opacity: seta, transform: `translateX(${(1 - seta) * -30}px)`}}>→</span>
                <span style={{opacity: b.op, transform: `scale(${0.8 + 0.2 * b.s})`}}>03/12</span>
              </>
            )}
          </div>
        </div>
      )}
      <Pilula t0={50.72} x={W / 2} y={1270} centro tamanho={46}>
        às 20h · ao vivo
      </Pilula>
    </AbsoluteFill>
  );
};

// Fecho: selos juntos, mesma geometria das certificações; "inscrição gratuita" em amarelo (é CTA).
const Fecho: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Pilula t0={55.9} x={W / 2} y={330} centro tamanho={56} fundo={COR.amarelo} cor="#111">
        INSCRIÇÃO <Aparece t0={57.02}>GRATUITA</Aparece>
      </Pilula>
      <Selo t0={55.9} x={W / 2 - 150} y={1100} h={270} qual="dp300" brilho={brilhoDe(t, 55.9)} />
      <Selo t0={55.9} x={W / 2 + 150} y={1100} h={270} qual="dp800" brilho={brilhoDe(t, 55.9)} />
    </AbsoluteFill>
  );
};

// ---------- Telas cheias atrás do card mini ----------
const Grande: React.FC<{t0: number; t1?: number; top: number; cor?: string; tamanho?: number; children: React.ReactNode}> = ({
  t0, t1, top, cor = COR.branco, tamanho = 112, children,
}) => {
  const m = useMola(t0, t1, 0.2);
  if (!m.ativo) return null;
  const azul = cor === COR.azul;
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontWeight: 800, fontSize: tamanho, color: cor, lineHeight: 1.1,
        opacity: m.op, transform: `scale(${0.7 + 0.3 * m.s})`,
        textShadow: azul ? '0 0 40px rgba(46,163,242,.7), 0 8px 30px rgba(0,0,0,.8)' : SOMBRA_TEXTO,
      }}
    >
      {children}
    </div>
  );
};

const Significado: React.FC = () => {
  const t = useT();
  const vis = visFundo(t, 2);
  const risco = interpolate(t, [15.12, 15.5], [0, 1], {...clamp, easing: suave});
  const ok = useMola(12.62);
  return (
    <AbsoluteFill style={{opacity: vis, background: '#050a12'}}>
      <OffthreadVideo
        src={VOLUME}
        muted
        trimBefore={Math.round(2.0 * FPS)}
        style={{position: 'absolute', left: 0, top: -64, width: W, height: 2049, filter: 'grayscale(1) brightness(.6) sepia(1) hue-rotate(175deg) saturate(2.2)'}}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, rgba(0,0,0,.25), rgba(0,0,0,.75) 75%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontWeight: 700, fontSize: 46, letterSpacing: 4, color: COR.cinza}}>
        <Aparece t0={11.3}>ENCONTRA PELO</Aparece>
      </div>
      <Grande t0={11.3} top={410} cor={COR.azul}>
        SIGNIFICADO
      </Grande>
      <Grande t0={12.62} top={550} tamanho={64}>
        DA PERGUNTA
        {ok.ativo && <span style={{display: 'inline-block', marginLeft: 20, color: COR.azul, transform: `scale(${ok.s})`}}>✓</span>}
      </Grande>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontWeight: 700, fontSize: 46, letterSpacing: 4, color: COR.cinza}}>
        <Aparece t0={13.72}>NÃO APENAS PELAS</Aparece>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, display: 'flex', justifyContent: 'center'}}>
        <Aparece t0={14.62}>
          <span style={{position: 'relative', display: 'inline-block', fontWeight: 800, fontSize: 96, color: COR.branco, textShadow: SOMBRA_TEXTO}}>
            PALAVRAS
            <span style={{position: 'absolute', left: -10, top: '48%', height: 10, width: `calc(${risco} * (100% + 20px))`, background: COR.vermelho, borderRadius: 5}} />
          </span>
        </Aparece>
      </div>
    </AbsoluteFill>
  );
};

const Demonstracoes: React.FC = () => {
  const t = useT();
  const vis = visFundo(t, 7);
  return (
    <AbsoluteFill style={{opacity: vis, background: '#000'}}>
      <OffthreadVideo src={PROGRAMANDO} muted trimBefore={Math.round(2.0 * FPS)} style={{width: W, height: H, filter: 'brightness(.5) saturate(.55)'}} />
      {/* esfria os tons quentes na direção do azul da marca */}
      <AbsoluteFill style={{background: 'rgba(20,70,120,.45)', mixBlendMode: 'color'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.1) 40%, rgba(0,0,0,.2) 70%, rgba(0,0,0,.6) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontWeight: 700, fontSize: 46, letterSpacing: 4, color: COR.cinza}}>
        <Aparece t0={38.56}>DIRETO NO SQL SERVER</Aparece>
      </div>
      <Grande t0={37.18} t1={40.0} top={400} tamanho={100}>
        DEMONSTRAÇÕES
        <br />
        <Aparece t0={37.88} cor={COR.azul}>PRÁTICAS</Aparece>
      </Grande>
      <Grande t0={40.2} top={400} tamanho={100}>
        INTELIGÊNCIA
        <br />
        <Aparece t0={40.72} cor={COR.azul}>ARTIFICIAL</Aparece>
      </Grande>
    </AbsoluteFill>
  );
};

// ---------- Cenas em tela dividida ----------
const BlocoBusca: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 1);
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          {/* src 5,8 s em diante: CREATE EXTERNAL MODEL EmbeddingGemma, MODEL_TYPE = EMBEDDINGS (mesmo trecho aprovado no ADv004) */}
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(5.8 * FPS)} playbackRate={0.8} style={{width: 1080, height: 1920}} />
          <Contorno t0={8.78} x={196} y={672} w={430} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={8.16} x={560} y={20} tamanho={36}>
        BUSCA <Aparece t0={8.78}>VETORIAL</Aparece>
      </Pilula>
    </Painel>
  );
};

const BlocoSQL2025: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 3);
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          {/* src 19,6 s em diante: tabela dbo.BlogChunks, Embedding vector(1024); 0,55x para não passar do fim do arquivo (22,9 s) */}
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(19.6 * FPS)} playbackRate={0.55} style={{width: 1080, height: 1920}} />
          <Contorno t0={18.54} x={196} y={750} w={316} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={17.98} t1={19.7} x={560} y={20} tamanho={36}>
        NOVOS RECURSOS
      </Pilula>
      <Pilula t0={19.84} x={540} y={20} tamanho={36}>
        SQL SERVER <Aparece t0={20.56}>2025</Aparece>
      </Pilula>
    </Painel>
  );
};

const LP_DEITADA = {w: 1287, h: 805};
const BlocoEvento: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 5);
  const A: Rect = {x: 0, y: 0, w: 660, h: 414};
  const A2: Rect = {x: 20, y: 10, w: 611, h: 383};
  const rect = misturarRect(A, A2, interpolate(t, [30.6, 33.2], [0, 1], {...clamp, easing: suave}));
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={rect}>
        <div style={{position: 'relative', width: LP_DEITADA.w, height: LP_DEITADA.h}}>
          <Img src={img('LP Black Friday - Deitado.png')} style={{width: LP_DEITADA.w, height: LP_DEITADA.h}} />
          <MarcaTexto t0={32.84} x={80} y={86} w={556} h={8} cor={COR.azul} dur={0.5} />
        </div>
      </Enquadrado>
      <Pilula t0={31.48} x={790} y={150} tamanho={52} rot={-6}>
        2026
      </Pilula>
    </Painel>
  );
};

const LP_EMPE = {w: 658, h: 855};
const BlocoCTA: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 9);
  const A: Rect = {x: 0, y: 300, w: 658, h: 413};
  const B: Rect = {x: 89, y: 545, w: 480, h: 301};
  const zoom = interpolate(t, [52.66, 53.6], [0, 1], {...clamp, easing: suave});
  const pulso = t >= 52.66 ? 0.6 + 0.4 * Math.abs(Math.sin((t - 52.66) * Math.PI * 1.5)) : 0;
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={misturarRect(A, B, zoom)}>
        <div style={{position: 'relative', width: LP_EMPE.w, height: LP_EMPE.h}}>
          <Img src={img('LP Black Friday - EmPe.png')} style={{width: LP_EMPE.w, height: LP_EMPE.h}} />
          {pulso > 0 && (
            <div
              style={{
                position: 'absolute', left: 132, top: 771, width: 352, height: 46, borderRadius: 26,
                border: `4px solid ${COR.amarelo}`, opacity: pulso, boxShadow: `0 0 ${20 * pulso}px ${COR.amarelo}`,
              }}
            />
          )}
        </div>
      </Enquadrado>
      <Pilula t0={52.66} t1={54.3} x={30} y={26} tamanho={38} fundo={COR.amarelo} cor="#111">
        CLIQUE NO BOTÃO
      </Pilula>
      <Pilula t0={54.42} x={30} y={26} tamanho={38} fundo={COR.amarelo} cor="#111">
        OU LINK NO PERFIL
      </Pilula>
    </Painel>
  );
};

// ---------- Composição ----------
export const ADv005: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      {/* telas cheias atrás do card mini */}
      <Trecho de={11.0} dur={5.5}>
        <Significado />
      </Trecho>
      <Trecho de={36.4} dur={5.1}>
        <Demonstracoes />
      </Trecho>

      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: W, height: H}} />
      </CameraCard>

      {/* painéis das telas divididas */}
      <Trecho de={6.67} dur={5.1}>
        <BlocoBusca />
      </Trecho>
      <Trecho de={16.1} dur={6.1}>
        <BlocoSQL2025 />
      </Trecho>
      <Trecho de={29.93} dur={4.4}>
        <BlocoEvento />
      </Trecho>
      <Trecho de={51.5} dur={5.0}>
        <BlocoCTA />
      </Trecho>

      {/* elementos sobre a câmera cheia */}
      <Trecho de={0} dur={7.2}>
        <Abertura />
      </Trecho>
      <Trecho de={21.57} dur={8.9}>
        <Aprender />
      </Trecho>
      <Trecho de={33.42} dur={3.7}>
        <QuatroAulas />
      </Trecho>
      <Trecho de={41.1} dur={5.6}>
        <Certificacoes />
      </Trecho>
      <Trecho de={46.6} dur={5.5}>
        <Datas />
      </Trecho>
      <Trecho de={55.6}>
        <Fecho />
      </Trecho>

      <Legenda de={i > 0 ? CENAS[i - 1].tipo : CENAS[0].tipo} para={CENAS[i].tipo} p={p} />
    </AbsoluteFill>
  );
};
