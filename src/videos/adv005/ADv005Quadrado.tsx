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
  misturarLayouts,
  painelEntrando,
  painelSaindo,
} from '../../_shared/split-vertical';
import {PALAVRAS} from './palavras';

// 001.ADv005 — versão QUADRADA 1:1 (Meta Ads). Mesmo roteiro e gatilhos da vertical (ADv005.tsx, aprovada);
// geometria do ADv004Quadrado. Sem card mini: Volume de Dados e Programando entram no painel da tela dividida.
// Plano: projetos/001.ADv005/plano.md

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});

export const W = 1080;
export const H = 1080;
export const FPS = 60;
export const DURACAO = 3472; // quadros do master (57,887 s)

// O master é vertical: 1080×1920. Câmera cheia: janela do master a partir de y 300.
const MW = 1080;
const MH = 1920;
const JANELA_Y = 300;

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
const VEU = 'rgba(10,10,10,.84)';

const ROSTO: ZonaRosto = {x0: 320, y0: 500, x1: 840, y1: 1060};

// ---------- Layouts ----------
const PAINEL: Retangulo = {x: 30, y: 30, w: 640, h: 860, r: 28};
const CARD_SPLIT: Retangulo = {x: 690, y: 30, w: 360, h: 1020, r: 32};
const SPLIT = layoutCard(CARD_SPLIT, ROSTO, MW, MH);

const layoutCheio = (zoom = 1): LayoutCamera => {
  const cx = (ROSTO.x0 + ROSTO.x1) / 2;
  const cy = (ROSTO.y0 + ROSTO.y1) / 2;
  const x = Math.min(0, Math.max(W - MW * zoom, cx - cx * zoom));
  const y = Math.min(0, Math.max(H - MH * zoom, cy - JANELA_Y - cy * zoom));
  return {card: {x: 0, y: 0, w: W, h: H, r: 0}, video: {x, y, scale: zoom}};
};

type Tipo = 'cheio' | 'split';
type Cena = {ini: number; fim: number; tipo: Tipo; trans: number; zoom?: (t: number) => number};

const rampa = (t: number, pts: [number, number][]) =>
  interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {...clamp, easing: suave});

// Mesmos tempos da vertical (ADv005.tsx, aprovada). Os cenários "mini" da vertical viram tela dividida aqui.
const CENAS: Cena[] = [
  {ini: 0, fim: 6.67, tipo: 'cheio', trans: 0, zoom: (t) => (t < 0.8 ? 1 : t < 6.0 ? rampa(t, [[0.8, 1.04], [6.0, 1.07]]) : 1.11)},
  {ini: 6.67, fim: 11.2, tipo: 'split', trans: 1.0}, // 1 · SSMS: busca vetorial
  {ini: 11.2, fim: 16.1, tipo: 'split', trans: 0.3}, // 2 · Volume de Dados: significado
  {ini: 16.1, fim: 21.57, tipo: 'split', trans: 0.3}, // 3 · SSMS vector(1024): SQL Server 2025
  {
    ini: 21.57,
    fim: 29.93,
    tipo: 'cheio',
    trans: 0.5,
    zoom: (t) => (t < 27.37 ? rampa(t, [[21.57, 1.0], [27.37, 1.04]]) : rampa(t, [[27.37, 1.09], [29.93, 1.1]])),
  },
  {ini: 29.93, fim: 33.42, tipo: 'split', trans: 0.8}, // 5 · LP (Black Friday)
  {ini: 33.42, fim: 36.6, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 34.78 ? rampa(t, [[33.42, 1], [34.78, 1.02]]) : rampa(t, [[34.78, 1.06], [36.6, 1.07]]))},
  {ini: 36.6, fim: 41.1, tipo: 'split', trans: 0.8}, // 7 · Programando: demonstrações práticas
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
  {ini: 51.5, fim: 55.6, tipo: 'split', trans: 1.0}, // 9 · CTA
  {ini: 55.6, fim: 99, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[56.2, 1], [57.89, 1.04]])},
];

const layoutDe = (c: Cena, t: number): LayoutCamera => (c.tipo === 'split' ? SPLIT : layoutCheio(c.zoom ? c.zoom(t) : 1));

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

// ---------- Cenas em tela dividida (painel 640×860 à esquerda) ----------
const VW = PAINEL.w;

// SSMS cortado rente à aba "Embedd...(166)"; enquadramento fixo do ADv002Quadrado/ADv003Quadrado.
const SSMS_RECT: Rect = {x: 76, y: 312, w: 850, h: 1142};

