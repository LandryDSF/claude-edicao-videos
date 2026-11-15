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

// 001.ADv003 — SQL Server 2025 e IA (embeddings, busca vetorial, DP-800) + chamada da Black Friday.
// Plano: projetos/001.ADv003/plano.md. Estrutura herdada do 001.ADv002 (aprovado).

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const DURACAO = 3680; // quadros do master (61,333 s)

const PASTA = '001.ADv003';
const MASTER = staticFile(`${PASTA}/video/ADv 003 ADv 003 SQL Server e IA - Original.mp4`);
const SSMS = staticFile(`${PASTA}/telas/SSMS IA.mp4`);
const PROGRAMANDO = staticFile(`${PASTA}/telas/Programando.mp4`);
const VOLUME = staticFile(`${PASTA}/telas/Volume de Dados.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

const COR = {fundo: '#0A0A0A', azul: '#2EA3F2', amarelo: '#F5B800', branco: '#FFFFFF', cinza: '#9AA4AE'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const SOMBRA_TEXTO = '0 8px 30px rgba(0,0,0,.7)';

// Zona do rosto medida em projetos/001.ADv003/frames/sheet_rosto.jpg (1 quadro por segundo, vídeo inteiro).
const ROSTO: ZonaRosto = {x0: 290, y0: 440, x1: 850, y1: 1060};

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

// Só um corte do CapCut (32,40). As outras trocas caem nas pausas da fala.
const CENAS: Cena[] = [
  // 0 · gancho; punch-in seco em "embeddings" (5,46)
  {ini: 0, fim: 6.42, tipo: 'cheio', trans: 0, zoom: (t) => (t < 5.46 ? rampa(t, [[0.02, 1], [5.46, 1.04]]) : 1.08)},
  // 1 · SSMS: vector(1024)
  {ini: 6.42, fim: 10.14, tipo: 'split', trans: 1.0},
  // 2 · Programando em tela cheia
  {ini: 10.14, fim: 13.54, tipo: 'mini', trans: 0.8},
  // 3 · busca semântica
  {ini: 13.54, fim: 16.66, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[13.54, 1], [16.66, 1.03]])},
  // 4 · Volume de Dados: significado × palavras
  {ini: 16.66, fim: 22.92, tipo: 'mini', trans: 0.8},
  // 5 · recursos + DP-800; punch-in seco em "relacionados" (27,00) e em "DP-800" (30,40)
  {
    ini: 22.92,
    fim: 32.4,
    tipo: 'cheio',
    trans: 0.8,
    zoom: (t) =>
      t < 27.0 ? rampa(t, [[22.92, 1], [27.0, 1.02]]) : t < 30.4 ? rampa(t, [[27.0, 1.05], [30.4, 1.06]]) : rampa(t, [[30.4, 1.06], [30.65, 1.08]]),
  },
  // 6 · corte 32,40 → LP deitada (só o topo)
  {ini: 32.4, fim: 35.6, tipo: 'split', trans: 1.0},
  // 7 · 4 aulas / 100% gratuitas; punch-in em "totalmente"
  {ini: 35.6, fim: 39.07, tipo: 'cheio', trans: 0.8, zoom: (t) => (t < 37.88 ? 1 : rampa(t, [[37.88, 1], [38.1, 1.06]]))},
  // 8 · SSMS CREATE EXTERNAL MODEL → certificações
  {ini: 39.07, fim: 46.66, tipo: 'split', trans: 1.0},
  // 9 · ao vivo + datas; punch-in seco em "30" (50,78)
  {
    ini: 46.66,
    fim: 55.0,
    tipo: 'cheio',
    trans: 0.8,
    zoom: (t) => (t < 50.78 ? rampa(t, [[46.66, 1], [50.78, 1.02]]) : rampa(t, [[50.78, 1.05], [52.0, 1.0], [55.0, 1.02]])),
  },
  // 10 · CTA com a LP em pé
  {ini: 55.0, fim: 59.18, tipo: 'split', trans: 1.0},
  // 11 · fecho limpo
  {ini: 59.18, fim: 99, tipo: 'cheio', trans: 0.8, zoom: (t) => rampa(t, [[59.9, 1], [61.33, 1.03]])},
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
        lineHeight: 1, opacity: m.op, transform: `scale(${0.8 + 0.2 * m.s})`, textShadow: SOMBRA_TEXTO, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

// Palavra que aparece com mola dentro de uma linha (para completar um título no tempo da fala).
const Aparece: React.FC<{t0: number; children: React.ReactNode; cor?: string}> = ({t0, children, cor}) => {
  const m = useMola(t0);
  if (!m.ativo) return null;
  return <span style={{display: 'inline-block', color: cor, opacity: m.op, transform: `translateY(${(1 - m.s) * 24}px)`}}>{children}</span>;
};

// ---------- Cenas sobre a câmera cheia ----------
const useCheio = (indice: number) => {
  const t = useT();
  const prox = CENAS[indice + 1];
  return prox ? interpolate(t, [prox.ini, prox.ini + prox.trans * 0.4], [1, 0], clamp) : 1;
};

const Abertura: React.FC = () => {
  const vis = useCheio(0);
  const id = useMola(0.76, 3.55);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={2.04} top={270} tamanho={100}>
        SQL Server <Aparece t0={2.64} cor={COR.azul}>2025</Aparece>
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
      <Pilula t0={3.78} t1={5.3} x={W / 2} y={1170} centro tamanho={48} fundo="rgba(10,10,10,.85)" borda>
        já disponível
      </Pilula>
      <Pilula t0={5.46} x={W / 2} y={1150} centro tamanho={68}>
        EMBEDDINGS
      </Pilula>
    </AbsoluteFill>
  );
};

const Semantica: React.FC = () => {
  const vis = useCheio(3);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={14.76} top={290} tamanho={84}>
        BUSCA <Aparece t0={15.68} cor={COR.azul}>SEMÂNTICA</Aparece>
      </Titulo>
    </AbsoluteFill>
  );
};

const SeloGrande: React.FC<{t0: number; src: string}> = ({t0, src}) => {
  const {s, op, ativo} = useMola(t0);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: W / 2 - 125, top: 1115, width: 250, height: 250, borderRadius: 38, background: '#FFFFFF', padding: 6,
        boxSizing: 'border-box', opacity: op, transform: `translateY(${(1 - s) * 50}px) scale(${0.6 + 0.4 * s})`,
        boxShadow: '0 16px 50px rgba(0,0,0,.55), 0 0 0 4px rgba(46,163,242,.7)',
      }}
    >
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};

const Recursos: React.FC = () => {
  const vis = useCheio(5);
  const nova = useMola(28.4);
  const cert = useMola(29.04);
  const item = (t0: number, y: number, txt: string) => (
    <Pilula t0={t0} t1={27.0} x={W / 2} y={y} centro tamanho={42} fundo="rgba(10,10,10,.85)" borda>
      <span style={{color: COR.azul}}>✓</span> {txt}
    </Pilula>
  );
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {item(24.12, 1118, 'Embeddings')}
      {item(24.74, 1200, 'Busca vetorial')}
      {item(25.36, 1282, 'Busca semântica')}
      <div style={{position: 'absolute', left: 0, right: 0, top: 285, display: 'flex', justifyContent: 'center', gap: 16}}>
        {nova.ativo && (
          <span
            style={{
              background: COR.branco, color: '#111', fontWeight: 800, fontSize: 36, padding: '10px 26px', borderRadius: 999,
              opacity: nova.op, transform: `scale(${0.7 + 0.3 * nova.s})`, boxShadow: '0 12px 40px rgba(0,0,0,.45)',
            }}
          >
            NOVA
          </span>
        )}
        {cert.ativo && (
          <span
            style={{
              background: COR.azul, color: COR.branco, fontWeight: 800, fontSize: 36, padding: '10px 26px', borderRadius: 999,
              opacity: cert.op, transform: `translateX(${(1 - cert.s) * 30}px)`, boxShadow: '0 12px 40px rgba(0,0,0,.45)',
              whiteSpace: 'nowrap',
            }}
          >
            CERTIFICAÇÃO MICROSOFT
          </span>
        )}
      </div>
      <SeloGrande t0={30.4} src={img('DP-800.png')} />
    </AbsoluteFill>
  );
};

const QuatroAulas: React.FC = () => {
  const t = useT();
  const vis = useCheio(7);
  const n = Math.round(interpolate(t, [37.02, 37.44], [0, 4], clamp));
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo t0={37.02} top={255} tamanho={112}>
        <span style={{color: COR.azul}}>{n}</span> <Aparece t0={37.44}>AULAS</Aparece>
      </Titulo>
      <Pilula t0={37.88} x={W / 2} y={385} centro tamanho={40}>
        100% GRATUITAS
      </Pilula>
    </AbsoluteFill>
  );
};

const Datas: React.FC = () => {
  const t = useT();
  const vis = useCheio(9);
  const a = useMola(50.78);
  const b = useMola(52.58);
  const seta = interpolate(t, [52.58, 52.96], [0, 1], {...clamp, easing: suave});
  const vivo = useMola(49.4, 50.6);
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 1.6));
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Pilula t0={47.6} t1={50.6} x={W / 2} y={1130} centro tamanho={46} fundo="rgba(10,10,10,.85)" borda>
        demonstrações práticas
      </Pilula>
      {vivo.ativo && (
        <div
          style={{
            position: 'absolute', left: W / 2, top: 1225, display: 'flex', alignItems: 'center', gap: 16, opacity: vivo.op,
            transform: `translateX(-50%) scale(${0.85 + 0.15 * vivo.s})`, background: 'rgba(10,10,10,.85)', padding: '12px 30px',
            borderRadius: 999, color: COR.branco, fontWeight: 800, fontSize: 40, boxShadow: '0 12px 40px rgba(0,0,0,.45)',
          }}
        >
          <span style={{width: 24, height: 24, borderRadius: 12, background: '#FF3B30', opacity: pisca}} />
          AO VIVO
        </div>
      )}
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
      <Pilula t0={54.36} x={W / 2} y={1255} centro tamanho={46}>
        às 20h · ao vivo
      </Pilula>
    </AbsoluteFill>
  );
};

const Fecho: React.FC = () => (
  <AbsoluteFill>
    <Pilula t0={60.06} x={W / 2} y={1200} centro tamanho={40} fundo={COR.amarelo} cor="#111">
      link abaixo ↓
    </Pilula>
  </AbsoluteFill>
);

// ---------- Fundos de tela cheia (atrás do card mini) ----------
const Programando: React.FC = () => {
  const t = useT();
  const vis = visFundo(t, 2);
  return (
    <AbsoluteFill style={{opacity: vis, background: '#000'}}>
      <OffthreadVideo
        src={PROGRAMANDO}
        muted
        trimBefore={Math.round(2.0 * FPS)}
        style={{width: W, height: H, filter: 'brightness(.5) saturate(.55)'}}
      />
      {/* esfria os tons quentes na direção do azul da marca */}
      <AbsoluteFill style={{background: 'rgba(20,70,120,.45)', mixBlendMode: 'color'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.1) 40%, rgba(0,0,0,.2) 70%, rgba(0,0,0,.6) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontWeight: 800, fontSize: 96, lineHeight: 1.1, color: COR.branco, textShadow: SOMBRA_TEXTO}}>
        <Aparece t0={12.36}>INTELIGÊNCIA</Aparece>
        <br />
        <Aparece t0={12.98} cor={COR.azul}>
          ARTIFICIAL
        </Aparece>
      </div>
    </AbsoluteFill>
  );
};

const VolumeDados: React.FC = () => {
  const t = useT();
  const vis = visFundo(t, 4);
  const risco = interpolate(t, [21.9, 22.3], [0, 1], {...clamp, easing: suave});
  const sig = useMola(19.18);
  const brilho = 0.5 + 0.5 * Math.sin(Math.max(0, t - 19.18) * Math.PI * 1.2);
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
        <Aparece t0={17.5}>INFORMAÇÕES</Aparece> <Aparece t0={18.36}>NO BANCO</Aparece>
      </div>
      {sig.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontWeight: 800, fontSize: 112, color: COR.azul,
            opacity: sig.op, transform: `scale(${0.7 + 0.3 * sig.s})`,
            textShadow: `0 0 ${30 + 20 * brilho}px rgba(46,163,242,.75), 0 8px 30px rgba(0,0,0,.8)`,
          }}
        >
          SIGNIFICADO
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontWeight: 700, fontSize: 60, color: COR.branco, textShadow: SOMBRA_TEXTO}}>
        <Aparece t0={20.62}>não só</Aparece>{' '}
        <Aparece t0={21.58}>
          <span style={{position: 'relative', display: 'inline-block', color: COR.cinza}}>
            palavras
            <span style={{position: 'absolute', left: -6, top: '52%', height: 7, width: `${104 * risco}%`, background: '#FF3B30', borderRadius: 4}} />
          </span>
        </Aparece>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Cenas em tela dividida ----------
const VW = PAINEL.w;

// SSMS cortado sempre na mesma posição: rente à aba "Embedd...(166)" (x 76, y 312 do SSMS).
const SSMS_ABA = {x: 76, y: 312};
const SSMS_RECT: Rect = {x: SSMS_ABA.x, y: SSMS_ABA.y, w: 900, h: 565};

const BlocoVetor: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 1);
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          {/* src 19,6 s → 22,8 s: tabela dbo.BlogChunks com a coluna Embedding vector(1024) */}
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(19.6 * FPS)} playbackRate={0.85} style={{width: 1080, height: 1920}} />
          <Contorno t0={7.4} x={196} y={750} w={316} h={44} />
        </div>
      </Enquadrado>
      <Pilula t0={7.4} x={600} y={20} tamanho={34}>
        BUSCA VETORIAL
      </Pilula>
      <Pilula t0={9.38} x={VW / 2} y={560} centro tamanho={34} fundo="rgba(10,10,10,.9)" borda>
        direto no banco de dados
      </Pilula>
    </Painel>
  );
};

const LP_DEITADA = {w: 1287, h: 805};
const BlocoEvento: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 6);
  const A: Rect = {x: 0, y: 0, w: 660, h: 414};
  const A2: Rect = {x: 20, y: 10, w: 611, h: 383};
  const rect = misturarRect(A, A2, interpolate(t, [33.4, 36.0], [0, 1], {...clamp, easing: suave}));
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={rect}>
        <div style={{position: 'relative', width: LP_DEITADA.w, height: LP_DEITADA.h}}>
          <Img src={img('LP Black Friday - Deitado.png')} style={{width: LP_DEITADA.w, height: LP_DEITADA.h}} />
          <MarcaTexto t0={34.46} x={80} y={86} w={556} h={8} cor={COR.azul} dur={0.6} />
        </div>
      </Enquadrado>
      <Pilula t0={34.94} x={790} y={150} tamanho={52} rot={-6}>
        2026
      </Pilula>
    </Painel>
  );
};

const SeloCartao: React.FC<{t0: number; x: number; src: string}> = ({t0, x, src}) => {
  const {s, op, ativo} = useMola(t0);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: 170, width: 300, height: 300, borderRadius: 40, background: '#FFFFFF', padding: 8,
        boxSizing: 'border-box', opacity: op, transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`,
        boxShadow: '0 16px 50px rgba(0,0,0,.55), 0 0 0 3px rgba(46,163,242,.6)',
      }}
    >
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};

