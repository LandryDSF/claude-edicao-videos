import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile} from 'remotion';
import type {ZonaRosto} from '../../_shared/enquadramento';
import {CameraCard, type LayoutCamera, layoutCheio} from '../../_shared/split-vertical';
import {
  ChipInclinado,
  Checklist,
  ContornoLima,
  Efeitos,
  FONTE_LIMA,
  LIMA,
  LegendaKaraoke,
  PilulaAlerta,
  type RecorteSelo,
  Rotulo,
  SeloPNG,
  SetaDesenhada,
  type Som,
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

// 006.ENv007 — "Certificação DP-800": a nova certificação mostra o futuro da profissão. Engajamento (seguir + comentar).
// Estilo Lima Black + efeitos sonoros (sem música). Plano: projetos/006.ENv007/plano.md.
// Cenário novo (em pé, parede de certificados): pouco espaço acima da cabeça, então chips, listas e selos vão NO PEITO.

export const FPS = 60;
export const DURACAO = 5074; // quadros do master (84,567 s)

const PASTA = '006.ENv007';
const MASTER = staticFile(`${PASTA}/video/ENv 007 Certificação DP-800.mp4`);
const SSMS = staticFile(`${PASTA}/telas/SSMS IA.mp4`);
const PROGRAMANDO = staticFile(`${PASTA}/telas/Programando.mp4`);
const CERTIFICADOS = staticFile(`${PASTA}/telas/Certificacoes.mp4`);

const MCT: RecorteSelo = {src: staticFile(`${PASTA}/prints/MCT.png`), lado: 378, x0: 49, y0: 38, x1: 325, y1: 343};
const DP800: RecorteSelo = {src: staticFile(`${PASTA}/prints/DP-800.png`), lado: 525, x0: 9, y0: 17, x1: 508, y1: 507};

// Zona do rosto medida em projetos/006.ENv007/frames/sheet_rosto.jpg (1 quadro/s, vídeo inteiro).
const MW = 1080;
const MH = 1920;
const ROSTO: ZonaRosto = {x0: 200, y0: 400, x1: 800, y1: 980};

const BLOCOS = montarBlocos(PALAVRAS);

const T = {
  tipo1: [4.62, 8.38],
  programando: [12.48, 17.34],
  check1: [18.52, 24.6],
  tipo2: [28.64, 31.44],
  dp800: [31.44, 36.36],
  certificados: [39.12, 42.68],
  tipo3: [44.44, 47.54],
  check2: [50.7, 55.56],
  ssms: [55.56, 62.16],
  ssmsB: 60.36,
  tipo4: [66.32, 68.06],
  cta: 82.3,
} as const;

const rampa = (t: number, a: number, b: number, z0: number, z1: number) => interpolate(t, [a, b], [z0, z1], {...clamp, easing: suave});

const zoomCamera = (t: number) => {
  if (t < 8.38) return rampa(t, 0, 4.6, 1, 1.03);
  if (t < 12.48) return 1.1; // "Isso diz muito sobre o futuro..."
  if (t < 24.6) return rampa(t, 17.34, 24.5, 1, 1.03);
  if (t < 31.44) return rampa(t, 24.6, 28.6, 1, 1.05);
  if (t < 36.36) return 1;
  if (t < 39.12) return 1.1; // "não aconteceu por acaso"
  if (t < 47.54) return rampa(t, 42.68, 44.4, 1, 1.03);
  if (t < 62.16) return rampa(t, 47.54, 55.5, 1, 1.04);
  if (t < 68.06) return rampa(t, 62.16, 66.3, 1, 1.05);
  if (t < 70.28) return 1.08; // "Me segue aqui"
  if (t < 75.92) return rampa(t, 70.28, 75.9, 1, 1.04);
  if (t < 77.72) return 1;
  if (t < T.cta) return rampa(t, 77.72, 82.2, 1, 1.05);
  return 1.05;
};

type Geo = {
  W: number;
  H: number;
  camera: (zoom: number) => LayoutCamera;
  k: number;
  faixaY: number; // chips, pílulas e selos (vertical: no peito; quadrado: faixa de cima)
  pilulaY: number;
  legenda: {top: number; tamanho: number};
  tipo: {escala: number; centroY: number};
  checklist: {x: number; y: number; tamanho: number; horizontal: boolean};
  selo: {x: number; y: number; h: number};
  ssms: {painel: {x: number; y: number; w: number}; rect: {x: number; y: number; w: number; h: number}; chipY: number};
  cta: {top: number; tam: [number, number, number]; seta: {de: [number, number]; para: [number, number]}};
  ocultaLegenda: [number, number][];
};

const VERTICAL: Geo = {
  W: 1080,
  H: 1920,
  camera: (zoom) => layoutCheio(MW, MH, ROSTO, zoom),
  k: 1,
  faixaY: 1065,
  pilulaY: 1110,
  legenda: {top: 1420, tamanho: 50},
  tipo: {escala: 1, centroY: 0.42},
  checklist: {x: 80, y: 1050, tamanho: 58, horizontal: false},
  selo: {x: 80, y: 1045, h: 280},
  ssms: {painel: {x: 30, y: 330, w: 1020}, rect: {x: 76, y: 312, w: 960, h: 1328}, chipY: 170},
  cta: {top: 1030, tam: [80, 110, 190], seta: {de: [760, 1450], para: [990, 1590]}},
  ocultaLegenda: [],
};

// Quadrado: janela do master a partir de y 150 (rosto em y 250–830); chips na faixa de cima.
const JANELA_Y = 150;
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
  faixaY: 46,
  pilulaY: 905,
  legenda: {top: 952, tamanho: 40},
  tipo: {escala: 0.78, centroY: 0.47},
  checklist: {x: 34, y: 950, tamanho: 26, horizontal: true},
  selo: {x: 36, y: 26, h: 150},
  ssms: {painel: {x: 80, y: 104, w: 920}, rect: {x: 76, y: 312, w: 960, h: 1000}, chipY: 18},
  cta: {top: 850, tam: [56, 0, 92], seta: {de: [880, 640], para: [990, 860]}},
  ocultaLegenda: [
    [68.32, 70.28],
    [78.44, 79.62],
  ],
};