const LP_EMPE = {w: 658, h: 855};
const LpEmPe: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: 'relative', width: LP_EMPE.w, height: LP_EMPE.h}}>
    <Img src={img('LP Black Friday - EmPe.png')} style={{width: LP_EMPE.w, height: LP_EMPE.h}} />
    {children}
  </div>
);

// ---------- Cenas sobre a câmera cheia (faixa de cima 0–190, faixa de baixo 760–940, legenda em 950) ----------
const useCheio = (indice: number) => {
  const t = useT();
  const prox = CENAS[indice + 1];
  return prox ? interpolate(t, [prox.ini, prox.ini + Math.max(prox.trans * 0.4, 1 / FPS)], [1, 0], clamp) : 1;
};

const brilhoDe = (t: number, t0: number) => (t >= t0 ? 0.5 + 0.5 * Math.sin((t - t0) * Math.PI * 1.4) : 0);

// Selos: padrão aprovado (transparentes, mesma altura, brilho azul), no peito, acima da legenda.
const SELO_Y = 765;
const SELO_H = 175;
const SELO_DX = 112;

const Abertura: React.FC = () => {
  const vis = useCheio(0);
  const id = useMola(0.34, 3.5);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {id.ativo && (
        <div
          style={{
            position: 'absolute', left: 80, right: 80, top: 760, height: 170, display: 'flex', alignItems: 'center', gap: 24,
            padding: '0 30px', borderRadius: 28, background: VEU, border: `2px solid ${COR.azul}`,
            opacity: id.op, transform: `translateY(${(1 - id.s) * 40}px)`, boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          }}
        >
          <Img src={img('MCT.png')} style={{width: 140, height: 140}} />
          <div>
            <div style={{color: COR.branco, fontWeight: 800, fontSize: 50}}>Landry Duailibe</div>
            <div style={{color: COR.azul, fontWeight: 700, fontSize: 30, marginTop: 4}}>Microsoft Certified Trainer</div>
          </div>
        </div>
      )}
      <Titulo t0={2.98} t1={4.2} top={34} tamanho={52}>
        INTELIGÊNCIA <Aparece t0={3.84} cor={COR.azul}>ARTIFICIAL</Aparece>
      </Titulo>
      <Titulo t0={4.36} top={34} tamanho={60}>
        DIRETO NO <Aparece t0={6.0} cor={COR.azul}>SQL SERVER</Aparece>
      </Titulo>
    </AbsoluteFill>
  );
};

const Aprender: React.FC = () => {
  const t = useT();
  const vis = useCheio(4);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={21.8} t1={26.45} top={34} tamanho={72}>
        QUER <Aparece t0={22.1} cor={COR.azul}>APRENDER?</Aparece>
      </Titulo>
      <Pilula t0={23.58} t1={26.45} x={W / 2} y={790} centro tamanho={40} fundo={VEU} borda>
        IA · BUSCA VETORIAL
      </Pilula>
      <Titulo t0={26.66} top={34} tamanho={58}>
        NOVA <Aparece t0={27.16} cor={COR.azul}>CERTIFICAÇÃO</Aparece>
      </Titulo>
      <Selo t0={28.26} x={W / 2} y={SELO_Y} h={SELO_H} qual="dp800" brilho={brilhoDe(t, 28.26)} />
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
      <Titulo t0={34.08} top={30} tamanho={92}>
        <span style={{color: COR.azul}}>{n}</span> <Aparece t0={34.38}>AULAS</Aparece>
      </Titulo>
      <Pilula t0={34.78} x={W / 2} y={768} centro tamanho={52}>
        100% GRATUITAS
      </Pilula>
      {vivo.ativo && (
        <div
          style={{
            position: 'absolute', left: W / 2, top: 870, display: 'flex', alignItems: 'center', gap: 14, opacity: vivo.op,
            transform: `translateX(-50%) scale(${0.85 + 0.15 * vivo.s})`, background: VEU, padding: '8px 26px',
            borderRadius: 999, color: COR.branco, fontWeight: 800, fontSize: 36, boxShadow: '0 12px 40px rgba(0,0,0,.45)',
          }}
        >
          <span style={{width: 20, height: 20, borderRadius: 10, background: COR.vermelho, opacity: pisca}} />
          AO VIVO
        </div>
      )}
    </AbsoluteFill>
  );
};