const BlocoRecursosIA: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 8);
  const troca = interpolate(t, [44.66, 44.66 + 12 / FPS], [0, 1], clamp);
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 80% 0%, #0f2a40, #0b0d10 65%)">
      {troca < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - troca, background: '#1e1e1e'}}>
          <Enquadrado vw={VW} rect={SSMS_RECT}>
            <div style={{position: 'relative', width: 1080, height: 1920}}>
              {/* src 5,8 s → 10,3 s: CREATE EXTERNAL MODEL EmbeddingGemma, MODEL_TYPE = EMBEDDINGS */}
              <OffthreadVideo src={SSMS} muted trimBefore={Math.round(5.8 * FPS)} playbackRate={0.8} style={{width: 1080, height: 1920}} />
              <Contorno t0={41.54} x={196} y={672} w={430} h={44} />
            </div>
          </Enquadrado>
          <Pilula t0={42.32} x={VW / 2} y={560} centro tamanho={34} fundo="rgba(10,10,10,.9)" borda>
            IA no SQL Server 2025
          </Pilula>
        </div>
      )}
      {troca > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: troca}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 56, textAlign: 'center', color: COR.branco, fontWeight: 800, fontSize: 54, letterSpacing: 1}}>
            CERTIFICAÇÕES <span style={{color: COR.azul}}>MICROSOFT</span>
          </div>
          <SeloCartao t0={44.66} x={170} src={img('DP-800.png')} />
          <SeloCartao t0={45.58} x={550} src={img('Dp-300.png')} />
        </div>
      )}
    </Painel>
  );
};

