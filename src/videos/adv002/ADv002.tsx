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

// 001.ADv002 — chamada vertical da Black Friday SQL Server Expert 2026. Plano: projetos/001.ADv002/plano.md

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const DURACAO = 3134; // quadros do master

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
const PAINEL: Retangulo = {x: 30, y: 230, w: 1020, h: 640, r: 32};
const CARD_SPLIT: Retangulo = {x: 30, y: 1000, w: 1020, h: 880, r: 36};
const CARD_MINI: Retangulo = {x: 40, y: 1240, w: 340, h: 420, r: 28};
const SPLIT = layoutCard(CARD_SPLIT, ROSTO, W, H);
const MINI = layoutCard(CARD_MINI, ROSTO, W, H);

type Tipo = 'cheio' | 'split' | 'mini';
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
  {ini: 23.27, fim: 26.5, tipo: 'split', trans: 1.0},
  {ini: 26.5, fim: 29.87, tipo: 'mini', trans: 0.8},
  {ini: 29.87, fim: 38.7, tipo: 'split', trans: 1.0},
  {ini: 38.7, fim: 45.08, tipo: 'cheio', trans: 1.0, zoom: (t) => rampa(t, [[38.7, 1], [45.08, 1.04]])},
  {ini: 45.08, fim: 50.9, tipo: 'split', trans: 1.0},
  {ini: 50.9, fim: 99, tipo: 'cheio', trans: 0.6, zoom: (t) => rampa(t, [[51.2, 1], [52.25, 1.03]])},
];

const layoutDe = (c: Cena, t: number): LayoutCamera =>
  c.tipo === 'split' ? SPLIT : c.tipo === 'mini' ? MINI : layoutCheio(W, H, ROSTO, c.zoom ? c.zoom(t) : 1);

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

const Abertura: React.FC = () => {
  const t = useT();
  const vis = useCheio(0);
  const id = useMola(0.72, 4.0);
  const n = Math.round(interpolate(t, [1.34, 1.8], [0, 4], clamp));
  const aulas = useMola(1.34);
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {aulas.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center', color: COR.branco,
            fontWeight: 800, fontSize: 112, lineHeight: 1, opacity: aulas.op, transform: `scale(${0.8 + 0.2 * aulas.s})`,
            textShadow: '0 8px 30px rgba(0,0,0,.65)',
          }}
        >
          <span style={{color: COR.azul}}>{n}</span> AULAS
        </div>
      )}
      <Pilula t0={3.3} x={W / 2} y={385} centro tamanho={40}>
        100% GRATUITAS
      </Pilula>
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
      <Pilula t0={4.36} x={W / 2} y={1150} centro tamanho={50} fundo="rgba(10,10,10,.85)">
        SQL Server
      </Pilula>
      <Pilula t0={5.58} x={W / 2} y={1260} centro tamanho={50}>
        Inteligência Artificial
      </Pilula>
    </AbsoluteFill>
  );
};

const Selo: React.FC<{t0: number; x: number; src: string; pad?: number}> = ({t0, x, src, pad = 10}) => {
  const {s, op, ativo} = useMola(t0);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: 300, width: 220, height: 220, borderRadius: 34, background: '#FFFFFF', padding: pad,
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
      {noites.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center', color: COR.branco,
            fontWeight: 800, fontSize: 112, lineHeight: 1, opacity: noites.op, transform: `scale(${0.8 + 0.2 * noites.s})`,
            textShadow: '0 8px 30px rgba(0,0,0,.65)',
          }}
        >
          <span style={{color: COR.azul}}>4</span> NOITES
        </div>
      )}
      <Pilula t0={13.96} t1={15.0} x={W / 2} y={1170} centro tamanho={48} fundo="rgba(10,10,10,.85)">
        Muito conhecimento técnico
      </Pilula>
      <Pilula t0={15.4} t1={18.6} x={W / 2} y={1170} centro tamanho={48} fundo="rgba(10,10,10,.85)">
        Demonstrações práticas
      </Pilula>
      <Pilula t0={18.88} x={W / 2} y={240} centro tamanho={32}>
        CERTIFICAÇÕES MICROSOFT
      </Pilula>
      <Selo t0={20.52} x={36} src={img('Dp-300.png')} />
      <Selo t0={22.04} x={W - 36 - 220} src={img('DP-800.png')} pad={4} />
    </AbsoluteFill>
  );
};

const Datas: React.FC = () => {
  const t = useT();
  const vis = useCheio(6);
  const a = useMola(39.94);
  const b = useMola(41.52);
  const seta = interpolate(t, [41.52, 41.9], [0, 1], {...clamp, easing: suave});
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {a.ativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 1120, display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 26, color: COR.branco, fontWeight: 800, fontSize: 104, textShadow: '0 8px 30px rgba(0,0,0,.7)',
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
      <Pilula t0={43.42} x={W / 2} y={1255} centro tamanho={46}>
        às 20h · ao vivo
      </Pilula>
    </AbsoluteFill>
  );
};