// ---------- Peças deste vídeo ----------
const Chip: React.FC<{g: Geo; de: number; ate: number; texto: string; complemento?: string; tComplemento?: number; tamanho?: number}> = ({
  g, de, ate, texto, complemento, tComplemento, tamanho = 84,
}) => (
  <Trecho de={de} ate={ate}>
    <ChipInclinado t0={de} t1={ate - 0.07} x={g.W / 2} y={g.faixaY} tamanho={tamanho * g.k} complemento={complemento} tComplemento={tComplemento}>
      {texto}
    </ChipInclinado>
  </Trecho>
);

// Selo + rótulo + chip lado a lado (MCT na abertura, DP-800 na cena da certificação).
const SeloComTitulo: React.FC<{g: Geo; selo: RecorteSelo; t0: number; t1: number; rotulo: string; titulo: string; complemento: string; tComplemento: number; tTitulo?: number; brilhoDesde?: number}> = ({
  g, selo, t0, t1, rotulo, titulo, complemento, tComplemento, tTitulo, brilhoDesde,
}) => {
  const t = useT();
  const brilho = brilhoDesde !== undefined && t >= brilhoDesde ? 0.5 + 0.5 * Math.sin((t - brilhoDesde) * Math.PI * 1.4) : 0;
  const xTexto = g.selo.x + larguraSelo(selo, g.selo.h) + 30 * g.k;
  return (
    <>
      <SeloPNG t0={t0} t1={t1} x={g.selo.x} y={g.selo.y} h={g.selo.h} selo={selo} brilho={brilho} />
      <Rotulo t0={t0 + 0.1} t1={t1} x={xTexto} y={g.selo.y + 8 * g.k} tamanho={36 * g.k}>
        {rotulo}
      </Rotulo>
      <ChipInclinado t0={tTitulo ?? t0 + 0.2} t1={t1} x={(xTexto + g.W - 40) / 2} y={g.selo.y + 62 * g.k} tamanho={96 * g.k} complemento={complemento} tComplemento={tComplemento}>
        {titulo}
      </ChipInclinado>
    </>
  );
};

