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

// 001.ADv002 — versão QUADRADA 1:1 (Meta Ads) da chamada da Black Friday SQL Server Expert 2026.
// Mesmo roteiro e gatilhos da vertical (ADv002.tsx); muda só a geometria. Plano: projetos/001.ADv002/plano.md

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});

export const W = 1080;
export const H = 1080;
export const FPS = 60;
export const DURACAO = 3134; // quadros do master

// O master é vertical: 1080×1920.
const MW = 1080;
const MH = 1920;
// Câmera cheia: janela do master em y 300–1380 (cabeça em ~290–690 no quadrado).
const JANELA_Y = 300;

const PASTA = '001.ADv002';
const MASTER = staticFile(`${PASTA}/video/ADv 002 4 aulas gratuitas - Original.mp4`);
const SSMS = staticFile(`${PASTA}/telas/SSMS IA.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

const COR = {fundo: '#0A0A0A', azul: '#2EA3F2', amarelo: '#F5B800', branco: '#FFFFFF', cinza: '#9AA4AE'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);

// Zona do rosto medida em frames/sheet_rosto.jpg (1 quadro por segundo, vídeo inteiro).
const ROSTO: ZonaRosto = {x0: 300, y0: 460, x1: 840, y1: 1060};

// ---------- Layouts ----------
// Tela dividida lado a lado: conteúdo à esquerda, câmera em card alto à direita.
const PAINEL: Retangulo = {x: 30, y: 30, w: 640, h: 860, r: 28};
const CARD_SPLIT: Retangulo = {x: 690, y: 30, w: 360, h: 1020, r: 32};
const SPLIT = layoutCard(CARD_SPLIT, ROSTO, MW, MH);

// Câmera cheia no quadrado, com zoom em torno do centro do rosto e sem borda preta.
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

// Os 6 cortes do CapCut (7,90 · 15,17 · 23,27 · 29,87 · 38,70 · 45,08) viram as trocas de cenário.
const CENAS: Cena[] = [
  {ini: 0, fim: 7.9, tipo: 'cheio', trans: 0, zoom: (t) => rampa(t, [[2.44, 1], [3.3, 1.06], [4.36, 1.06], [5.2, 1], [7.9, 1.03]])},
  // Site só no topo (logo + Black Friday); volta para a câmera em "serão quatro noites".
  {ini: 7.9, fim: 11.9, tipo: 'split', trans: 1.0},
  // O corte 15,17 cai dentro da câmera cheia: vira um punch-in seco (1,03 → 1,07) que relaxa até 1,00.
  {
    ini: 11.9,
    fim: 23.27,
    tipo: 'cheio',
    trans: 0.8,
    zoom: (t) => (t < 15.17 ? rampa(t, [[11.9, 1], [15.17, 1.03]]) : rampa(t, [[15.17, 1.07], [16.2, 1], [23.27, 1.03]])),
  },
  // SSMS só em tela dividida (no quadrado o card mini cobriria o código ou o resultado).
  {ini: 23.27, fim: 29.87, tipo: 'split', trans: 1.0},
  // split → split: a câmera fica parada, só o conteúdo do painel troca.
  {ini: 29.87, fim: 38.7, tipo: 'split', trans: 0.3},
  {ini: 38.7, fim: 45.08, tipo: 'cheio', trans: 1.0, zoom: (t) => rampa(t, [[38.7, 1], [45.08, 1.04]])},
  {ini: 45.08, fim: 50.9, tipo: 'split', trans: 1.0},
  {ini: 50.9, fim: 99, tipo: 'cheio', trans: 0.6, zoom: (t) => rampa(t, [[51.2, 1], [52.25, 1.03]])},
];

const layoutDe = (c: Cena, t: number): LayoutCamera =>
  c.tipo === 'split' ? SPLIT : layoutCheio(c.zoom ? c.zoom(t) : 1);

// Estado da câmera no tempo t: cena atual, progresso da transição de entrada e layout misturado.
const estado = (t: number) => {
  const i = Math.max(0, CENAS.findIndex((c) => t >= c.ini && t < c.fim));
  const c = CENAS[i];
  const p = c.trans > 0 && i > 0 ? interpolate(t, [c.ini, c.ini + c.trans], [0, 1], {...clamp, easing: suave}) : 1;
  const layout = p < 1 ? misturarLayouts(layoutDe(CENAS[i - 1], c.ini), layoutDe(c, t), p) : layoutDe(c, t);
  // "dividido" vai de 0 (câmera cheia) a 1 (card): guia a legenda e o fundo.
  const div = (k: Tipo) => (k === 'cheio' ? 0 : 1);
  const dividido = i > 0 ? div(CENAS[i - 1].tipo) + (div(c.tipo) - div(CENAS[i - 1].tipo)) * p : 0;
  return {i, cena: c, p, layout, dividido};
};

// Visibilidade de um painel de cena dividida: entra com a câmera (70%→100%) e sai com a próxima transição.
const visPainel = (t: number, indice: number) => {
  const c = CENAS[indice];
  const prox = CENAS[indice + 1];
  const pIn = interpolate(t, [c.ini, c.ini + c.trans], [0, 1], {...clamp, easing: suave});
  const pOut = prox ? interpolate(t, [prox.ini, prox.ini + prox.trans], [0, 1], {...clamp, easing: suave}) : 0;
  if (t < c.ini || (prox && t > prox.ini + prox.trans)) return 0;
  return painelEntrando(pIn) * (pOut > 0 ? painelSaindo(pOut) : 1);
};

// ---------- Peças ----------
// Dentro de <Sequence> o quadro é relativo; todos os tempos aqui são ABSOLUTOS (segundos do master).
const Deslocamento = React.createContext(0);
const useQuadro = () => useCurrentFrame() + React.useContext(Deslocamento);
const useT = () => {
  const frame = useQuadro();
  const {fps} = useVideoConfig();
  return frame / fps;
};
// Sequence com premount, cujo conteúdo continua lendo o tempo absoluto.
const Trecho: React.FC<{de: number; dur?: number; children: React.ReactNode}> = ({de, dur, children}) => {
  const from = Math.round(de * FPS);
  return (
    <Sequence from={from} durationInFrames={dur ? Math.round(dur * FPS) : undefined} premountFor={FPS}>
      <Deslocamento.Provider value={from}>{children}</Deslocamento.Provider>
    </Sequence>
  );
};

// Entrada com mola a partir do segundo `t0` e saída suave em `t1`.
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
  children: React.ReactNode;
}> = ({t0, t1, x, y, fundo = COR.azul, cor = COR.branco, tamanho = 44, centro = false, rot = 0, children}) => {
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
        letterSpacing: 1,
      }}
    >
      {children}
    </div>
  );
};

// Imagem enquadrada num viewport: `rect` (em pixels da imagem) ocupa o viewport inteiro.
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

// Marca-texto que varre da esquerda para a direita, em coordenadas da imagem (acompanha o zoom).
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

// ---------- Cenas sobre a câmera cheia ----------
// Visível só enquanto a câmera está cheia: some nos primeiros 40% da transição seguinte.
const useCheio = (indice: number) => {
  const t = useT();
  const prox = CENAS[indice + 1];
  return prox ? interpolate(t, [prox.ini, prox.ini + prox.trans * 0.4], [1, 0], clamp) : 1;
};

const Titulo: React.FC<{mola: {s: number; op: number; ativo: boolean}; children: React.ReactNode}> = ({mola, children}) =>
  mola.ativo ? (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top: 28, textAlign: 'center', color: COR.branco,
        fontWeight: 800, fontSize: 100, lineHeight: 1, opacity: mola.op, transform: `scale(${0.8 + 0.2 * mola.s})`,
        textShadow: '0 8px 30px rgba(0,0,0,.65)',
      }}
    >
      {children}
    </div>
  ) : null;

const Abertura: React.FC = () => {
  const t = useT();
  const vis = useCheio(0);
  const id = useMola(0.72, 4.0);
  const n = Math.round(interpolate(t, [1.34, 1.8], [0, 4], clamp));
  const aulas = useMola(1.34);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo mola={aulas}>
        <span style={{color: COR.azul}}>{n}</span> AULAS
      </Titulo>
      <Pilula t0={3.3} x={W / 2} y={145} centro tamanho={36}>
        100% GRATUITAS
      </Pilula>
      {id.ativo && (
        <div
          style={{
            position: 'absolute', left: 80, right: 80, top: 755, height: 170, display: 'flex', alignItems: 'center', gap: 24,
            padding: '0 30px', borderRadius: 28, background: 'rgba(10,10,10,.82)', border: `2px solid ${COR.azul}`,
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
      <Pilula t0={4.36} x={W / 2} y={770} centro tamanho={44} fundo="rgba(10,10,10,.85)">
        SQL Server
      </Pilula>
      <Pilula t0={5.58} x={W / 2} y={858} centro tamanho={44}>
        Inteligência Artificial
      </Pilula>
    </AbsoluteFill>
  );
};

const SELO = 190;
const Selo: React.FC<{t0: number; x: number; src: string; pad?: number}> = ({t0, x, src, pad = 9}) => {
  const {s, op, ativo} = useMola(t0);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: 90, width: SELO, height: SELO, borderRadius: 30, background: '#FFFFFF', padding: pad,
        boxSizing: 'border-box', opacity: op, transform: `translateY(${(1 - s) * -40}px) scale(${0.7 + 0.3 * s})`,
        boxShadow: '0 16px 50px rgba(0,0,0,.55), 0 0 0 3px rgba(46,163,242,.6)',
      }}
    >
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};

const Certificacoes: React.FC = () => {
  const vis = useCheio(2);
  const noites = useMola(12.06, 15.0);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Titulo mola={noites}>
        <span style={{color: COR.azul}}>4</span> NOITES
      </Titulo>
      <Pilula t0={13.96} t1={15.0} x={W / 2} y={790} centro tamanho={44} fundo="rgba(10,10,10,.85)">
        Muito conhecimento técnico
      </Pilula>
      <Pilula t0={15.4} t1={18.6} x={W / 2} y={790} centro tamanho={44} fundo="rgba(10,10,10,.85)">
        Demonstrações práticas
      </Pilula>
      <Pilula t0={18.88} x={W / 2} y={26} centro tamanho={30}>
        CERTIFICAÇÕES MICROSOFT
      </Pilula>
      <Selo t0={20.52} x={30} src={img('Dp-300.png')} />
      <Selo t0={22.04} x={W - 30 - SELO} src={img('DP-800.png')} pad={4} />
    </AbsoluteFill>
  );
};

const Datas: React.FC = () => {
  const t = useT();
  const vis = useCheio(5);
  const a = useMola(39.94);
  const b = useMola(41.52);
  const seta = interpolate(t, [41.52, 41.9], [0, 1], {...clamp, easing: suave});
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {a.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 745, display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 24, color: COR.branco, fontWeight: 800, fontSize: 96, textShadow: '0 8px 30px rgba(0,0,0,.7)',
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
      <Pilula t0={43.42} x={W / 2} y={865} centro tamanho={40}>
        às 20h · ao vivo
      </Pilula>
    </AbsoluteFill>
  );
};

const Fecho: React.FC = () => (
  <AbsoluteFill>
    <Pilula t0={51.22} x={W / 2} y={840} centro tamanho={38} fundo={COR.amarelo} cor="#111">
      link abaixo ↓
    </Pilula>
  </AbsoluteFill>
);

// ---------- Cenas em tela dividida (painel 640×860 à esquerda) ----------
const VW = PAINEL.w;

const LP_EMPE = {w: 658, h: 855};
const LpEmPe: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: 'relative', width: LP_EMPE.w, height: LP_EMPE.h}}>
    <Img src={img('LP Black Friday - EmPe.png')} style={{width: LP_EMPE.w, height: LP_EMPE.h}} />
    {children}
  </div>
);

// Painel vertical: a LP em pé, do logo até o formulário, com aproximação lenta.
const BlocoEvento: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 1);
  const A: Rect = {x: 11, y: 0, w: 636, h: 855};
  const A2: Rect = {x: 40, y: 10, w: 520, h: 699};
  const rect = misturarRect(A, A2, interpolate(t, [9.0, 12.0], [0, 1], {...clamp, easing: suave}));
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={rect}>
        <LpEmPe>
          <MarcaTexto t0={10.32} x={50} y={86} w={508} h={6} cor={COR.azul} dur={0.6} />
        </LpEmPe>
      </Enquadrado>
      <Pilula t0={10.8} x={440} y={168} tamanho={46} rot={-6}>
        2026
      </Pilula>
    </Painel>
  );
};

// SSMS sempre cortado rente à aba da query "Embedd...(166)" (borda da aba em x 82, y 315 do SSMS).
// Enquadramento único e fixo: largo o bastante para as linhas inteiras (até o fim da URL) e para o resultado.
const SSMS_ABA = {x: 76, y: 312};
const SSMS_RECT: Rect = {x: SSMS_ABA.x, y: SSMS_ABA.y, w: 850, h: 1142};
const BlocoSSMS: React.FC = () => {
  const t = useT();
  const {fps} = useVideoConfig();
  const vis = visPainel(t, 3);
  // troca de trecho do SSMS com fade de 12 quadros em 26,5
  const fade = interpolate(t, [26.5, 26.5 + 12 / fps], [0, 1], clamp);
  return (
    <Painel vis={vis} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_RECT}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          {/* Sequences relativas ao Trecho do bloco (que começa em 23,27 s) */}
          <Sequence from={0} durationInFrames={Math.round(3.5 * fps)}>
            <OffthreadVideo src={SSMS} muted trimBefore={Math.round(0.5 * fps)} playbackRate={2} style={{width: 1080, height: 1920, opacity: 1 - fade}} />
          </Sequence>
          <Sequence from={Math.round((26.4 - 23.27) * fps)} durationInFrames={Math.round(4.0 * fps)} premountFor={fps}>
            <OffthreadVideo src={SSMS} muted trimBefore={Math.round(12.0 * fps)} playbackRate={1.9} style={{width: 1080, height: 1920, opacity: fade}} />
          </Sequence>
          <MarcaTexto t0={28.06} x={100} y={1185} w={940} h={140} cor="rgba(46,163,242,.30)" dur={0.6} />
        </div>
      </Enquadrado>
      <Pilula t0={26.18} x={358} y={802} tamanho={28}>
        SQL Server 2025
      </Pilula>
      <Pilula t0={27.22} x={24} y={800} tamanho={30}>
        Azure
      </Pilula>
      <Pilula t0={28.06} x={160} y={800} tamanho={30} fundo={COR.branco} cor="#111">
        + IA
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
        position: 'absolute', left: 40, top: y, width: 560, display: 'flex', gap: 20, alignItems: 'flex-start',
        opacity: op, transform: `translateX(${(1 - s) * -40}px)`, color: COR.branco, fontWeight: 700, fontSize: 42, lineHeight: 1.15,
      }}
    >
      <span
        style={{
          flex: '0 0 auto', width: 52, height: 52, borderRadius: 14, background: COR.azul, color: COR.branco,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, transform: `scale(${s})`,
        }}
      >
        ✓
      </span>
      <span>{children}</span>
    </div>
  );
};

const BlocoEntregaveis: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 4);
  const capa = useMola(35.32);
  const vivo = useMola(37.68);
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 1.6));
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 80% 0%, #0f2a40, #0b0d10 65%)">
      <div style={{position: 'absolute', left: 40, top: 36, color: COR.branco, fontWeight: 800, fontSize: 60, letterSpacing: 1}}>
        E TEM <span style={{color: COR.azul}}>MAIS</span>
      </div>
      <Item t0={31.14} y={145}>Simulados</Item>
      <Item t0={32.44} y={230}>Orientações para DP-300 e DP-800</Item>
      <Item t0={35.32} y={365}>eBooks gratuitos</Item>
      {capa.ativo && (
        <Img
          src={img('eBook.png')}
          style={{
            position: 'absolute', left: 340, top: 455, width: 250, height: 335, borderRadius: 10,
            opacity: capa.op, transform: `translateY(${(1 - capa.s) * 60}px) rotate(${4 * capa.s}deg)`,
            boxShadow: '0 24px 60px rgba(0,0,0,.7), 0 0 0 2px rgba(46,163,242,.5)',
          }}
        />
      )}
      {vivo.ativo && (
        <div
          style={{
            position: 'absolute', left: 40, top: 480, display: 'flex', alignItems: 'center', gap: 14, opacity: vivo.op,
            transform: `scale(${0.85 + 0.15 * vivo.s})`, transformOrigin: 'left center', background: 'rgba(255,255,255,.08)',
            padding: '10px 24px', borderRadius: 999, color: COR.branco, fontWeight: 800, fontSize: 34,
          }}
        >
          <span style={{width: 20, height: 20, borderRadius: 10, background: '#FF3B30', opacity: pisca}} />
          AO VIVO
        </div>
      )}
    </Painel>
  );
};

const BlocoCTA: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 6);
  const A: Rect = {x: 11, y: 0, w: 636, h: 855};
  const B: Rect = {x: 129, y: 317, w: 400, h: 538};
  const zoom = interpolate(t, [45.64, 46.6], [0, 1], {...clamp, easing: suave});
  const pulso = t >= 47.34 ? 0.6 + 0.4 * Math.abs(Math.sin((t - 47.34) * Math.PI * 1.5)) : 0;
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
      <Pilula t0={47.34} x={24} y={24} tamanho={32} fundo={COR.amarelo} cor="#111">
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
  // Cada bloco fica até o próximo começar (no máximo +0,6 s depois da última palavra).
  return out.map((b, i) => ({...b, e: Math.min(out[i + 1]?.s ?? b.e + 0.6, b.e + 0.6)}));
})();

// Posição da legenda em cada cenário. Câmera cheia: faixa de baixo, abaixo do queixo.
// Tela dividida: abaixo do painel, na coluna da esquerda.
const POS_LEGENDA: Record<Tipo, {top: number; left: number; right: number}> = {
  cheio: {top: 950, left: 40, right: 40},
  split: {top: 905, left: 30, right: W - PAINEL.x - PAINEL.w},
};

// Na transição a legenda some (15%→85%) e reaparece já no lugar novo: nunca atravessa o rosto.
const Legenda: React.FC<{de: Tipo; para: Tipo; p: number}> = ({de, para, p}) => {
  const frame = useQuadro();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const bloco = BLOCOS.find((b) => t >= b.s && t < b.e);
  if (!bloco) return null;
  const {top, left, right} = POS_LEGENDA[p < 0.5 ? de : para];
  // split → split: a legenda não precisa sumir (a câmera não se move)
  const opacity = p < 1 && de !== para ? interpolate(p, [0, 0.15, 0.85, 1], [1, 0, 0, 1], clamp) : 1;
  return (
    <div
      style={{
        opacity,
        position: 'absolute', left, right, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '4px 16px', fontWeight: 800, fontSize: 50, lineHeight: 1.18, textTransform: 'uppercase',
      }}
    >
      {bloco.palavras
        .filter((p) => t >= p.s)
        .map((p) => {
          const pop = spring({frame: frame - p.s * fps, fps, config: {damping: 16, stiffness: 220}});
          const ativa = t >= p.s && t < p.e + 0.08;
          return (
            <span
              key={PALAVRAS.indexOf(p)} // índice: "eu" e "preparei" começam no mesmo instante (0,72 s)
              style={{
                display: 'inline-block', color: ativa ? COR.azul : COR.branco, transform: `scale(${0.8 + 0.2 * pop})`,
                textShadow: '0 4px 4px rgba(0,0,0,.85), 0 0 24px rgba(0,0,0,.7)',
              }}
            >
              {p.w.replace(/[.,!?]$/, '')}
            </span>
          );
        })}
    </div>
  );
};

// ---------- Composição ----------
export const ADv002Quadrado: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      {/* fundo das telas divididas */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 30%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      {/* câmera: UMA instância contínua do master (vertical 1080×1920), com o áudio original */}
      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: MW, height: MH}} />
      </CameraCard>

      {/* painéis das telas divididas */}
      <Trecho de={7.9} dur={5.0}>
        <BlocoEvento />
      </Trecho>
      <Trecho de={23.27} dur={7.3}>
        <BlocoSSMS />
      </Trecho>
      <Trecho de={29.87} dur={9.9}>
        <BlocoEntregaveis />
      </Trecho>
      <Trecho de={45.08} dur={6.6}>
        <BlocoCTA />
      </Trecho>

      {/* elementos sobre a câmera cheia */}
      <Trecho de={0} dur={8.6}>
        <Abertura />
      </Trecho>
      <Trecho de={11.9} dur={12.0}>
        <Certificacoes />
      </Trecho>
      <Trecho de={38.7} dur={7.0}>
        <Datas />
      </Trecho>
      <Trecho de={50.9}>
        <Fecho />
      </Trecho>

      <Legenda de={i > 0 ? CENAS[i - 1].tipo : CENAS[0].tipo} para={CENAS[i].tipo} p={p} />
    </AbsoluteFill>
  );
};
