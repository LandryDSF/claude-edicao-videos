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

// 001.ADv004 — Carreira: nuvem, IA, SQL Server 2025, DP-300/DP-800 + chamada da Black Friday.
// Estilo Chamada Azul. Plano: projetos/001.ADv004/plano.md. Estrutura herdada do 001.ADv003.

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const DURACAO = 3226; // quadros do master (53,777 s)

const PASTA = '001.ADv004';
const MASTER = staticFile(`${PASTA}/video/ADv 004 Carreira - ori.mp4`);
const SSMS = staticFile(`${PASTA}/telas/SSMS IA.mp4`);
const VOLUME = staticFile(`${PASTA}/telas/Volume de Dados.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

const COR = {fundo: '#0A0A0A', azul: '#2EA3F2', amarelo: '#F5B800', branco: '#FFFFFF', cinza: '#9AA4AE', vermelho: '#FF3B30'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const SOMBRA_TEXTO = '0 8px 30px rgba(0,0,0,.7)';
// Gravação ao ar livre (fundo claro): tudo que fica sobre a câmera cheia vai em fundo sólido.
const VEU = 'rgba(10,10,10,.84)';

// Zona do rosto medida em projetos/001.ADv004/frames/sheet_rosto_grade.jpg (1 quadro por segundo, vídeo inteiro).
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

// Cortes do CapCut: 6,27 · 20,77 · 21,73 · 37,78. As outras trocas caem nas pausas da fala.
const CENAS: Cena[] = [
  // 0 · gancho + "não basta o tradicional"; punch-in em "mudando" (4,22); o corte 6,27 volta seco a 1,0
  {
    ini: 0,
    fim: 11.14,
    tipo: 'cheio',
    trans: 0,
    zoom: (t) => (t < 4.22 ? rampa(t, [[0.02, 1], [4.22, 1.04]]) : t < 6.27 ? 1.08 : rampa(t, [[6.27, 1], [11.14, 1.04]])),
  },
  // 1 · o mercado evolui: nuvem (Azure) e IA (Foundry)
  {ini: 11.14, fim: 15.7, tipo: 'split', trans: 1.0},
  // 2 · SSMS + logo SQL Server 2025 (troca de painel, câmera parada)
  {ini: 15.7, fim: 20.77, tipo: 'split', trans: 0.3},
  // 3 · corte 20,77 → certificações; punch-in seco no corte 21,73
  {ini: 20.77, fim: 26.07, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 21.73 ? 1 : rampa(t, [[21.73, 1.06], [26.07, 1.08]]))},
  // 4 · Volume de Dados: desenvolver / validar
  {ini: 26.07, fim: 29.53, tipo: 'mini', trans: 0.8},
  // 5 · 4 aulas / gratuitas / ao vivo; punch-in em "totalmente" (31,68)
  {ini: 29.53, fim: 33.8, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 31.68 ? rampa(t, [[29.53, 1], [31.68, 1.02]]) : rampa(t, [[31.68, 1.06], [33.8, 1.07]]))},
  // 6 · SSMS vector(1024): conteúdo técnico
  {ini: 33.8, fim: 37.78, tipo: 'split', trans: 1.0},
  // 7 · corte 37,78 → LP deitada (só o topo)
  {ini: 37.78, fim: 40.9, tipo: 'split', trans: 0.3},
  // 8 · datas; punch-in seco em "3 de dezembro" (42,78)
  {ini: 40.9, fim: 45.41, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 42.78 ? rampa(t, [[40.9, 1], [42.78, 1.02]]) : rampa(t, [[42.78, 1.05], [45.41, 1.03]]))},
  // 9 · CTA com a LP em pé
  {ini: 45.41, fim: 51.4, tipo: 'split', trans: 1.0},
  // 10 · fecho com os selos
  {ini: 51.4, fim: 99, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[52.2, 1], [53.78, 1.04]])},
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
const useCheio = (indice: number) => {
  const t = useT();
  const prox = CENAS[indice + 1];
  return prox ? interpolate(t, [prox.ini, prox.ini + prox.trans * 0.4], [1, 0], clamp) : 1;
};

const Abertura: React.FC = () => {
  const t = useT();
  const vis = useCheio(0);
  const id = useMola(0.52, 4.0);
  const giro = Math.max(0, t - 4.22) * 240;
  const risco = interpolate(t, [10.4, 10.85], [0, 1], {...clamp, easing: suave});
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={1.48} t1={4.1} top={320} tamanho={80}>
        SQL <Aparece t0={1.84} cor={COR.azul}>SERVER</Aparece>
      </Titulo>
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
      <Pilula t0={4.22} t1={6.15} x={W / 2} y={1170} centro tamanho={50}>
        <span style={{display: 'inline-block', transform: `rotate(${giro}deg)`}}>↻</span> O QUE ESTÁ MUDANDO
      </Pilula>

      {/* corte 6,27: "não basta ... administração de banco de dados tradicional" */}
      <Pilula t0={6.84} x={W / 2} y={330} centro tamanho={64} fundo={VEU} borda>
        NÃO BASTA
      </Pilula>
      <Pilula t0={8.66} x={W / 2} y={1112} centro tamanho={42} fundo={VEU} borda>
        administração de banco de dados
      </Pilula>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1228, display: 'flex', justifyContent: 'center'}}>
        <Aparece t0={10.26}>
          <span
            style={{
              position: 'relative', display: 'inline-block', background: VEU, color: COR.branco, fontWeight: 800, fontSize: 70,
              padding: '10px 34px', borderRadius: 22, letterSpacing: 2,
            }}
          >
            TRADICIONAL
            <span style={{position: 'absolute', left: 20, top: '48%', height: 9, width: `calc(${risco} * (100% - 40px))`, background: COR.vermelho, borderRadius: 5}} />
          </span>
        </Aparece>
      </div>
    </AbsoluteFill>
  );
};

const Certificacoes: React.FC = () => {
  const t = useT();
  const vis = useCheio(3);
  const brilho = t >= 24.44 ? 0.5 + 0.5 * Math.sin((t - 24.44) * Math.PI * 1.4) : 0;
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={21.28} top={300} tamanho={64}>
        CERTIFICAÇÕES <span style={{color: COR.azul}}>MICROSOFT</span>
      </Titulo>
      <Selo t0={21.98} x={W / 2 - 150} y={1100} h={270} qual="dp300" brilho={brilho} />
      <Selo t0={23.38} x={W / 2 + 150} y={1100} h={270} qual="dp800" brilho={brilho} />
    </AbsoluteFill>
  );
};

const QuatroAulas: React.FC = () => {
  const t = useT();
  const vis = useCheio(5);
  const n = Math.round(interpolate(t, [30.8, 31.12], [0, 4], clamp));
  const vivo = useMola(33.3);
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 1.6));
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={30.8} top={290} tamanho={104}>
        <span style={{color: COR.azul}}>{n}</span> <Aparece t0={31.12}>AULAS</Aparece>
      </Titulo>
      <Pilula t0={31.68} x={W / 2} y={1140} centro tamanho={60}>
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

const Datas: React.FC = () => {
  const t = useT();
  const vis = useCheio(8);
  const a = useMola(41.24);
  const b = useMola(42.78);
  const seta = interpolate(t, [42.78, 43.16], [0, 1], {...clamp, easing: suave});
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
      <Pilula t0={44.58} x={W / 2} y={1270} centro tamanho={46}>
        às 20h · ao vivo
      </Pilula>
    </AbsoluteFill>
  );
};

// Fecho: mesmo tamanho, posição e brilho da cena das certificações (aprovada). Os dois entram juntos.
const Fecho: React.FC = () => {
  const t = useT();
  const brilho = t >= 52.7 ? 0.5 + 0.5 * Math.sin((t - 52.7) * Math.PI * 1.4) : 0;
  return (
    <AbsoluteFill>
      <Selo t0={52.7} x={W / 2 - 150} y={1100} h={270} qual="dp300" brilho={brilho} />
      <Selo t0={52.7} x={W / 2 + 150} y={1100} h={270} qual="dp800" brilho={brilho} />
    </AbsoluteFill>
  );
};

// ---------- Tela cheia atrás do card mini ----------
const VolumeDados: React.FC = () => {
  const t = useT();
  const vis = visFundo(t, 4);
  const dev = useMola(26.54);
  const val = useMola(27.8);
  return (
    <AbsoluteFill style={{opacity: vis, background: '#050a12'}}>
      <OffthreadVideo
        src={VOLUME}
        muted
        trimBefore={Math.round(2.0 * FPS)}
        style={{position: 'absolute', left: 0, top: -64, width: W, height: 2049, filter: 'grayscale(1) brightness(.6) sepia(1) hue-rotate(175deg) saturate(2.2)'}}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, rgba(0,0,0,.25), rgba(0,0,0,.75) 75%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontWeight: 700, fontSize: 44, letterSpacing: 4, color: COR.cinza}}>
        <Aparece t0={28.58}>SEUS CONHECIMENTOS</Aparece>
      </div>
      {dev.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontWeight: 800, fontSize: 112, color: COR.branco,
            opacity: dev.op, transform: `scale(${0.7 + 0.3 * dev.s})`, textShadow: SOMBRA_TEXTO,
          }}
        >
          DESENVOLVER
        </div>
      )}
      {val.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', fontWeight: 800, fontSize: 112, color: COR.azul,
            opacity: val.op, transform: `scale(${0.7 + 0.3 * val.s})`, textShadow: '0 0 40px rgba(46,163,242,.7), 0 8px 30px rgba(0,0,0,.8)',
          }}
        >
          <span style={{color: COR.cinza, fontSize: 70}}>e </span>VALIDAR
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- Cenas em tela dividida ----------
const VW = PAINEL.w;

// SSMS cortado sempre na mesma posição: rente à aba "Embedd...(166)" (x 76, y 312 do SSMS), como no ADv003.
const SSMS_RECT: Rect = {x: 76, y: 312, w: 900, h: 565};

const LogoColuna: React.FC<{t0: number; children: React.ReactNode; x: number}> = ({t0, children, x}) => {
  const m = useMola(t0);
  if (!m.ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: 130, width: 470, height: 480, display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: m.op, transform: `translateY(${(1 - m.s) * 40}px) scale(${0.85 + 0.15 * m.s})`,
      }}
    >
      {children}
    </div>
  );
};

const Rotulo: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{background: COR.azul, color: COR.branco, fontWeight: 800, fontSize: 34, padding: '8px 26px', borderRadius: 999, letterSpacing: 2}}>{children}</div>
);

const BlocoMercado: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 1);
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 80% 0%, #0f2a40, #0b0d10 65%)">
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', color: COR.branco, fontWeight: 800, fontSize: 56, letterSpacing: 1}}>
        <Aparece t0={11.7}>O MERCADO</Aparece> <Aparece t0={12.32} cor={COR.azul}>EVOLUI</Aparece>
      </div>
      <LogoColuna t0={13.5} x={30}>
        <Rotulo>NUVEM</Rotulo>
        <Img src={img('Logo Azure.png')} style={{width: 360, marginTop: 30}} />
        <Img src={img('Logo Azure SQL Database.png')} style={{height: 250, marginTop: 14}} />
      </LogoColuna>
      <LogoColuna t0={14.44} x={520}>
        <Rotulo>IA</Rotulo>
        <Img src={img('Logo Microsoft Foundry - img.png')} style={{width: 270, height: 270, marginTop: 40}} />
        <div style={{color: COR.branco, fontWeight: 700, fontSize: 46, marginTop: 20, whiteSpace: 'nowrap'}}>Microsoft Foundry</div>
      </LogoColuna>
      <div style={{position: 'absolute', left: VW / 2 - 1, top: 150, width: 2, height: 440, background: 'rgba(46,163,242,.3)', opacity: interpolate(t, [14.44, 14.8], [0, 1], clamp)}} />
    </Painel>
  );
};

const BlocoSQL2025: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 2);
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          {/* src 5,8 s em diante: CREATE EXTERNAL MODEL EmbeddingGemma, MODEL_TYPE = EMBEDDINGS (sem rolagem) */}
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(5.8 * FPS)} playbackRate={0.8} style={{width: 1080, height: 1920}} />
          <Contorno t0={17.02} x={196} y={672} w={430} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={16.46} x={520} y={20} tamanho={34}>
        NOVAS TECNOLOGIAS
      </Pilula>
    </Painel>
  );
};

const BlocoTecnico: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 6);
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          {/* src 19,6 s em diante: tabela dbo.BlogChunks com a coluna Embedding vector(1024); 0,75× para não passar do fim do arquivo */}
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(19.6 * FPS)} playbackRate={0.75} style={{width: 1080, height: 1920}} />
          <Contorno t0={34.88} x={196} y={750} w={316} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={34.88} x={560} y={20} tamanho={34}>
        CONTEÚDO TÉCNICO
      </Pilula>
      <Pilula t0={36.36} x={VW / 2} y={560} centro tamanho={34} fundo="rgba(10,10,10,.9)" borda>
        demonstrações práticas
      </Pilula>
    </Painel>
  );
};

const LP_DEITADA = {w: 1287, h: 805};
const BlocoEvento: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 7);
  const A: Rect = {x: 0, y: 0, w: 660, h: 414};
  const A2: Rect = {x: 20, y: 10, w: 611, h: 383};
  const rect = misturarRect(A, A2, interpolate(t, [38.2, 40.6], [0, 1], {...clamp, easing: suave}));
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={rect}>
        <div style={{position: 'relative', width: LP_DEITADA.w, height: LP_DEITADA.h}}>
          <Img src={img('LP Black Friday - Deitado.png')} style={{width: LP_DEITADA.w, height: LP_DEITADA.h}} />
          <MarcaTexto t0={40.08} x={80} y={86} w={556} h={8} cor={COR.azul} dur={0.6} />
        </div>
      </Enquadrado>
      <Pilula t0={38.96} x={790} y={150} tamanho={52} rot={-6}>
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
  const zoom = interpolate(t, [46.18, 47.16], [0, 1], {...clamp, easing: suave});
  const pulso = t >= 46.18 ? 0.6 + 0.4 * Math.abs(Math.sin((t - 46.18) * Math.PI * 1.5)) : 0;
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
      <Pilula t0={47.78} t1={49.3} x={30} y={26} tamanho={38} fundo={COR.amarelo} cor="#111">
        LINK NO PERFIL
      </Pilula>
      <Pilula t0={49.46} x={30} y={26} tamanho={38} fundo={COR.amarelo} cor="#111">
        INSCRIÇÃO <Aparece t0={50.86}>GRATUITA</Aparece>
      </Pilula>
    </Painel>
  );
};

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
  [15.7, 20.77],
  [26.54, 29.53],
  [33.8, 37.78],
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
export const ADv004: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      <Trecho de={25.9} dur={4.0}>
        <VolumeDados />
      </Trecho>

      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: W, height: H}} />
      </CameraCard>

      {/* painéis das telas divididas */}
      <Trecho de={11.14} dur={4.9}>
        <BlocoMercado />
      </Trecho>
      <Trecho de={15.7} dur={5.9}>
        <BlocoSQL2025 />
      </Trecho>
      <Trecho de={33.8} dur={4.4}>
        <BlocoTecnico />
      </Trecho>
      <Trecho de={37.78} dur={4.0}>
        <BlocoEvento />
      </Trecho>
      <Trecho de={45.41} dur={6.9}>
        <BlocoCTA />
      </Trecho>

      {/* elementos sobre a câmera cheia */}
      <Trecho de={0} dur={11.8}>
        <Abertura />
      </Trecho>
      <Trecho de={20.77} dur={5.7}>
        <Certificacoes />
      </Trecho>
      <Trecho de={29.53} dur={4.7}>
        <QuatroAulas />
      </Trecho>
      <Trecho de={40.9} dur={5.0}>
        <Datas />
      </Trecho>
      <Trecho de={51.4}>
        <Fecho />
      </Trecho>

      <Legenda de={i > 0 ? CENAS[i - 1].tipo : CENAS[0].tipo} para={CENAS[i].tipo} p={p} />
    </AbsoluteFill>
  );
};