const Fecho: React.FC = () => (
  <AbsoluteFill>
    <Pilula t0={51.22} x={W / 2} y={1200} centro tamanho={40} fundo={COR.amarelo} cor="#111">
      link abaixo ↓
    </Pilula>
  </AbsoluteFill>
);

// ---------- Cenas em tela dividida ----------
const VW = PAINEL.w;

const LP_DEITADA = {w: 1287, h: 805};
const BlocoEvento: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 1);
  // Só o topo do site (logo + faixa Black Friday), com aproximação lenta.
  const A: Rect = {x: 0, y: 0, w: 660, h: 414};
  const A2: Rect = {x: 20, y: 10, w: 611, h: 383};
  const rect = misturarRect(A, A2, interpolate(t, [9.0, 12.0], [0, 1], {...clamp, easing: suave}));
  return (
    <Painel vis={vis} fundo="#000">
      <Enquadrado vw={VW} rect={rect}>
        <div style={{position: 'relative', width: LP_DEITADA.w, height: LP_DEITADA.h}}>
          <Img src={img('LP Black Friday - Deitado.png')} style={{width: LP_DEITADA.w, height: LP_DEITADA.h}} />
          <MarcaTexto t0={10.32} x={80} y={86} w={556} h={8} cor={COR.azul} dur={0.6} />
        </div>
      </Enquadrado>
      <Pilula t0={10.8} x={790} y={150} tamanho={52} rot={-6}>
        2026
      </Pilula>
    </Painel>
  );
};

// SSMS: primeiro só o CREATE EXTERNAL MODEL ampliado (split), depois tela cheia com o resultado.
// Começa na borda esquerda do editor (números das linhas visíveis) e vai até o fim das linhas mais longas.
// Corte fixo rente à aba da query "Embedd...(166)" (borda da aba em x 82, y 315 do SSMS, igual no vídeo inteiro).
const SSMS_ABA = {x: 76, y: 312};
const SSMS_SPLIT_RECT: Rect = {x: SSMS_ABA.x, y: SSMS_ABA.y, w: 900, h: 565};
const BlocoSSMS: React.FC = () => {
  const t = useT();
  const {fps} = useVideoConfig();
  const entra = visPainel(t, 3);
  // fade de 12 quadros para a tela cheia em 26,5
  const sai = interpolate(t, [26.5, 26.5 + 12 / fps], [1, 0], clamp);
  return (
    <Painel vis={Math.min(entra, sai)} fundo="#1e1e1e">
      <Enquadrado vw={VW} rect={SSMS_SPLIT_RECT}>
        <OffthreadVideo src={SSMS} muted trimBefore={Math.round(0.5 * fps)} playbackRate={2} style={{width: 1080, height: 1920}} />
      </Enquadrado>
      <Pilula t0={26.18} x={600} y={24} tamanho={36}>
        SQL Server 2025
      </Pilula>
    </Painel>
  );
};

