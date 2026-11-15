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

// 001.ADv001 — certificações DP-300 / DP-800 + chamada da Black Friday SQL Server Expert 2026.
// Plano: projetos/001.ADv001/plano.md. Estrutura herdada do 001.ADv002 (aprovado) e do 001.ADv003.

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const DURACAO = 3326; // quadros do master (55,449 s)

const PASTA = '001.ADv001';
const MASTER = staticFile(`${PASTA}/video/ADv 001 Certificações - Ori.mp4`);
const SSMS = staticFile(`${PASTA}/telas/SSMS IA.mp4`);
const PROGRAMANDO = staticFile(`${PASTA}/telas/Programando.mp4`);
const VOLUME = staticFile(`${PASTA}/telas/Volume de Dados.mp4`);
const CERTIFICADOS = staticFile(`${PASTA}/telas/Certificacoes Landry.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

const COR = {fundo: '#0A0A0A', azul: '#2EA3F2', amarelo: '#F5B800', branco: '#FFFFFF', cinza: '#9AA4AE'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const SOMBRA_TEXTO = '0 8px 30px rgba(0,0,0,.7)';

// Zona do rosto medida em projetos/001.ADv001/frames/sheet_rosto.jpg (1 quadro por segundo, vídeo inteiro).
const ROSTO: ZonaRosto = {x0: 280, y0: 440, x1: 860, y1: 1090};

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

// Cortes do CapCut: 6,10 e 11,87. As outras trocas caem nas pausas e viradas de frase.
const CENAS: Cena[] = [
  // 0 · gancho
  {ini: 0, fim: 2.85, tipo: 'cheio', trans: 0, zoom: (t) => rampa(t, [[0.05, 1], [2.85, 1.04]])},
  // 1 · certificados reais em tela cheia + DP-300
  {ini: 2.85, fim: 6.1, tipo: 'mini', trans: 0.8},
  // 2 · DP-300 ou DP-800; aproximação lenta na pergunta
  {ini: 6.1, fim: 11.87, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[6.9, 1], [9.15, 1.02], [11.4, 1.06]])},
  // 3 · corte 11,87 → punch-in seco (1,06 → 1,00)
  {ini: 11.87, fim: 14.35, tipo: 'cheio', trans: 0, zoom: (t) => rampa(t, [[11.87, 1.06], [13.0, 1.0], [14.35, 1.02]])},
  // 4 · LP deitada (só o topo)
  {ini: 14.35, fim: 17.49, tipo: 'split', trans: 1.0},
  // 5 · 4 aulas / gratuitas / ao vivo; punch-in seco na pausa 21,84 (ambas as certificações)
  {
    ini: 17.49,
    fim: 25.23,
    tipo: 'cheio',
    trans: 0.8,
    zoom: (t) => (t < 21.84 ? rampa(t, [[17.49, 1], [21.84, 1.03]]) : rampa(t, [[21.84, 1.07], [23.0, 1.0], [25.23, 1.02]])),
  },
  // 6 · na prática (Programando + lista) → SSMS (novos recursos de IA)
  {ini: 25.23, fim: 36.68, tipo: 'split', trans: 1.0},
  // 7 · Volume de Dados: busca vetorial + Microsoft Foundry
  {ini: 36.68, fim: 40.07, tipo: 'mini', trans: 0.8},
  // 8 · datas
  {ini: 40.07, fim: 46.39, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[40.9, 1], [46.39, 1.04]])},
  // 9 · CTA com a LP em pé
  {ini: 46.39, fim: 50.97, tipo: 'split', trans: 1.0},
  // 10 · fecho
  {ini: 50.97, fim: 99, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[51.8, 1], [55.45, 1.04]])},
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

// Fundo de tela cheia (cenas "mini"): fade de 12 quadros na entrada e 0,3 s na saída.
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
        position: 'absolute',
        left: x,
        top: y,
        transform: `${centro ? 'translateX(-50%) ' : ''}translateY(${(1 - s) * 30}px) scale(${0.85 + 0.15 * s}) rotate(${rot}deg)`,
        opacity: op,
        background: fundo,
        color: cor,
        fontWeight: 800,
        fontSize: tamanho,
        padding: `${tamanho * 0.3}px ${tamanho * 0.65}px`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        boxShadow: '0 12px 40px rgba(0,0,0,.45)',
        border: borda ? `2px solid ${COR.azul}` : undefined,
        letterSpacing: 1,
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
  t0,
  x,
  y,
  w,
  h,
  cor = 'rgba(46,163,242,.42)',
  dur = 0.5,
}) => {
  const t = useT();
  const p = interpolate(t, [t0, t0 + dur], [0, 1], {...clamp, easing: suave});
  return <div style={{position: 'absolute', left: x, top: y, width: w * p, height: h, background: cor, borderRadius: 6, mixBlendMode: 'screen'}} />;
};

// Contorno azul que se desenha em volta de um trecho de código.
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
        position: 'absolute',
        left: PAINEL.x,
        top: PAINEL.y,
        width: PAINEL.w,
        height: PAINEL.h,
        borderRadius: PAINEL.r,
        overflow: 'hidden',
        background: fundo,
        opacity: vis,
        transform: `translateY(${(1 - vis) * -40}px) scale(${0.96 + 0.04 * vis})`,
        boxShadow: '0 24px 70px rgba(0,0,0,.6), 0 0 0 2px rgba(46,163,242,.35)',
      }}
    >
      {children}
    </div>
  );
};

const Titulo: React.FC<{t0: number; t1?: number; top: number; tamanho?: number; children: React.ReactNode}> = ({
  t0,
  t1,
  top,
  tamanho = 104,
  children,
}) => {
  const m = useMola(t0, t1);
  if (!m.ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top, textAlign: 'center', color: COR.branco, fontWeight: 800, fontSize: tamanho,
        lineHeight: 1.05, opacity: m.op, transform: `scale(${0.8 + 0.2 * m.s})`, textShadow: SOMBRA_TEXTO, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

const Aparece: React.FC<{t0: number; children: React.ReactNode; cor?: string}> = ({t0, children, cor}) => {
  const m = useMola(t0);
  if (!m.ativo) return null;
  return <span style={{display: 'inline-block', color: cor, opacity: m.op, transform: `translateY(${(1 - m.s) * 24}px)`}}>{children}</span>;
};

// Selo de certificação num cartão branco (o DP-800 tem fundo branco e é pequeno; o cartão iguala os dois).
const Selo: React.FC<{t0: number; x: number; y: number; tam: number; src: string; pad?: number; centro?: boolean}> = ({
  t0,
  x,
  y,
  tam,
  src,
  pad = 8,
  centro = false,
}) => {
  const {s, op, ativo} = useMola(t0);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: tam, height: tam, borderRadius: tam * 0.15, background: '#FFFFFF', padding: pad,
        boxSizing: 'border-box', opacity: op,
        transform: `${centro ? 'translateX(-50%) ' : ''}translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`,
        boxShadow: '0 16px 50px rgba(0,0,0,.55), 0 0 0 3px rgba(46,163,242,.6)',
      }}
    >
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};

const AoVivo: React.FC<{t0: number; t1?: number; y: number}> = ({t0, t1, y}) => {
  const t = useT();
  const m = useMola(t0, t1);
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 1.6));
  if (!m.ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: W / 2, top: y, display: 'flex', alignItems: 'center', gap: 16, opacity: m.op,
        transform: `translateX(-50%) scale(${0.85 + 0.15 * m.s})`, background: 'rgba(10,10,10,.85)', padding: '14px 34px',
        borderRadius: 999, color: COR.branco, fontWeight: 800, fontSize: 50, boxShadow: '0 12px 40px rgba(0,0,0,.45)',
        border: `2px solid ${COR.azul}`,
      }}
    >
      <span style={{width: 28, height: 28, borderRadius: 14, background: '#FF3B30', opacity: pisca}} />
      AO VIVO
    </div>
  );
};

// ---------- Cenas sobre a câmera cheia ----------
const useCheio = (indice: number) => {
  const t = useT();
  const prox = CENAS[indice + 1];
  if (!prox) return 1;
  // corte seco (trans 0): some no quadro do corte
  if (prox.trans === 0) return t < prox.ini ? 1 : 0;
  return interpolate(t, [prox.ini, prox.ini + prox.trans * 0.4], [1, 0], clamp);
};

const Abertura: React.FC = () => {
  const vis = useCheio(0);
  const id = useMola(0.73);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={1.87} top={280} tamanho={96}>
        <span style={{color: COR.azul}}>CONQUISTAR</span>
      </Titulo>
      {id.ativo && (
        <div
          style={{
            position: 'absolute', left: 60, right: 60, top: 1130, height: 210, display: 'flex', alignItems: 'center', gap: 28,
            padding: '0 36px', borderRadius: 32, background: 'rgba(10,10,10,.82)', border: `2px solid ${COR.azul}`,
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
    </AbsoluteFill>
  );
};

const Escolha: React.FC = () => {
  const vis = useCheio(2);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {/* selos nas laterais da cabeça, "ou" no centro acima dela */}
      <Selo t0={6.1} x={36} y={300} tam={200} src={img('Dp-300.png')} />
      <Titulo t0={6.23} top={300} tamanho={72}>
        <span style={{color: COR.cinza}}>ou</span>
      </Titulo>
      {/* "nova" é dita antes do DP-800: a etiqueta entra junto com o selo, para não ficar solta no vazio */}
      <Pilula t0={8.1} x={W - 36 - 220 / 2} y={232} centro tamanho={34} fundo={COR.branco} cor="#111">
        NOVA
      </Pilula>
      <Selo t0={7.91} x={W - 36 - 220} y={300} tam={220} pad={4} src={img('DP-800.png')} />
      <Pilula t0={9.17} x={W / 2} y={1150} centro tamanho={50} fundo="rgba(10,10,10,.85)" borda>
        SQL Server
      </Pilula>
      <Pilula t0={10.31} x={W / 2} y={1255} centro tamanho={50}>
        + Inteligência Artificial
      </Pilula>
    </AbsoluteFill>
  );
};

const Convite: React.FC = () => {
  const vis = useCheio(3);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Pilula t0={13.61} x={W / 2} y={1170} centro tamanho={64}>
        UM CONVITE
      </Pilula>
    </AbsoluteFill>
  );
};

const QuatroAulas: React.FC = () => {
  const t = useT();
  const vis = useCheio(5);
  const n = Math.round(interpolate(t, [18.13, 18.6], [0, 4], clamp));
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={18.13} t1={21.6} top={255} tamanho={112}>
        <span style={{color: COR.azul}}>{n}</span> <Aparece t0={18.71}>AULAS</Aparece>
      </Titulo>
      <Pilula t0={19.25} t1={21.6} x={W / 2} y={385} centro tamanho={40}>
        100% GRATUITAS
      </Pilula>
      <AoVivo t0={20.67} t1={21.6} y={1160} />
      {/* depois do punch-in 21,84 */}
      <Titulo t0={21.91} top={270} tamanho={84}>
        CONTEÚDOS
        <br />
        <span style={{fontSize: 44}}>
          <Aparece t0={23.89} cor={COR.azul}>
            PARA AMBAS AS CERTIFICAÇÕES
          </Aparece>
        </span>
      </Titulo>
      <Selo t0={23.89} x={W / 2 - 20 - 200} y={1130} tam={200} src={img('Dp-300.png')} />
      <Selo t0={24.15} x={W / 2 + 20} y={1130} tam={200} pad={4} src={img('DP-800.png')} />
    </AbsoluteFill>
  );
};

const Datas: React.FC = () => {
  const t = useT();
  const vis = useCheio(8);
  const a = useMola(41.69);
  const b = useMola(43.51);
  const seta = interpolate(t, [43.51, 43.9], [0, 1], {...clamp, easing: suave});
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={40.49} top={290} tamanho={92}>
        AS AULAS
      </Titulo>
      {a.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 1120, display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 26, color: COR.branco, fontWeight: 800, fontSize: 104, textShadow: SOMBRA_TEXTO,
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
      )}
      <Pilula t0={44.95} x={W / 2} y={1255} centro tamanho={46}>
        sempre às 20h
      </Pilula>
    </AbsoluteFill>
  );
};

// Fecho: selos das certificações (o selo MCT não volta: o evento não forma MCT).
const Fecho: React.FC = () => (
  <AbsoluteFill>
    <Titulo t0={51.41} top={280} tamanho={84}>
      VENHA <Aparece t0={51.93} cor={COR.azul}>CONQUISTAR</Aparece>
    </Titulo>
    <Selo t0={53.51} x={W / 2 - 20 - 200} y={1130} tam={200} src={img('Dp-300.png')} />
    <Selo t0={53.75} x={W / 2 + 20} y={1130} tam={200} pad={4} src={img('DP-800.png')} />
  </AbsoluteFill>
);

// ---------- Fundos de tela cheia (atrás do card mini) ----------
const Certificados: React.FC = () => {
  const t = useT();
  const vis = visFundo(t, 1);
  return (
    <AbsoluteFill style={{opacity: vis, background: '#000'}}>
      <OffthreadVideo src={CERTIFICADOS} muted style={{width: W, height: H, filter: 'brightness(.72) saturate(.9)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.25) 35%, rgba(0,0,0,.15) 60%, rgba(0,0,0,.7) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center', fontWeight: 800, fontSize: 96, lineHeight: 1.08, color: COR.branco, textShadow: SOMBRA_TEXTO}}>
        <Aparece t0={2.93}>CERTIFICAÇÃO</Aparece>
        <br />
        <Aparece t0={3.89} cor={COR.azul}>
          MICROSOFT
        </Aparece>
      </div>
      <Selo t0={4.45} x={W / 2} y={620} tam={300} centro src={img('Dp-300.png')} />
    </AbsoluteFill>
  );
};

const VolumeDados: React.FC = () => {
  const t = useT();
  const vis = visFundo(t, 7);
  const brilho = 0.5 + 0.5 * Math.sin(Math.max(0, t - 37.41) * Math.PI * 1.2);
  const vet = useMola(37.41);
  return (
    <AbsoluteFill style={{opacity: vis, background: '#050a12'}}>
      <OffthreadVideo
        src={VOLUME}
        muted
        trimBefore={Math.round(2.0 * FPS)}
        style={{position: 'absolute', left: 0, top: -64, width: W, height: 2049, filter: 'grayscale(1) brightness(.6) sepia(1) hue-rotate(175deg) saturate(2.2)'}}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, rgba(0,0,0,.25), rgba(0,0,0,.75) 75%)'}} />
      <Titulo t0={37.07} top={420} tamanho={120}>
        BUSCA
      </Titulo>
      {vet.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontWeight: 800, fontSize: 120, color: COR.azul,
            opacity: vet.op, transform: `scale(${0.7 + 0.3 * vet.s})`,
            textShadow: `0 0 ${30 + 20 * brilho}px rgba(46,163,242,.75), 0 8px 30px rgba(0,0,0,.8)`,
          }}
        >
          VETORIAL
        </div>
      )}
      <Pilula t0={38.35} x={W / 2} y={790} centro tamanho={56} fundo="rgba(10,10,10,.9)" borda>
        + Microsoft Foundry
      </Pilula>
    </AbsoluteFill>
  );
};

// ---------- Cenas em tela dividida ----------
const VW = PAINEL.w;

const LP_DEITADA = {w: 1287, h: 805};
const BlocoEvento: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 4);
  const A: Rect = {x: 0, y: 0, w: 660, h: 414};
  const A2: Rect = {x: 20, y: 10, w: 611, h: 383};
  const rect = misturarRect(A, A2, interpolate(t, [14.8, 17.6], [0, 1], {...clamp, easing: suave}));
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={rect}>
        <div style={{position: 'relative', width: LP_DEITADA.w, height: LP_DEITADA.h}}>
          <Img src={img('LP Black Friday - Deitado.png')} style={{width: LP_DEITADA.w, height: LP_DEITADA.h}} />
          <MarcaTexto t0={15.99} x={80} y={86} w={556} h={8} cor={COR.azul} dur={0.6} />
        </div>
      </Enquadrado>
      <Pilula t0={16.35} x={790} y={150} tamanho={52} rot={-6}>
        2026
      </Pilula>
    </Painel>
  );
};

const Item: React.FC<{t0: number; y: number; children: React.ReactNode}> = ({t0, y, children}) => {
  const {s, op, ativo} = useMola(t0);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 60, top: y, display: 'flex', gap: 26, alignItems: 'center',
        opacity: op, transform: `translateX(${(1 - s) * -40}px)`, color: COR.branco, fontWeight: 800, fontSize: 62, lineHeight: 1.1,
        textShadow: SOMBRA_TEXTO,
      }}
    >
      <span
        style={{
          flex: '0 0 auto', width: 70, height: 70, borderRadius: 18, background: COR.azul, color: COR.branco,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, transform: `scale(${s})`,
        }}
      >
        ✓
      </span>
      <span>{children}</span>
    </div>
  );
};

// Painel "na prática": Programando escurecido e esfriado de fundo, lista que se monta.
const BlocoPratica: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 6);
  return (
    <Painel vis={vis} fundo="#000">
      <OffthreadVideo
        src={PROGRAMANDO}
        muted
        trimBefore={Math.round(1.0 * FPS)}
        style={{position: 'absolute', left: 0, top: -560, width: VW, height: VW * (1920 / 1080), filter: 'brightness(.42) saturate(.55)'}}
      />
      <AbsoluteFill style={{background: 'rgba(20,70,120,.45)', mixBlendMode: 'color'}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,.65), rgba(0,0,0,.15))'}} />
      <div style={{position: 'absolute', left: 60, top: 56, color: COR.branco, fontWeight: 800, fontSize: 76, letterSpacing: 1, textShadow: SOMBRA_TEXTO}}>
        <Aparece t0={25.23}>NA</Aparece> <Aparece t0={26.65} cor={COR.azul}>PRÁTICA</Aparece>
      </div>
      <Item t0={27.57} y={220}>Query Tuning</Item>
      <Item t0={28.63} y={340}>Segurança</Item>
      <Item t0={30.09} y={460}>Azure SQL Database</Item>
    </Painel>
  );
};

// SSMS cortado sempre na mesma posição: rente à aba "Embedd...(166)" (x 76, y 312 do SSMS).
// Entra por cima do painel "na prática" com fade de 12 quadros na pausa 31,55. Sem legenda enquanto aparece.
const SSMS_ABA = {x: 76, y: 312};
const SSMS_RECT: Rect = {x: SSMS_ABA.x, y: SSMS_ABA.y, w: 900, h: 565};
const SSMS_INI = 31.55;
const BlocoSSMS: React.FC = () => {
  const t = useT();
  const entra = interpolate(t, [SSMS_INI, SSMS_INI + 12 / FPS], [0, 1], clamp);
  const vis = Math.min(entra, visPainel(t, 6));
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          {/* src 5,8 s → ~9,9 s: CREATE EXTERNAL MODEL EmbeddingGemma, MODEL_TYPE = EMBEDDINGS */}
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(5.8 * FPS)} playbackRate={0.8} style={{width: 1080, height: 1920}} />
          <Contorno t0={35.69} x={196} y={672} w={430} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={32.33} x={VW / 2} y={560} centro tamanho={34} fundo="rgba(10,10,10,.9)" borda>
        novos recursos de IA
      </Pilula>
      <Pilula t0={35.69} x={620} y={20} tamanho={36}>
        EMBEDDINGS
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
  const zoom = interpolate(t, [47.23, 48.2], [0, 1], {...clamp, easing: suave});
  const pulso = t >= 47.23 ? 0.6 + 0.4 * Math.abs(Math.sin((t - 47.23) * Math.PI * 1.5)) : 0;
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
      <Pilula t0={49.19} x={30} y={26} tamanho={38} fundo={COR.amarelo} cor="#111">
        INSCRIÇÃO <Aparece t0={50.23}>GRATUITA</Aparece>
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
  cheio: {top: 1390, left: 50},
  split: {top: 893, left: 50},
  mini: {top: 1390, left: 410},
};

// Sem legenda sobre o SSMS (ficaria em cima do código) e enquanto a tipografia grande repete a fala.
const SEM_LEGENDA: [number, number][] = [
  [SSMS_INI, 36.68],
  [37.07, 40.07],
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
        opacity,
        position: 'absolute', left, right: 50, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
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
export const ADv001: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      {/* fundos de tela cheia (atrás do card mini) */}
      <Trecho de={2.85} dur={3.6}>
        <Certificados />
      </Trecho>
      <Trecho de={36.6} dur={3.9}>
        <VolumeDados />
      </Trecho>

      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: W, height: H}} />
      </CameraCard>

      {/* painéis das telas divididas */}
      <Trecho de={14.35} dur={4.0}>
        <BlocoEvento />
      </Trecho>
      <Trecho de={25.23} dur={6.6}>
        <BlocoPratica />
      </Trecho>
      <Trecho de={SSMS_INI} dur={6.0}>
        <BlocoSSMS />
      </Trecho>
      <Trecho de={46.39} dur={5.5}>
        <BlocoCTA />
      </Trecho>

      {/* elementos sobre a câmera cheia */}
      <Trecho de={0} dur={3.4}>
        <Abertura />
      </Trecho>
      <Trecho de={6.1} dur={6.2}>
        <Escolha />
      </Trecho>
      <Trecho de={11.87} dur={3.0}>
        <Convite />
      </Trecho>
      <Trecho de={17.49} dur={8.2}>
        <QuatroAulas />
      </Trecho>
      <Trecho de={40.07} dur={6.8}>
        <Datas />
      </Trecho>
      <Trecho de={50.97}>
        <Fecho />
      </Trecho>

      <Legenda de={i > 0 ? CENAS[i - 1].tipo : CENAS[0].tipo} para={CENAS[i].tipo} p={p} />
    </AbsoluteFill>
  );
};
