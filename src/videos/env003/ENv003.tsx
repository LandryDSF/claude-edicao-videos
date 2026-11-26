import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile} from 'remotion';
import type {ZonaRosto} from '../../_shared/enquadramento';
import {CameraCard, type LayoutCamera, layoutCheio} from '../../_shared/split-vertical';
import {
  ChipInclinado,
  Efeitos,
  FONTE_LIMA,
  LIMA,
  LegendaKaraoke,
  PilulaAlerta,
  type RecorteSelo,
  Rotulo,
  SeloPNG,
  type Som,
  TelaTipografica,
  Trecho,
  clamp,
  larguraSelo,
  montarBlocos,
  suave,
  useT,
} from '../../estilos/lima-black';
import {PALAVRAS} from './palavras';

// 005.ENv003 — "É hoje": dia da abertura da Black Friday SQL Server Expert. Fecha a série 005 (2 dias → 1 dia → hoje).
// Estilo Lima Black + efeitos sonoros (sem música). Plano: projetos/005.ENv003/plano.md.

export const FPS = 60;
export const DURACAO = 1468; // quadros do master (24,474 s)

const PASTA = '005.ENv003';
const MASTER = staticFile(`${PASTA}/video/ENv 003 É hoje.mp4`);
const img = (nome: string) => staticFile(`${PASTA}/prints/${nome}`);

// Área visível medida no canal alfa (mesmos arquivos do 001.ADv004).
const MCT: RecorteSelo = {src: img('MCT.png'), lado: 378, x0: 49, y0: 38, x1: 325, y1: 343};
const DP300: RecorteSelo = {src: img('Dp-300.png'), lado: 525, x0: 18, y0: 9, x1: 510, y1: 516};
const DP800: RecorteSelo = {src: img('DP-800.png'), lado: 525, x0: 9, y0: 17, x1: 508, y1: 507};

const MW = 1080;
const MH = 1920;
const ROSTO: ZonaRosto = {x0: 140, y0: 500, x1: 800, y1: 1180};

const BLOCOS = montarBlocos(PALAVRAS);

const T = {
  hoje: [1.3, 2.62],
  aula: [6.84, 8.12],
  selos: [9.64, 11.98],
  data: [16.5, 19.74],
} as const;

const rampa = (t: number, a: number, b: number, z0: number, z1: number) => interpolate(t, [a, b], [z0, z1], {...clamp, easing: suave});

const zoomCamera = (t: number) => {
  if (t < 6.34) return rampa(t, 2.62, 6.3, 1, 1.04);
  if (t < 11.98) return 1;
  if (t < 15.3) return rampa(t, 11.98, 15.2, 1, 1.05);
  if (t < 19.74) return 1;
  if (t < 22.9) return rampa(t, 19.74, 22.8, 1, 1.04);
  return 1.06; // "Espero você às 20 horas"
};

type Geo = {
  W: number;
  H: number;
  camera: (zoom: number) => LayoutCamera;
  k: number;
  chipY: number;
  pilulaY: number;
  legenda: {top: number; tamanho: number};
  tipo: {escala: number; centroY: number};
  selo: {x: number; y: number; h: number};
  selosDP: {y: number; h: number; afast: number};
  ocultaLegenda: [number, number][];
};

const VERTICAL: Geo = {
  W: 1080,
  H: 1920,
  camera: (zoom) => layoutCheio(MW, MH, ROSTO, zoom),
  k: 1,
  chipY: 290,
  pilulaY: 1330,
  legenda: {top: 1236, tamanho: 50},
  tipo: {escala: 1, centroY: 0.42},
  selo: {x: 60, y: 250, h: 210},
  selosDP: {y: 1215, h: 250, afast: 150},
  ocultaLegenda: [],
};

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
  pilulaY: 920,
  legenda: {top: 952, tamanho: 40},
  tipo: {escala: 0.78, centroY: 0.47},
  selo: {x: 36, y: 26, h: 150},
  selosDP: {y: 900, h: 160, afast: 105},
  ocultaLegenda: [[22.06, 22.9]],
};

// Selo MCT + nome + chip (identificação), sobre a câmera.
const Identificacao: React.FC<{g: Geo; t0: number; t1: number}> = ({g, t0, t1}) => {
  const xTexto = g.selo.x + larguraSelo(MCT, g.selo.h) + 30 * g.k;
  return (
    <>
      <SeloPNG t0={t0} t1={t1} x={g.selo.x} y={g.selo.y} h={g.selo.h} selo={MCT} />
      <Rotulo t0={t0 + 0.08} t1={t1} x={xTexto} y={g.selo.y + 8 * g.k} tamanho={36 * g.k}>
        Landry Duailibe
      </Rotulo>
      <ChipInclinado t0={t0 + 0.15} t1={t1} x={(xTexto + g.W - 40) / 2} y={g.selo.y + 62 * g.k} tamanho={96 * g.k} complemento="Microsoft Certified Trainer" tComplemento={t0 + 0.4}>
        MCT
      </ChipInclinado>
    </>
  );
};