const BRoll: React.FC<{g: Geo; src: string; de: number; ate: number}> = ({g, src, de, ate}) => {
  const t = useT();
  const op = interpolate(t, [de, de + 0.12], [0, 1], clamp) * interpolate(t, [ate - 0.12, ate], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: op, background: '#000'}}>
      <OffthreadVideo src={src} muted style={{width: g.W, height: g.H, objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// SSMS: trecho A (modelos, src 5,8 s) e trecho B (tabela com vector(1024), src 19,6 s), sem legenda.
const TelaSSMS: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const {painel, rect} = g.ssms;
  const s = painel.w / rect.w;
  const ent = interpolate(t, [T.ssms[0], T.ssms[0] + 0.25], [0, 1], {...clamp, easing: suave});
  return (
    <AbsoluteFill style={{background: LIMA.fundo}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 10%, rgba(207,253,58,.10), transparent 50%)'}} />
      <div
        style={{
          position: 'absolute', left: painel.x, top: painel.y, width: painel.w, height: rect.h * s, overflow: 'hidden', borderRadius: 18 * g.k,
          boxShadow: '0 0 0 3px rgba(207,253,58,.55), 0 30px 80px rgba(0,0,0,.7)', background: '#1e1e1e', opacity: ent, transform: `translateY(${(1 - ent) * 30}px)`,
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${s}) translate(${-rect.x}px, ${-rect.y}px)`}}>
          <div style={{position: 'relative', width: 1080, height: 1920}}>
            <Trecho de={T.ssms[0]} ate={T.ssmsB}>
              <OffthreadVideo src={SSMS} muted trimBefore={Math.round(5.8 * FPS)} style={{width: 1080, height: 1920}} />
            </Trecho>
            <Trecho de={T.ssmsB} ate={T.ssms[1]}>
              <OffthreadVideo src={SSMS} muted trimBefore={Math.round(19.6 * FPS)} style={{width: 1080, height: 1920}} />
            </Trecho>
            {/* "desenvolvimento": MODEL_TYPE = EMBEDDINGS (antes da rolagem do src 10,7 s) */}
            <ContornoLima t0={56.16} t1={60.3} x={206} y={672} w={420} h={46} />
            {/* "dados": Embedding vector(1024) */}
            <ContornoLima t0={61.0} x={206} y={750} w={400} h={46} />
          </div>
        </div>
      </div>
      <ChipInclinado t0={58.38} x={g.W / 2} y={g.ssms.chipY} tamanho={76 * g.k} complemento="sobre os dados" tComplemento={60.2}>
        Soluções inteligentes
      </ChipInclinado>
    </AbsoluteFill>
  );
};

const CTA: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const veu = interpolate(t, [T.cta, T.cta + 0.3], [0, 0.62], clamp);
  const a = useMola(T.cta);
  const b = useMola(82.3);
  const c = useMola(83.44); // "DP-800?"
  const [t1, t2, t3] = g.cta.tam;
  return (
    <AbsoluteFill style={{fontFamily: FONTE_LIMA}}>
      <AbsoluteFill style={{background: `rgba(0,0,0,${veu})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: g.cta.top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{color: LIMA.branco, fontWeight: 900, fontSize: t1, lineHeight: 1, opacity: a.op, transform: `scale(${0.7 + 0.3 * a.s})`}}>COMENTE</div>
        {t2 > 0 ? (
          <>
            <div style={{color: LIMA.branco, fontWeight: 900, fontSize: t2, lineHeight: 1.05, opacity: b.op, transform: `scale(${0.7 + 0.3 * b.s})`}}>FARIA A</div>
            <div style={{color: LIMA.lima, fontWeight: 900, fontSize: t3, lineHeight: 1.02, letterSpacing: -3, whiteSpace: 'nowrap', opacity: c.op, transform: `scale(${0.6 + 0.4 * c.s})`, textShadow: '0 0 50px rgba(207,253,58,.35)'}}>
              DP-800?
            </div>
          </>
        ) : (
          <div style={{fontWeight: 900, fontSize: t3, lineHeight: 1.05, whiteSpace: 'nowrap', opacity: b.op}}>
            <span style={{color: LIMA.branco}}>FARIA A </span>
            <span style={{color: LIMA.lima, opacity: c.op, textShadow: '0 0 40px rgba(207,253,58,.35)'}}>DP-800?</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Efeitos sonoros (tabela do plano) ----------
const s = (som: Som, ...ts: number[]) => ts.map((t) => ({t, som}));
const EFEITOS = [
  ...s('whoosh', 4.42, 12.28, 28.44, 38.92, 44.24, 55.36, 66.12, 82.1),
  ...s('impacto', 31.44, 67.04),
  ...s('pop', 0.3, 2.54, 10.08, 13.06, 24.72, 37.32, 40.76, 48.22, 58.38, 68.32, 70.28, 76.54, 78.44, 80.08),
  ...s('check', 18.59, 19.51, 20.89, 21.49, 50.77, 52.25, 53.47, 54.41),
  ...s('riser', 81.1),
  ...s('swish', 83.0),
];

// ---------- Composição ----------
const Video: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const tela = (de: number, ate: number, linhas: React.ComponentProps<typeof TelaTipografica>['linhas']) => (
    <Trecho de={de} ate={ate}>
      <TelaTipografica de={de} ate={ate} linhas={linhas} largura={g.W} altura={g.H} escala={g.tipo.escala} centroY={g.tipo.centroY} />
    </Trecho>
  );
  const lista = (de: number, ate: number, itens: {t: number; texto: string}[]) => (
    <Trecho de={de} ate={ate}>
      <Checklist t1={ate - 0.07} x={g.checklist.x} y={g.checklist.y} tamanho={g.checklist.tamanho} horizontal={g.checklist.horizontal} itens={itens} />
    </Trecho>
  );
  return (
    <AbsoluteFill style={{background: LIMA.fundo, fontFamily: FONTE_LIMA}}>
      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={g.camera(zoomCamera(t))} sombra={false}>
        <OffthreadVideo src={MASTER} style={{width: MW, height: MH}} />
      </CameraCard>

      {/* 1 · abertura */}
      <Trecho de={0} ate={2.5}>
        <SeloComTitulo g={g} selo={MCT} t0={0.08} t1={2.42} rotulo="Landry Duailibe" titulo="MCT" complemento="Microsoft Certified Trainer" tComplemento={0.6} />
      </Trecho>
      <Chip g={g} de={2.54} ate={4.62} texto="A Microsoft criou" complemento="uma certificação inteira" tComplemento={3.18} tamanho={76} />
      {tela(T.tipo1[0], T.tipo1[1], [
        {t: 4.62, texto: 'INTELIGÊNCIA', tamanho: 130},
        {t: 5.74, texto: 'ARTIFICIAL', cor: 'lima', tamanho: 150},
        {t: 6.52, texto: 'APLICADA AO', tamanho: 100},
        {t: 7.5, texto: 'SQL SERVER?', cor: 'lima', tamanho: 140},
      ])}

      {/* 3–6 · o futuro, o passado */}
      <Chip g={g} de={10.08} ate={12.48} texto="O futuro" complemento="da nossa profissão" tComplemento={11.04} />
      <Trecho de={T.programando[0]} ate={T.programando[1]}>
        <BRoll g={g} src={PROGRAMANDO} de={T.programando[0]} ate={T.programando[1]} />
      </Trecho>
      <Chip g={g} de={13.06} ate={17.34} texto="Durante muitos anos" complemento="os mesmos assuntos" tComplemento={16.8} tamanho={76} />
      {lista(T.check1[0], T.check1[1], [
        {t: 18.52, texto: 'Backup'},
        {t: 19.44, texto: 'Performance'},
        {t: 20.82, texto: 'Índice'},
        {t: 21.42, texto: 'Alta disponibilidade'},
      ])}
      <Chip g={g} de={24.72} ate={28.64} texto="Continua" complemento="extremamente importante" tComplemento={25.36} />

      {/* 7–8 · a nova certificação */}
      {tela(T.tipo2[0], T.tipo2[1], [
        {t: 28.64, texto: 'NOVA', tamanho: 120},
        {t: 29.26, texto: 'CERTIFICAÇÃO', cor: 'lima', tamanho: 140},
        {t: 30.28, texto: 'MICROSOFT', tamanho: 90, espacado: true},
      ])}
      <Trecho de={T.dp800[0]} ate={T.dp800[1]}>
        <SeloComTitulo
          g={g}
          selo={DP800}
          t0={31.44}
          t1={36.29}
          rotulo="Nova certificação Microsoft"
          titulo="DP-800"
          complemento="SQL AI Developer Associate"
          tComplemento={33.16}
          brilhoDesde={31.44}
        />
      </Trecho>

      {/* 9–12 · não foi por acaso */}
      <Chip g={g} de={37.32} ate={39.12} texto="Não foi por acaso" />
      <Trecho de={T.certificados[0]} ate={T.certificados[1]}>
        <BRoll g={g} src={CERTIFICADOS} de={T.certificados[0]} ate={T.certificados[1]} />
      </Trecho>
      <Chip g={g} de={40.76} ate={42.68} texto="Certificação" complemento="oficial" tComplemento={41.48} />
      {tela(T.tipo3[0], T.tipo3[1], [
        {t: 44.44, texto: 'ESSAS', tamanho: 100},
        {t: 44.92, texto: 'TECNOLOGIAS', tamanho: 120},
        {t: 45.9, texto: 'VIERAM', tamanho: 130},
        {t: 46.34, texto: 'PARA FICAR', cor: 'lima', tamanho: 150},
      ])}

      {/* 13–16 · o que a prova cobra */}
      <Chip g={g} de={48.22} ate={50.64} texto="Assuntos da prova" />
      {lista(T.check2[0], T.check2[1], [
        {t: 50.7, texto: 'Embeddings'},
        {t: 52.18, texto: 'Busca vetorial'},
        {t: 53.4, texto: 'RAG'},
        {t: 54.34, texto: 'Modelos de IA'},
      ])}
      <Trecho de={T.ssms[0]} ate={T.ssms[1]}>
        <TelaSSMS g={g} />
      </Trecho>
      {tela(T.tipo4[0], T.tipo4[1], [
        {t: 66.32, texto: 'SQL SERVER', tamanho: 130},
        {t: 67.04, texto: '2025', cor: 'lima', tamanho: 300},
      ])}

      {/* 17–20 · seguir e comentar */}
      <Trecho de={68.32} ate={70.28}>
        <PilulaAlerta t0={68.32} t1={70.21} x={g.W / 2} y={g.pilulaY} tamanho={60 * g.k}>
          Me segue
        </PilulaAlerta>
      </Trecho>
      <Chip g={g} de={70.28} ate={76.48} texto="Próximos vídeos" complemento="de forma simples e prática" tComplemento={71.68} />
      <Trecho de={76.54} ate={77.72}>
        <SeloPNG t0={76.54} t1={77.65} x={g.W / 2 - larguraSelo(DP800, g.selo.h) / 2} y={g.selo.y} h={g.selo.h} selo={DP800} brilho={0.8} />
      </Trecho>
      <Trecho de={78.44} ate={79.62}>
        <PilulaAlerta t0={78.44} t1={79.55} x={g.W / 2} y={g.pilulaY} tamanho={52 * g.k}>
          Me conta nos comentários
        </PilulaAlerta>
      </Trecho>
      <Chip g={g} de={80.08} ate={T.cta} texto="Já fez alguma" complemento="certificação?" tComplemento={81.0} />

      {/* 21 · fecho */}
      <Trecho de={T.cta}>
        <CTA g={g} />
        <SetaDesenhada t0={83.0} de={g.cta.seta.de} para={g.cta.seta.para} curva={-90 * g.k} largura={11 * g.k} />
      </Trecho>

      <LegendaKaraoke
        blocos={BLOCOS}
        top={g.legenda.top}
        tamanho={g.legenda.tamanho}
        largura={g.W}
        oculta={[
          [T.programando[0], T.programando[1]],
          [T.certificados[0], T.certificados[1]],
          [T.ssms[0], T.ssms[1]],
          [T.check1[0], T.check1[1]],
          [T.check2[0], T.check2[1]],
          [T.cta, 999],
          ...g.ocultaLegenda,
        ]}
      />

      <Efeitos lista={EFEITOS} />
    </AbsoluteFill>
  );
};

export const W = VERTICAL.W;
export const H = VERTICAL.H;
export const ENv007: React.FC = () => <Video g={VERTICAL} />;

export const WQ = QUADRADO.W;
export const HQ = QUADRADO.H;
export const ENv007Quadrado: React.FC = () => <Video g={QUADRADO} />;
