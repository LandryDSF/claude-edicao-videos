import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile} from 'remotion';
import type {ZonaRosto} from '../../_shared/enquadramento';
import {CameraCard, type LayoutCamera, layoutCheio} from '../../_shared/split-vertical';
import {
  ChipInclinado,
  Checklist,
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

// 005.ENv002 — "Falta 1 dia": véspera da Black Friday SQL Server Expert. Irmão do 005.ENv001 ("Faltam 2 dias").
// Estilo Lima Black + efeitos sonoros (sem música). Plano: projetos/005.ENv002/plano.md.

export const FPS = 60;
export const DURACAO = 1888; // quadros do master (31,486 s)

const PASTA = '005.ENv002';
const MASTER = staticFile(`${PASTA}/video/ENv 002 Falta 1 dia.mp4`);
const CERTIFICADOS = staticFile(`${PASTA}/telas/Certificacoes.mp4`);
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
  amanha: [1.49, 2.93],
  broll: [2.93, 5.07],
  aula: [7.17, 8.47],
  lista: [9.17, 11.9],
  selos: [11.95, 13.99],
  data: [19.05, 23.11],
  grupo: [25.69, 27.17],
} as const;

const rampa = (t: number, a: number, b: number, z0: number, z1: number) => interpolate(t, [a, b], [z0, z1], {...clamp, easing: suave});

const zoomCamera = (t: number) => {
  if (t < 5.07) return rampa(t, 0, 1.49, 1, 1.03);
  if (t < 6.65) return 1.12; // "Reserva aí na sua agenda, hein?"
  if (t < 13.99) return 1;
  if (t < 17.65) return rampa(t, 13.99, 17.6, 1, 1.05);
  if (t < 23.11) return 1;
  if (t < 30.39) return rampa(t, 23.11, 30.3, 1, 1.04);
  return 1.06; // "Espero você amanhã"
};

type Geo = {
  W: number;
  H: number;
  camera: (zoom: number) => LayoutCamera;
  k: number;
  chipY: number;
  chipMeioY: number;
  pilulaY: number;
  legenda: {top: number; tamanho: number};
  tipo: {escala: number; centroY: number};
  checklist: {x: number; y: number; tamanho: number; horizontal: boolean};
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
  chipMeioY: 1180,
  pilulaY: 1330,
  legenda: {top: 1236, tamanho: 50},
  tipo: {escala: 1, centroY: 0.42},
  checklist: {x: 70, y: 1225, tamanho: 58, horizontal: false},
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
  chipMeioY: 820,
  pilulaY: 920,
  legenda: {top: 952, tamanho: 40},
  tipo: {escala: 0.78, centroY: 0.47},
  checklist: {x: 40, y: 948, tamanho: 34, horizontal: true},
  selo: {x: 36, y: 26, h: 150},
  selosDP: {y: 900, h: 160, afast: 105},
  ocultaLegenda: [[28.35, 30.39]],
};

