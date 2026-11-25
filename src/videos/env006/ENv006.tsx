import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, interpolate, staticFile} from 'remotion';
import type {ZonaRosto} from '../../_shared/enquadramento';
import {CameraCard, type LayoutCamera, layoutCheio} from '../../_shared/split-vertical';
import {
  ChipInclinado,
  Checklist,
  ContornoLima,
  FONTE_LIMA,
  LIMA,
  LegendaKaraoke,
  PilulaAlerta,
  type RecorteSelo,
  Rotulo,
  SeloPNG,
  SetaDesenhada,
  TelaTipografica,
  Trecho,
  clamp,
  larguraSelo,
  montarBlocos,
  suave,
  useMola,
  useT,
} from '../../estilos/lima-black';
import {PALAVRAS} from './palavras';

// 004.ENv006 — HandsOn Embeddings (engajamento: pergunta nos comentários). Estilo Lima Black, primeiro vídeo do estilo.
// Plano: projetos/004.ENv006/plano.md. Vertical (ENv006) e quadrado (ENv006Quadrado) com os mesmos gatilhos.

export const FPS = 60;
export const DURACAO = 4306; // quadros do master (71,773 s)

const PASTA = '004.ENv006';
const MASTER = staticFile(`${PASTA}/video/ENv 006 HandsOn Embedings.mp4`);
const SSMS = staticFile(`${PASTA}/telas/SSMS IA.mp4`);
const PROGRAMANDO = staticFile(`${PASTA}/telas/Programando.mp4`);
const VOLUME = staticFile(`${PASTA}/telas/Volume de Dados.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

// Área visível medida no canal alfa.
const MCT: RecorteSelo = {src: img('MCT.png'), lado: 378, x0: 49, y0: 38, x1: 325, y1: 343};
const DP800: RecorteSelo = {src: img('DP-800.png'), lado: 525, x0: 9, y0: 17, x1: 508, y1: 507};

// Master 1080×1920. Zona do rosto medida em projetos/004.ENv006/frames/sheet_rosto.jpg (1 quadro/s, vídeo inteiro).
const MW = 1080;
const MH = 1920;
const ROSTO: ZonaRosto = {x0: 140, y0: 500, x1: 800, y1: 1180};

const BLOCOS = montarBlocos(PALAVRAS);

// ---------- Linha do tempo (segundos do master) ----------
const T = {
  tipo1: [3.9, 5.08],
  programando: [5.08, 8.8],
  tipo2: [11.56, 12.72],
  ssms: [12.72, 31.28],
  ssmsB: 23.72,
  tipo3: [31.28, 33.42],
  checklist: [36.46, 42.62],
  volume: [42.62, 47.42],
  tipo4: [57.62, 60.1],
  alerta: [62.8, 65.12],
  cta: 69.74,
} as const;

const rampa = (t: number, a: number, b: number, z0: number, z1: number) => interpolate(t, [a, b], [z0, z1], {...clamp, easing: suave});

// Zoom da câmera cheia: push-ins suaves e punch-ins secos nas perguntas.
const zoomCamera = (t: number) => {
  if (t < 2.44) return 1;
  if (t < 8.8) return rampa(t, 2.44, 3.9, 1, 1.05);
  if (t < 9.72) return 1.15; // "Olha que interessante"
  if (t < 33.42) return 1;
  if (t < 35.66) return rampa(t, 33.42, 35.6, 1, 1.03);
  if (t < 36.46) return 1.12; // "pode ser utilizado?"
  if (t < 47.42) return 1;
  if (t < 55.86) return rampa(t, 47.42, 55.8, 1, 1.05);
  if (t < 57.62) return 1.12; // "me conta uma coisa"
  if (t < 62.8) return 1;
  if (t < 65.12) return rampa(t, 62.8, 65.0, 1, 1.05);
  if (t < T.cta) return rampa(t, 65.12, 69.6, 1, 1.04);
  return 1.04;
};

// ---------- Geometria por formato ----------
type Geo = {
  W: number;
  H: number;
  camera: (zoom: number) => LayoutCamera;
  k: number; // escala dos textos
  chipY: number;
  legenda: {top: number; tamanho: number};
  tipo: {escala: number; centroY: number};
  checklist: {x: number; y: number; tamanho: number; horizontal: boolean};
  selo: {x: number; y: number; h: number};
  ssms: {painel: {x: number; y: number; w: number}; rect: {x: number; y: number; w: number; h: number}; chipY: number};
  alertaY: number;
  // fecho: texto fora do rosto (acima da cabeça na vertical, numa linha embaixo no quadrado)
  cta: {top: number; linha: boolean; seta: {de: [number, number]; para: [number, number]}};
  legendaSobAlerta: boolean;
};

const VERTICAL: Geo = {
  W: 1080,
  H: 1920,
  camera: (zoom) => layoutCheio(MW, MH, ROSTO, zoom),
  k: 1,
  chipY: 290,
  legenda: {top: 1236, tamanho: 50},
  tipo: {escala: 1, centroY: 0.42},
  checklist: {x: 70, y: 1225, tamanho: 58, horizontal: false},
  selo: {x: 60, y: 250, h: 210},
  // SSMS cortado rente à aba da query (x 76, y 312 do SSMS), enquadramento fixo.
  ssms: {painel: {x: 30, y: 330, w: 1020}, rect: {x: 76, y: 312, w: 960, h: 1328}, chipY: 170},
  alertaY: 1330,
  cta: {top: 120, linha: false, seta: {de: [640, 1330], para: [985, 1530]}},
  legendaSobAlerta: true,
};

// Quadrado: câmera cheia = janela do master a partir de y 300 (o rosto fica em y 200–880).
const JANELA_Y = 300;
const QUADRADO: Geo = {
  W: 1080,
  H: 1080,
  camera: (zoom) => {
    const cx = (ROSTO.x0 + ROSTO.x1) / 2;
    const cy = (ROSTO.y0 + ROSTO.y1) / 2;
    const x = Math.min(0, Math.max(1080 - MW * zoom, cx - cx * zoom));
    const y = Math.min(0, Math.max(1080 - MH * zoom, cy - JANELA_Y - cy * zoom));
    return {card: {x: 0, y: 0, w: 1080, h: 1080, r: 0}, video: {x, y, scale: zoom}};
  },
  k: 0.72,
  chipY: 46,
  legenda: {top: 952, tamanho: 40},
  tipo: {escala: 0.78, centroY: 0.47},
  checklist: {x: 40, y: 948, tamanho: 34, horizontal: true},
  selo: {x: 36, y: 26, h: 150},
  ssms: {painel: {x: 80, y: 104, w: 920}, rect: {x: 76, y: 312, w: 960, h: 1000}, chipY: 18},
  alertaY: 940,
  cta: {top: 900, linha: true, seta: {de: [850, 640], para: [1000, 860]}},
  legendaSobAlerta: false,
};

// ---------- Cenas ----------
const Abertura: React.FC<{g: Geo}> = ({g}) => {
  const wSelo = larguraSelo(MCT, g.selo.h);
  const xTexto = g.selo.x + wSelo + 30 * g.k;
  const centroChip = (xTexto + g.W - 40) / 2;
  return (
    <>
      <SeloPNG t0={0.08} t1={2.38} x={g.selo.x} y={g.selo.y} h={g.selo.h} selo={MCT} />
      <Rotulo t0={0.2} t1={2.38} x={xTexto} y={g.selo.y + 8 * g.k} tamanho={36 * g.k}>
        Landry Duailibe
      </Rotulo>
      <ChipInclinado t0={0.3} t1={2.38} x={centroChip} y={g.selo.y + 62 * g.k} tamanho={96 * g.k} complemento="Microsoft Certified Trainer" tComplemento={0.56}>
        MCT
      </ChipInclinado>
      <ChipInclinado t0={2.44} t1={3.84} x={g.W / 2} y={g.chipY} tamanho={84 * g.k} complemento="integra IA" tComplemento={2.44}>
        SQL Server 2025
      </ChipInclinado>
    </>
  );
};

const BRoll: React.FC<{g: Geo; src: string; de: number; ate: number; inicio?: number; filtro?: string}> = ({g, src, de, ate, inicio = 0, filtro}) => {
  const t = useT();
  const op = interpolate(t, [de, de + 0.12], [0, 1], clamp) * interpolate(t, [ate - 0.12, ate], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: op, background: '#000'}}>
      <OffthreadVideo src={src} muted trimBefore={Math.round(inicio * FPS)} style={{width: g.W, height: g.H, objectFit: 'cover', filter: filtro}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// SSMS em tela cheia, sem legenda. Trecho A: modelos + sys.external_models. Trecho B: tabela com vector(1024), congela no fim.
const SSMS_A = {src: 5.8, rate: 1.064}; // src 5,8 → 17,5 s em 11 s
const SSMS_B = {src: 19.6, rate: 0.75}; // src 19,6 → 22,9 s em 4,4 s, depois congela
const SSMS_B_FIM = 22.8;

const TelaSSMS: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const {painel, rect} = g.ssms;
  const s = painel.w / rect.w;
  const ent = interpolate(t, [T.ssms[0], T.ssms[0] + 0.25], [0, 1], {...clamp, easing: suave});
  const fimB = T.ssmsB + (SSMS_B_FIM - SSMS_B.src) / SSMS_B.rate;
  const video = (de: number, rate: number) => (
    <OffthreadVideo src={SSMS} muted trimBefore={Math.round(de * FPS)} playbackRate={rate} style={{width: 1080, height: 1920}} />
  );
  return (
    <AbsoluteFill style={{background: LIMA.fundo}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 10%, rgba(207,253,58,.10), transparent 50%)'}} />
      <div
        style={{
          position: 'absolute', left: painel.x, top: painel.y, width: painel.w, height: rect.h * s, overflow: 'hidden', borderRadius: 18 * g.k,
          boxShadow: '0 0 0 3px rgba(207,253,58,.55), 0 30px 80px rgba(0,0,0,.7)', background: '#1e1e1e',
          opacity: ent, transform: `translateY(${(1 - ent) * 30}px)`,
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${s}) translate(${-rect.x}px, ${-rect.y}px)`}}>
          <div style={{position: 'relative', width: 1080, height: 1920}}>
            <Trecho de={T.ssms[0]} ate={T.ssmsB}>{video(SSMS_A.src, SSMS_A.rate)}</Trecho>
            <Trecho de={T.ssmsB} ate={fimB}>{video(SSMS_B.src, SSMS_B.rate)}</Trecho>
            <Trecho de={fimB} ate={T.ssms[1]}>
              <Freeze frame={0}>{video(SSMS_B_FIM, 1)}</Freeze>
            </Trecho>
            {/* "Embeddings são representações numéricas": MODEL_TYPE = EMBEDDINGS (antes da rolagem do src 10,7 s) */}
            <ContornoLima t0={13.62} t1={17.1} x={206} y={672} w={420} h={46} />
            {/* "gerar vetores": Embedding vector(1024) */}
            <ContornoLima t0={25.42} x={206} y={750} w={400} h={46} />
          </div>
        </div>
      </div>
      <ChipInclinado t0={T.ssms[0]} x={g.W / 2} y={g.ssms.chipY} tamanho={76 * g.k} complemento="SQL Server 2025" tComplemento={T.ssms[0] + 0.15}>
        Na prática
      </ChipInclinado>
    </AbsoluteFill>
  );
};