const SsmsCheio: React.FC = () => {
  const t = useT();
  const {fps} = useVideoConfig();
  const vis = Math.min(
    interpolate(t, [26.5, 26.5 + 12 / fps], [0, 1], clamp),
    interpolate(t, [29.87, 29.87 + 0.3], [1, 0], clamp),
  );
  // Mesmo corte do split: começa na aba da query, no canto superior esquerdo da tela.
  const S = 1.2; // mesma largura visível do split (900 px do SSMS), sem faixa preta embaixo
  const ox = -SSMS_ABA.x * S;
  const oy = -SSMS_ABA.y * S;
  return (
    <AbsoluteFill style={{opacity: vis, background: '#1e1e1e'}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${ox}px, ${oy}px) scale(${S})`}}>
        <div style={{position: 'relative', width: 1080, height: 1920}}>
          <OffthreadVideo src={SSMS} muted trimBefore={Math.round(12.0 * fps)} playbackRate={1.9} style={{width: 1080, height: 1920}} />
          <MarcaTexto t0={28.06} x={100} y={1185} w={940} h={140} cor="rgba(46,163,242,.30)" dur={0.6} />
        </div>
      </div>
      <Pilula t0={27.22} x={430} y={1270} tamanho={44}>
        Azure
      </Pilula>
      <Pilula t0={28.06} x={640} y={1270} tamanho={44} fundo={COR.branco} cor="#111">
        + IA
      </Pilula>
    </AbsoluteFill>
  );
};

const Item: React.FC<{t0: number; y: number; children: React.ReactNode}> = ({t0, y, children}) => {
  const {s, op, ativo} = useMola(t0);
  if (!ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 44, top: y, width: 560, display: 'flex', gap: 22, alignItems: 'flex-start',
        opacity: op, transform: `translateX(${(1 - s) * -40}px)`, color: COR.branco, fontWeight: 700, fontSize: 44, lineHeight: 1.15,
      }}
    >
      <span
        style={{
          flex: '0 0 auto', width: 54, height: 54, borderRadius: 14, background: COR.azul, color: COR.branco,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, transform: `scale(${s})`,
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
  const vis = visPainel(t, 5);
  const capa = useMola(35.32);
  const vivo = useMola(37.68);
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 1.6));
  return (
    <Painel vis={vis} fundo="radial-gradient(circle at 80% 0%, #0f2a40, #0b0d10 65%)">
      <div style={{position: 'absolute', left: 44, top: 40, color: COR.branco, fontWeight: 800, fontSize: 64, letterSpacing: 1}}>
        E TEM <span style={{color: COR.azul}}>MAIS</span>
      </div>
      <Item t0={31.14} y={160}>Simulados</Item>
      <Item t0={32.44} y={250}>Orientações para DP-300 e DP-800</Item>
      <Item t0={35.32} y={400}>eBooks gratuitos</Item>
      {capa.ativo && (
        <Img
          src={img('eBook.png')}
          style={{
            position: 'absolute', left: 650, top: 70, width: 330, height: 442, borderRadius: 12,
            opacity: capa.op, transform: `translateY(${(1 - capa.s) * 60}px) rotate(${4 * capa.s}deg)`,
            boxShadow: '0 24px 60px rgba(0,0,0,.7), 0 0 0 2px rgba(46,163,242,.5)',
          }}
        />
      )}
      {vivo.ativo && (
        <div
          style={{
            position: 'absolute', left: 44, top: 540, display: 'flex', alignItems: 'center', gap: 16, opacity: vivo.op,
            transform: `scale(${0.85 + 0.15 * vivo.s})`, transformOrigin: 'left center', background: 'rgba(255,255,255,.08)',
            padding: '12px 26px', borderRadius: 999, color: COR.branco, fontWeight: 800, fontSize: 36,
          }}
        >
          <span style={{width: 22, height: 22, borderRadius: 11, background: '#FF3B30', opacity: pisca}} />
          AO VIVO
        </div>
      )}
    </Painel>
  );
};

const LP_EMPE = {w: 658, h: 855};
const BlocoCTA: React.FC = () => {
  const t = useT();
  const vis = visPainel(t, 7);
  const A: Rect = {x: 0, y: 300, w: 658, h: 413};
  const B: Rect = {x: 89, y: 545, w: 480, h: 301};
  const zoom = interpolate(t, [45.64, 46.6], [0, 1], {...clamp, easing: suave});
  const pulso = t >= 47.34 ? 0.6 + 0.4 * Math.abs(Math.sin((t - 47.34) * Math.PI * 1.5)) : 0;
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
      <Pilula t0={47.34} x={30} y={26} tamanho={38} fundo={COR.amarelo} cor="#111">
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

// Posição da legenda em cada cenário. Câmera cheia: abaixo do queixo. Tela dividida: na faixa entre o
// painel e o card. SSMS em tela cheia: à direita do card mini.
const POS_LEGENDA: Record<Tipo, {top: number; left: number}> = {
  cheio: {top: 1390, left: 50},
  split: {top: 893, left: 50},
  mini: {top: 1390, left: 410},
};

// Na transição a legenda some (15%→85%) e reaparece já no lugar novo: nunca atravessa o rosto.
const Legenda: React.FC<{de: Tipo; para: Tipo; p: number}> = ({de, para, p}) => {
  const frame = useQuadro();
  const {fps} = useVideoConfig();
  const t = frame / fps;
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
export const ADv002: React.FC = () => {
  const t = useT();
  const {layout, dividido, i, p} = estado(t);

  return (
    <AbsoluteFill style={{background: COR.fundo, fontFamily}}>
      {/* fundo das telas divididas */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, rgba(46,163,242,.22), transparent 60%)', opacity: dividido}} />

      {/* SSMS em tela cheia (atrás do card mini) */}
      <Trecho de={26.4} dur={3.9}>
        <SsmsCheio />
      </Trecho>

      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={layout}>
        <OffthreadVideo src={MASTER} style={{width: W, height: H}} />
      </CameraCard>

      {/* painéis das telas divididas */}
      <Trecho de={7.9} dur={5.0}>
        <BlocoEvento />
      </Trecho>
      <Trecho de={23.27} dur={3.6}>
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