const Certificacoes: React.FC = () => {
  const t = useT();
  const vis = useCheio(8);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={41.96} t1={46.4} top={30} tamanho={50}>
        CONTEÚDOS DAS <Aparece t0={43.7} cor={COR.azul}>CERTIFICAÇÕES</Aparece>
      </Titulo>
      <Selo t0={44.38} t1={46.4} x={W / 2 - SELO_DX} y={SELO_Y} h={SELO_H} qual="dp300" brilho={brilhoDe(t, 45.7)} />
      <Selo t0={45.7} t1={46.4} x={W / 2 + SELO_DX} y={SELO_Y} h={SELO_H} qual="dp800" brilho={brilhoDe(t, 45.7)} />
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
        <div style={{position: 'absolute', left: 0, right: 0, top: 752, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 22, color: COR.branco, fontWeight: 800, fontSize: 84, background: VEU,
              padding: '8px 36px', borderRadius: 28, boxShadow: '0 16px 50px rgba(0,0,0,.45)', border: '2px solid rgba(46,163,242,.55)',
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
      <Pilula t0={50.72} x={W / 2} y={878} centro tamanho={36}>
        às 20h · ao vivo
      </Pilula>
    </AbsoluteFill>
  );
};

const Fecho: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Pilula t0={55.9} x={W / 2} y={40} centro tamanho={52} fundo={COR.amarelo} cor="#111">
        INSCRIÇÃO <Aparece t0={57.02}>GRATUITA</Aparece>
      </Pilula>
      <Selo t0={55.9} x={W / 2 - SELO_DX} y={SELO_Y} h={SELO_H} qual="dp300" brilho={brilhoDe(t, 55.9)} />
      <Selo t0={55.9} x={W / 2 + SELO_DX} y={SELO_Y} h={SELO_H} qual="dp800" brilho={brilhoDe(t, 55.9)} />
    </AbsoluteFill>
  );
};

// ---------- Cenas em tela dividida (painel 640×860 à esquerda) ----------
const Grande: React.FC<{t0: number; t1?: number; top: number; cor?: string; tamanho?: number; children: React.ReactNode}> = ({
  t0, t1, top, cor = COR.branco, tamanho = 76, children,
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

const Sobre: React.FC<{t0: number; top: number; children: React.ReactNode}> = ({t0, top, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontWeight: 700, fontSize: 32, letterSpacing: 3, color: COR.cinza}}>
    <Aparece t0={t0}>{children}</Aparece>
  </div>
);

const BlocoBusca: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 1);
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(5.8 * FPS)} playbackRate={0.8} style={{width: 1080, height: 1920}} />
          <Contorno t0={8.78} x={196} y={672} w={430} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={8.16} x={300} y={14} tamanho={26}>
        BUSCA <Aparece t0={8.78}>VETORIAL</Aparece>
      </Pilula>
    </Painel>
  );
};

const Significado: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 2);
  const risco = interpolate(t, [15.12, 15.5], [0, 1], {...clamp, easing: suave});
  const ok = useMola(12.62);
  return (
    <Painel vis={vis} fundo="#050a12">
      <Enquadrado vw={VW} rect={{x: 0, y: 380, w: 1440, h: 1935}}>
        <OffthreadVideo
          src={VOLUME}
          muted
          trimBefore={Math.round(2.0 * FPS)}
          style={{width: 1440, height: 2732, filter: 'grayscale(1) brightness(.6) sepia(1) hue-rotate(175deg) saturate(2.2)'}}
        />
      </Enquadrado>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(0,0,0,.25), rgba(0,0,0,.75) 80%)'}} />
      <Sobre t0={11.3} top={130}>ENCONTRA PELO</Sobre>
      <Grande t0={11.3} top={185} cor={COR.azul}>
        SIGNIFICADO
      </Grande>
      <Grande t0={12.62} top={290} tamanho={46}>
        DA PERGUNTA
        {ok.ativo && <span style={{display: 'inline-block', marginLeft: 14, color: COR.azul, transform: `scale(${ok.s})`}}>✓</span>}
      </Grande>
      <Sobre t0={13.72} top={470}>NÃO APENAS PELAS</Sobre>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center'}}>
        <Aparece t0={14.62}>
          <span style={{position: 'relative', display: 'inline-block', fontWeight: 800, fontSize: 72, color: COR.branco, textShadow: SOMBRA_TEXTO}}>
            PALAVRAS
            <span style={{position: 'absolute', left: -8, top: '48%', height: 8, width: `calc(${risco} * (100% + 16px))`, background: COR.vermelho, borderRadius: 4}} />
          </span>
        </Aparece>
      </div>
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
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(19.6 * FPS)} playbackRate={0.55} style={{width: 1080, height: 1920}} />
          <Contorno t0={18.54} x={196} y={750} w={316} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={17.98} t1={19.7} x={300} y={14} tamanho={26}>
        NOVOS RECURSOS
      </Pilula>
      <Pilula t0={19.84} x={290} y={14} tamanho={26}>
        SQL SERVER <Aparece t0={20.56}>2025</Aparece>
      </Pilula>
    </Painel>
  );
};