const Usos: React.FC<{g: Geo}> = ({g}) => (
  <Checklist
    t1={T.checklist[1] - 0.07}
    x={g.checklist.x}
    y={g.checklist.y}
    tamanho={g.checklist.tamanho}
    horizontal={g.checklist.horizontal}
    itens={[
      {t: 36.8, texto: 'Busca semântica'},
      {t: 38.36, texto: 'Recomendação'},
      {t: 41.62, texto: 'RAG'},
    ]}
  />
);

const Certificacao: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const brilho = t >= 52.1 ? 0.5 + 0.5 * Math.sin((t - 52.1) * Math.PI * 1.4) : 0;
  const h = g.selo.h * 1.05;
  const xTexto = g.selo.x + larguraSelo(DP800, h) + 30 * g.k;
  return (
    <>
      <SeloPNG t0={50.88} t1={55.8} x={g.selo.x} y={g.selo.y} h={h} selo={DP800} brilho={brilho} />
      <Rotulo t0={50.88} t1={55.8} x={xTexto} y={g.selo.y + 8 * g.k} tamanho={36 * g.k}>
        Certificação Microsoft
      </Rotulo>
      <ChipInclinado t0={52.1} t1={55.8} x={(xTexto + g.W - 40) / 2} y={g.selo.y + 62 * g.k} tamanho={104 * g.k} complemento="SQL + IA" tComplemento={54.24}>
        DP-800
      </ChipInclinado>
    </>
  );
};