// B-roll dos certificados, com o selo MCT como identificação (igual ao 005.ENv001).
const Certificados: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const [de, ate] = T.broll;
  const op = interpolate(t, [de, de + 0.12], [0, 1], clamp) * interpolate(t, [ate - 0.12, ate], [1, 0], clamp);
  const xTexto = g.selo.x + larguraSelo(MCT, g.selo.h) + 30 * g.k;
  return (
    <AbsoluteFill style={{opacity: op}}>
      <AbsoluteFill style={{background: '#000'}}>
        <OffthreadVideo src={CERTIFICADOS} muted style={{width: g.W, height: g.H, objectFit: 'cover'}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 28%, rgba(0,0,0,.15) 55%, rgba(0,0,0,.6) 100%)'}} />
      </AbsoluteFill>
      <SeloPNG t0={de} x={g.selo.x} y={g.selo.y} h={g.selo.h} selo={MCT} />
      <Rotulo t0={de + 0.05} x={xTexto} y={g.selo.y + 8 * g.k} tamanho={36 * g.k}>
        Landry Duailibe
      </Rotulo>
      <ChipInclinado t0={de + 0.1} x={(xTexto + g.W - 40) / 2} y={g.selo.y + 62 * g.k} tamanho={96 * g.k} complemento="Microsoft Certified Trainer" tComplemento={de + 0.3}>
        MCT
      </ChipInclinado>
      <ChipInclinado t0={3.61} x={g.W / 2} y={g.chipMeioY} tamanho={88 * g.k} complemento="evento de certificação" tComplemento={3.8}>
        SQL Server Expert
      </ChipInclinado>
    </AbsoluteFill>
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
  ...s('whoosh', 1.29, 2.73, 6.97, 18.85, 25.49),
  ...s('impacto', 11.95, 20.13),
  ...s('pop', 3.61, 5.07, 8.47, 13.99, 24.01, 28.35, 30.39),
  ...s('check', 9.24, 10.64),
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

      {tela(T.amanha[0], T.amanha[1], [
        {t: 1.49, texto: 'AMANHÃ', cor: 'lima', tamanho: 170},
        {t: 1.49, texto: 'COMEÇA', tamanho: 120, espacado: true},
      ])}

      <Trecho de={T.broll[0]} ate={T.broll[1]}>
        <Certificados g={g} />
      </Trecho>

      {chip(5.07, 6.65, 'Reserve', 'na sua agenda', 5.95)}

      {tela(T.aula[0], T.aula[1], [
        {t: 7.17, texto: '1ª', cor: 'lima', tamanho: 320},
        {t: 7.77, texto: 'AULA', tamanho: 120, espacado: true},
      ])}

      {chip(8.47, 13.99, 'Na 1ª aula')}
      <Trecho de={T.lista[0]} ate={T.lista[1]}>
        <Checklist
          t1={T.lista[1] - 0.07}
          x={g.checklist.x}
          y={g.checklist.y}
          tamanho={g.checklist.tamanho}
          horizontal={g.checklist.horizontal}
          itens={[
            {t: 9.17, texto: 'Carreira'},
            {t: 10.57, texto: 'Certificações Microsoft'},
          ]}
        />
      </Trecho>
      <Trecho de={T.selos[0]} ate={T.selos[1]}>
        <SelosDP g={g} t300={11.95} t800={12.77} t1={13.92} />
      </Trecho>

      {chip(13.99, 17.65, 'Conteúdo prático', 'dos dois exames', 16.13)}

      {tela(
        T.data[0],
        T.data[1],
        [
          {t: 19.05, texto: 'SEGUNDA-FEIRA', tamanho: 80, margemAbaixo: 40},
          {t: 20.13, texto: '30/11', tamanho: 300},
          {t: 21.33, texto: '20H', tamanho: 140},
          {t: 22.45, texto: 'AO VIVO', tamanho: 70, espacado: true},
        ],
        'lima',
      )}

      {chip(24.01, 25.69, 'Já está inscrito?', 'confira o grupo', 24.87)}

      {tela(T.grupo[0], T.grupo[1], [
        {t: 25.69, texto: 'GRUPO OFICIAL', tamanho: 120},
        {t: 26.79, texto: 'NO WHATSAPP', cor: 'lima', tamanho: 150},
      ])}

      <Trecho de={28.35} ate={30.39}>
        <PilulaAlerta t0={28.35} t1={30.32} x={g.W / 2} y={g.pilulaY} tamanho={56 * g.k}>
          O link das aulas
        </PilulaAlerta>
      </Trecho>

      {chip(30.39, 99, 'Espero você amanhã!', undefined, undefined, 84)}

      <LegendaKaraoke
        blocos={BLOCOS}
        top={g.legenda.top}
        tamanho={g.legenda.tamanho}
        largura={g.W}
        oculta={[
          [T.broll[0], T.broll[1]],
          [T.lista[0], T.selos[1]],
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
export const ENv002: React.FC = () => <Video g={VERTICAL} />;

export const WQ = QUADRADO.W;
export const HQ = QUADRADO.H;
export const ENv002Quadrado: React.FC = () => <Video g={QUADRADO} />;