// Dupla DP-300 + DP-800: mesma altura visível, brilho lima pulsando.
const SelosDP: React.FC<{g: Geo; t300: number; t800: number; t1: number}> = ({g, t300, t800, t1}) => {
  const t = useT();
  const brilho = t >= t800 ? 0.5 + 0.5 * Math.sin((t - t800) * Math.PI * 1.4) : 0;
  const {y, h, afast} = g.selosDP;
  return (
    <>
      <SeloPNG t0={t300} t1={t1} x={g.W / 2 - afast - larguraSelo(DP300, h) / 2} y={y} h={h} selo={DP300} brilho={brilho} />
      <SeloPNG t0={t800} t1={t1} x={g.W / 2 + afast - larguraSelo(DP800, h) / 2} y={y} h={h} selo={DP800} brilho={brilho} />
    </>
  );
};

// Efeitos sonoros (tabela do plano). O whoosh dispara 0,2 s antes da troca.
const s = (som: Som, ...ts: number[]) => ts.map((t) => ({t, som}));
const EFEITOS = [
  ...s('whoosh', 1.1, 6.64, 16.3),
  ...s('impacto', 9.64, 17.64),
  ...s('pop', 2.62, 4.88, 8.12, 11.98, 19.76, 22.06, 22.9),
];

const Video: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const tela = (de: number, ate: number, linhas: React.ComponentProps<typeof TelaTipografica>['linhas'], tema: 'preto' | 'lima' = 'preto') => (
    <Trecho de={de} ate={ate}>
      <TelaTipografica de={de} ate={ate} linhas={linhas} largura={g.W} altura={g.H} escala={g.tipo.escala} centroY={g.tipo.centroY} tema={tema} />
    </Trecho>
  );
  const chip = (de: number, ate: number, texto: string, complemento?: string, tComplemento?: number, tamanho = 84) => (
    <Trecho de={de} ate={ate}>
      <ChipInclinado t0={de} t1={ate - 0.07} x={g.W / 2} y={g.chipY} tamanho={tamanho * g.k} complemento={complemento} tComplemento={tComplemento}>
        {texto}
      </ChipInclinado>
    </Trecho>
  );
  return (
    <AbsoluteFill style={{background: LIMA.fundo, fontFamily: FONTE_LIMA}}>
      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={g.camera(zoomCamera(t))} sombra={false}>
        <OffthreadVideo src={MASTER} style={{width: MW, height: MH}} />
      </CameraCard>

      {tela(T.hoje[0], T.hoje[1], [
        {t: 1.3, texto: 'HOJE', cor: 'lima', tamanho: 220},
        {t: 1.5, texto: 'ÀS 20H', tamanho: 140},
      ])}

      <Trecho de={2.62} ate={4.85}>
        <Identificacao g={g} t0={2.62} t1={4.78} />
      </Trecho>
      {chip(4.88, 6.34, 'SQL Server Expert', 'evento de certificações', 5.0)}

      {tela(T.aula[0], T.aula[1], [
        {t: 6.84, texto: '1ª', cor: 'lima', tamanho: 320},
        {t: 7.42, texto: 'AULA', tamanho: 120, espacado: true},
      ])}

      {chip(8.12, 11.98, 'Na 1ª aula')}
      <Trecho de={T.selos[0]} ate={T.selos[1]}>
        <SelosDP g={g} t300={9.64} t800={10.82} t1={11.91} />
      </Trecho>

      {chip(11.98, 15.3, 'Conteúdo prático', 'dos dois exames', 13.96)}

      {tela(
        T.data[0],
        T.data[1],
        [
          {t: 16.5, texto: 'HOJE', tamanho: 120},
          {t: 17.64, texto: '20H', tamanho: 320},
          {t: 18.66, texto: 'AO VIVO', tamanho: 80, espacado: true},
        ],
        'lima',
      )}

      {chip(19.76, 22.9, 'O link', 'no grupo oficial', 20.92, 96)}
      <Trecho de={22.06} ate={22.9}>
        <PilulaAlerta t0={22.06} t1={22.83} x={g.W / 2} y={g.pilulaY} tamanho={60 * g.k}>
          WhatsApp
        </PilulaAlerta>
      </Trecho>

      {chip(22.9, 99, 'Espero você às 20h!', undefined, undefined, 84)}

      <LegendaKaraoke
        blocos={BLOCOS}
        top={g.legenda.top}
        tamanho={g.legenda.tamanho}
        largura={g.W}
        oculta={[
          [T.selos[0], T.selos[1]],
          [T.data[0], T.data[1]],
          ...g.ocultaLegenda,
        ]}
      />

      <Efeitos lista={EFEITOS} />
    </AbsoluteFill>
  );
};

export const W = VERTICAL.W;
export const H = VERTICAL.H;
export const ENv003: React.FC = () => <Video g={VERTICAL} />;

export const WQ = QUADRADO.W;
export const HQ = QUADRADO.H;
export const ENv003Quadrado: React.FC = () => <Video g={QUADRADO} />;