const CTA: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const veu = interpolate(t, [T.cta, T.cta + 0.3], [0, 0.66], clamp);
  const a = useMola(T.cta);
  const b = useMola(T.cta + 0.25);
  const c = useMola(T.cta + 0.5);
  return (
    <AbsoluteFill style={{fontFamily: FONTE_LIMA}}>
      <AbsoluteFill style={{background: `rgba(0,0,0,${veu})`}} />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: g.cta.top, display: 'flex', flexDirection: g.cta.linha ? 'row' : 'column', flexWrap: 'nowrap',
          alignItems: g.cta.linha ? 'baseline' : 'center', justifyContent: 'center', columnGap: 24,
        }}
      >
        <div style={{color: LIMA.branco, fontWeight: 900, fontSize: g.cta.linha ? 66 : 96, lineHeight: 1, opacity: a.op, transform: `scale(${0.7 + 0.3 * a.s})`}}>COMENTE</div>
        <div
          style={{
            color: LIMA.lima, fontWeight: 900, fontSize: g.cta.linha ? 112 : 168, whiteSpace: 'nowrap', lineHeight: 1.05, letterSpacing: -3, opacity: b.op, transform: `scale(${0.6 + 0.4 * b.s})`,
            textShadow: '0 0 50px rgba(207,253,58,.35)',
          }}
        >
          JÁ USOU?
        </div>
        {!g.cta.linha && <div style={{color: LIMA.branco, fontWeight: 800, fontSize: 42, opacity: c.op, letterSpacing: 2, marginTop: 8}}>EMBEDDINGS · BUSCA VETORIAL</div>}
      </div>
      <SetaDesenhada t0={T.cta + 0.7} de={g.cta.seta.de} para={g.cta.seta.para} curva={-110 * g.k} largura={10 * g.k} />
    </AbsoluteFill>
  );
};