const BlocoEvento: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 5);
  const A: Rect = {x: 11, y: 0, w: 636, h: 855};
  const A2: Rect = {x: 40, y: 10, w: 520, h: 699};
  const rect = misturarRect(A, A2, interpolate(t, [30.6, 33.2], [0, 1], {...clamp, easing: suave}));
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={rect}>
        <LpEmPe>
          <MarcaTexto t0={32.84} x={50} y={86} w={508} h={6} cor={COR.azul} dur={0.5} />
        </LpEmPe>
      </Enquadrado>
      <Pilula t0={31.48} x={452} y={92} tamanho={40} rot={-6}>
        2026
      </Pilula>
    </Painel>
  );
};

const Demonstracoes: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 7);
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={{x: 0, y: 250, w: 1080, h: 1451}}>
        <OffthreadVideo src={PROGRAMANDO} muted trimBefore={Math.round(2.0 * FPS)} style={{width: 1080, height: 1920, filter: 'brightness(.5) saturate(.55)'}} />
      </Enquadrado>
      <AbsoluteFill style={{background: 'rgba(20,70,120,.45)', mixBlendMode: 'color'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.15) 50%, rgba(0,0,0,.6) 100%)'}} />
      <Sobre t0={38.56} top={60}>DIRETO NO SQL SERVER</Sobre>
      <Grande t0={37.18} t1={40.0} top={130} tamanho={66}>
        DEMONSTRAÇÕES
        <br />
        <Aparece t0={37.88} cor={COR.azul}>PRÁTICAS</Aparece>
      </Grande>
      <Grande t0={40.2} top={130} tamanho={66}>
        INTELIGÊNCIA
        <br />
        <Aparece t0={40.72} cor={COR.azul}>ARTIFICIAL</Aparece>
      </Grande>
    </Painel>
  );
};

const BlocoCTA: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 9);
  const A: Rect = {x: 11, y: 0, w: 636, h: 855};
  const B: Rect = {x: 129, y: 317, w: 400, h: 538};
  const zoom = interpolate(t, [52.66, 53.6], [0, 1], {...clamp, easing: suave});
  const pulso = t >= 52.66 ? 0.6 + 0.4 * Math.abs(Math.sin((t - 52.66) * Math.PI * 1.5)) : 0;
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={misturarRect(A, B, zoom)}>
        <LpEmPe>
          {pulso > 0 && (
            <div
              style={{
                position: 'absolute', left: 132, top: 771, width: 352, height: 46, borderRadius: 26,
                border: `4px solid ${COR.amarelo}`, opacity: pulso, boxShadow: `0 0 ${20 * pulso}px ${COR.amarelo}`,
              }}
            />
          )}
        </LpEmPe>
      </Enquadrado>
      <Pilula t0={52.66} t1={54.3} x={24} y={24} tamanho={32} fundo={COR.amarelo} cor="#111">
        CLIQUE NO BOTÃO
      </Pilula>
      <Pilula t0={54.42} x={24} y={24} tamanho={32} fundo={COR.amarelo} cor="#111">
        OU LINK NO PERFIL
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

const POS_LEGENDA: Record<Tipo, {top: number; left: number; right: number}> = {
  cheio: {top: 950, left: 40, right: 40},
  split: {top: 905, left: 30, right: W - PAINEL.x - PAINEL.w},
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
  const {top, left, right} = POS_LEGENDA[p < 0.5 ? de : para];
  const opacity = p < 1 && de !== para ? interpolate(p, [0, 0.15, 0.85, 1], [1, 0, 0, 1], clamp) : 1;
  return (
    <div
      style={{
        opacity, position: 'absolute', left, right, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '4px 16px', fontWeight: 800, fontSize: (p < 0.5 ? de : para) === 'split' ? 42 : 50, lineHeight: 1.18, textTransform: 'uppercase',
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
export const ADv005Quadrado: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 30%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: MW, height: MH}} />
      </CameraCard>

      <Trecho de={6.67} dur={5.0}>
        <BlocoBusca />
      </Trecho>
      <Trecho de={11.2} dur={5.3}>
        <Significado />
      </Trecho>
      <Trecho de={16.1} dur={6.1}>
        <BlocoSQL2025 />
      </Trecho>
      <Trecho de={29.93} dur={4.4}>
        <BlocoEvento />
      </Trecho>
      <Trecho de={36.6} dur={5.4}>
        <Demonstracoes />
      </Trecho>
      <Trecho de={51.5} dur={5.0}>
        <BlocoCTA />
      </Trecho>

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