const LP_EMPE = {w: 658, h: 855};
const BlocoCTA: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 10);
  const A: Rect = {x: 0, y: 300, w: 658, h: 413};
  const B: Rect = {x: 89, y: 545, w: 480, h: 301};
  const zoom = interpolate(t, [56.62, 57.6], [0, 1], {...clamp, easing: suave});
  const pulso = t >= 56.62 ? 0.6 + 0.4 * Math.abs(Math.sin((t - 56.62) * Math.PI * 1.5)) : 0;
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
      <Pilula t0={58.18} x={30} y={26} tamanho={38} fundo={COR.amarelo} cor="#111">
        INSCRIÇÃO GRATUITA
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

// Sem legenda enquanto a tipografia grande repete a fala.
const SEM_LEGENDA: [number, number][] = [
  [12.36, 13.54],
  [19.18, 22.92],
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
export const ADv003: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      {/* fundos de tela cheia (atrás do card mini) */}
      <Trecho de={10.0} dur={3.9}>
        <Programando />
      </Trecho>
      <Trecho de={16.5} dur={6.8}>
        <VolumeDados />
      </Trecho>

      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: W, height: H}} />
      </CameraCard>

      {/* painéis das telas divididas */}
      <Trecho de={6.42} dur={4.6}>
        <BlocoVetor />
      </Trecho>
      <Trecho de={32.4} dur={4.1}>
        <BlocoEvento />
      </Trecho>
      <Trecho de={39.07} dur={8.5}>
        <BlocoRecursosIA />
      </Trecho>
      <Trecho de={55.0} dur={5.1}>
        <BlocoCTA />
      </Trecho>

      {/* elementos sobre a câmera cheia */}
      <Trecho de={0} dur={7.0}>
        <Abertura />
      </Trecho>
      <Trecho de={13.54} dur={3.6}>
        <Semantica />
      </Trecho>
      <Trecho de={22.92} dur={10.0}>
        <Recursos />
      </Trecho>
      <Trecho de={35.6} dur={4.0}>
        <QuatroAulas />
      </Trecho>
      <Trecho de={46.66} dur={9.0}>
        <Datas />
      </Trecho>
      <Trecho de={59.18}>
        <Fecho />
      </Trecho>

      <Legenda de={i > 0 ? CENAS[i - 1].tipo : CENAS[0].tipo} para={CENAS[i].tipo} p={p} />
    </AbsoluteFill>
  );
};