// ---------- Composição ----------
const Video: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const tipo = (de: number, ate: number, linhas: React.ComponentProps<typeof TelaTipografica>['linhas']) => (
    <Trecho de={de} ate={ate}>
      <TelaTipografica de={de} ate={ate} linhas={linhas} largura={g.W} altura={g.H} escala={g.tipo.escala} centroY={g.tipo.centroY} />
    </Trecho>
  );
  return (
    <AbsoluteFill style={{background: LIMA.fundo, fontFamily: FONTE_LIMA}}>
      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={g.camera(zoomCamera(t))} sombra={false}>
        <OffthreadVideo src={MASTER} style={{width: MW, height: MH}} />
      </CameraCard>

      <Trecho de={0} ate={3.9}>
        <Abertura g={g} />
      </Trecho>

      {tipo(T.tipo1[0], T.tipo1[1], [
        {t: 3.9, texto: 'INTELIGÊNCIA'},
        {t: 4.5, texto: 'ARTIFICIAL', cor: 'lima', tamanho: 150},
      ])}

      <Trecho de={T.programando[0]} ate={T.programando[1]}>
        <BRoll g={g} src={PROGRAMANDO} de={T.programando[0]} ate={T.programando[1]} />
        <ChipInclinado t0={7.6} x={g.W / 2} y={g.chipY} tamanho={84 * g.k} complemento="consultas Transact-SQL" tComplemento={7.6}>
          Direto no T-SQL
        </ChipInclinado>
      </Trecho>

      {tipo(T.tipo2[0], T.tipo2[1], [{t: 11.56, texto: 'EMBEDDINGS?', cor: 'lima', tamanho: 160}])}

      <Trecho de={T.ssms[0]} ate={T.ssms[1]}>
        <TelaSSMS g={g} />
      </Trecho>

      {tipo(T.tipo3[0], T.tipo3[1], [
        {t: 31.28, texto: 'AI_', tamanho: 150},
        {t: 31.74, texto: 'GENERATE_', tamanho: 150},
        {t: 32.46, texto: 'EMBEDDINGS()', cor: 'lima', tamanho: 150},
      ])}

      <Trecho de={T.checklist[0]} ate={T.checklist[1]}>
        <Usos g={g} />
      </Trecho>

      <Trecho de={T.volume[0]} ate={T.volume[1]}>
        <BRoll g={g} src={VOLUME} de={T.volume[0]} ate={T.volume[1]} inicio={2} filtro="grayscale(1) brightness(.6) sepia(1) hue-rotate(38deg) saturate(2.6)" />
        <ChipInclinado t0={46.14} x={g.W / 2} y={g.chipY} tamanho={84 * g.k} complemento="da empresa" tComplemento={46.7}>
          IA + dados
        </ChipInclinado>
      </Trecho>

      <Trecho de={50.8} ate={56}>
        <Certificacao g={g} />
      </Trecho>

      {tipo(T.tipo4[0], T.tipo4[1], [
        {t: 58.04, texto: 'JÁ USOU', tamanho: 140},
        {t: 58.94, texto: 'EMBEDDINGS?', cor: 'lima', tamanho: 150},
      ])}

      <Trecho de={60.4} ate={62.8}>
        <ChipInclinado t0={60.4} t1={62.74} x={g.W / 2} y={g.chipY} tamanho={84 * g.k} complemento="vetorial no SQL Server?" tComplemento={60.94}>
          Ou busca
        </ChipInclinado>
      </Trecho>

      <Trecho de={T.alerta[0]} ate={T.alerta[1]}>
        <PilulaAlerta t0={T.alerta[0]} t1={T.alerta[1] - 0.07} x={g.W / 2} y={g.alertaY} tamanho={52 * g.k}>
          Responde nos comentários
        </PilulaAlerta>
      </Trecho>

      <Trecho de={68.9} ate={T.cta}>
        <ChipInclinado t0={68.9} t1={T.cta - 0.07} x={g.W / 2} y={g.chipY} tamanho={84 * g.k}>
          SQL Server + IA
        </ChipInclinado>
      </Trecho>

      <Trecho de={T.cta}>
        <CTA g={g} />
      </Trecho>

      <LegendaKaraoke
        blocos={BLOCOS}
        top={g.legenda.top}
        tamanho={g.legenda.tamanho}
        largura={g.W}
        oculta={[
          [T.ssms[0], T.ssms[1]],
          [T.checklist[0], T.checklist[1]],
          [T.cta, 999],
          ...(g.legendaSobAlerta ? [] : [[T.alerta[0], T.alerta[1]] as [number, number]]),
        ]}
      />
    </AbsoluteFill>
  );
};

export const W = VERTICAL.W;
export const H = VERTICAL.H;
export const ENv006: React.FC = () => <Video g={VERTICAL} />;

export const WQ = QUADRADO.W;
export const HQ = QUADRADO.H;
export const ENv006Quadrado: React.FC = () => <Video g={QUADRADO} />;
