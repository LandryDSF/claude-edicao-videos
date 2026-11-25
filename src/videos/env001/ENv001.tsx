import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile} from 'remotion';
import type {ZonaRosto} from '../../_shared/enquadramento';
import {CameraCard, type LayoutCamera, layoutCheio} from '../../_shared/split-vertical';
import {
  ChipInclinado,
  Checklist,
  FONTE_LIMA,
  LIMA,
  LegendaKaraoke,
  type RecorteSelo,
  Rotulo,
  SeloPNG,
  TelaTipografica,
  Trecho,
  clamp,
  larguraSelo,
  montarBlocos,
  suave,
  useT,
} from '../../estilos/lima-black';
import {PALAVRAS} from './palavras';

// 005.ENv001 — "Faltam 2 dias": contagem regressiva da Black Friday SQL Server Expert + chamada para o grupo.
// Estilo Lima Black (mesmas peças e geometria do 004/003). Plano: projetos/005.ENv001/plano.md.

export const FPS = 60;
export const DURACAO = 2874; // quadros do master (47,903 s)

const PASTA = '005.ENv001';
const MASTER = staticFile(`${PASTA}/video/ENv 001 Faltam 2 dias.mp4`);
const CERTIFICADOS = staticFile(`${PASTA}/telas/Certificacoes.mp4`);

// Área visível medida no canal alfa. O DP-300 vem do 001.ADv004 (não há nesta pasta).
const MCT: RecorteSelo = {src: staticFile(`${PASTA}/prints/MCT.png`), lado: 378, x0: 49, y0: 38, x1: 325, y1: 343};
const DP300: RecorteSelo = {src: staticFile('001.ADv004/prints/Dp-300.png'), lado: 525, x0: 18, y0: 9, x1: 510, y1: 516};
const DP800: RecorteSelo = {src: staticFile(`${PASTA}/prints/DP-800.png`), lado: 525, x0: 9, y0: 17, x1: 508, y1: 507};

const MW = 1080;
const MH = 1920;
const ROSTO: ZonaRosto = {x0: 140, y0: 500, x1: 800, y1: 1180};

const BLOCOS = montarBlocos(PALAVRAS);

const T = {
  dias: [1.36, 2.98],
  broll: [2.98, 5.3],
  noites: [7.82, 11.08],
  check1: [13.18, 17.14],
  selos1: [21.96, 24.44],
  data: [25.28, 28.56],
  grupo: [33.06, 36.02],
  check2: [37.26, 43.1],
  selos2: [44.48, 47.0],
} as const;

const rampa = (t: number, a: number, b: number, z0: number, z1: number) => interpolate(t, [a, b], [z0, z1], {...clamp, easing: suave});

const zoomCamera = (t: number) => {
  if (t < 5.3) return rampa(t, 0, 1.36, 1, 1.03);
  if (t < 7.82) return 1.12; // "Você já reservou o seu horário?"
  if (t < 17.14) return rampa(t, 11.08, 17.0, 1, 1.04);
  if (t < 24.44) return 1;
  if (t < 28.56) return 1.08; // "Começamos..." (seco)
  if (t < 36.02) return rampa(t, 28.56, 33.0, 1, 1.04);
  if (t < 43.1) return rampa(t, 36.02, 43.0, 1, 1.05);
  if (t < 47.0) return 1;
  return 1.06; // "Espero você lá!"
};

type Geo = {
  W: number;
  H: number;
  camera: (zoom: number) => LayoutCamera;
  k: number;
  chipY: number;
  chipMeioY: number; // chip sobre o B-roll (sem rosto)
  legenda: {top: number; tamanho: number};
  tipo: {escala: number; centroY: number};
  checklist: {x: number; y: number; tamanho: number; horizontal: boolean};
  selo: {x: number; y: number; h: number};
  selosDP: {y: number; h: number; afast: number};
};

const VERTICAL: Geo = {
  W: 1080,
  H: 1920,
  camera: (zoom) => layoutCheio(MW, MH, ROSTO, zoom),
  k: 1,
  chipY: 290,
  chipMeioY: 1180,
  legenda: {top: 1236, tamanho: 50},
  tipo: {escala: 1, centroY: 0.42},
  checklist: {x: 70, y: 1225, tamanho: 58, horizontal: false},
  selo: {x: 60, y: 250, h: 210},
  selosDP: {y: 1215, h: 250, afast: 150},
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
  legenda: {top: 952, tamanho: 40},
  tipo: {escala: 0.78, centroY: 0.47},
  checklist: {x: 40, y: 948, tamanho: 34, horizontal: true},
  selo: {x: 36, y: 26, h: 150},
  selosDP: {y: 900, h: 160, afast: 105},
};

// B-roll dos certificados, com o selo MCT como identificação.
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
      <ChipInclinado t0={3.74} x={g.W / 2} y={g.chipMeioY} tamanho={88 * g.k} complemento="evento de certificação" tComplemento={3.9}>
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
  const w300 = larguraSelo(DP300, h);
  const w800 = larguraSelo(DP800, h);
  return (
    <>
      <SeloPNG t0={t300} t1={t1} x={g.W / 2 - afast - w300 / 2} y={y} h={h} selo={DP300} brilho={brilho} />
      <SeloPNG t0={t800} t1={t1} x={g.W / 2 + afast - w800 / 2} y={y} h={h} selo={DP800} brilho={brilho} />
    </>
  );
};

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

      {tela(T.dias[0], T.dias[1], [
        {t: 1.36, texto: 'FALTAM', tamanho: 110},
        {t: 1.36, texto: '2', cor: 'lima', tamanho: 340},
        {t: 1.72, texto: 'DIAS', tamanho: 110, espacado: true},
      ])}

      <Trecho de={T.broll[0]} ate={T.broll[1]}>
        <Certificados g={g} />
      </Trecho>

      {chip(5.74, 7.82, 'Já reservou?', 'seu horário', 6.4)}

      {tela(T.noites[0], T.noites[1], [
        {t: 7.82, texto: '4', cor: 'lima', tamanho: 320},
        {t: 8.42, texto: 'NOITES', tamanho: 110, espacado: true},
        {t: 9.48, texto: 'GRATUITAS', tamanho: 120},
        {t: 10.5, texto: 'E AO VIVO', tamanho: 100},
      ])}

      {chip(11.7, 17.14, 'Conteúdo prático')}
      <Trecho de={T.check1[0]} ate={T.check1[1]}>
        <Checklist
          t1={T.check1[1] - 0.07}
          x={g.checklist.x}
          y={g.checklist.y}
          tamanho={g.checklist.tamanho}
          horizontal={g.checklist.horizontal}
          itens={[
            {t: 13.18, texto: 'SQL Server'},
            {t: 14.6, texto: 'Azure'},
            {t: 15.56, texto: g.checklist.horizontal ? 'IA' : 'Inteligência Artificial'},
          ]}
        />
      </Trecho>

      {chip(19.18, 24.44, '2 certificações', 'SQL Server', 21.16)}
      <Trecho de={T.selos1[0]} ate={T.selos1[1]}>
        <SelosDP g={g} t300={21.96} t800={23.16} t1={24.37} />
      </Trecho>

      {tela(
        T.data[0],
        T.data[1],
        [
          {t: 25.28, texto: 'SEGUNDA-FEIRA', tamanho: 80, espacado: false, margemAbaixo: 40},
          {t: 26.44, texto: '30/11', tamanho: 300},
          {t: 28.04, texto: '20H', tamanho: 140},
        ],
        'lima',
      )}

      {chip(29.8, 33.06, 'Já está inscrito?', 'não esqueça', 31.34)}

      {tela(T.grupo[0], T.grupo[1], [
        {t: 33.06, texto: 'GRUPO', tamanho: 140},
        {t: 33.3, texto: 'OFICIAL', tamanho: 140},
        {t: 35.06, texto: 'NO WHATSAPP', cor: 'lima', tamanho: 150},
      ])}

      <Trecho de={T.check2[0]} ate={T.check2[1]}>
        <Checklist
          t1={T.check2[1] - 0.07}
          x={g.checklist.x}
          y={g.checklist.y}
          tamanho={g.checklist.tamanho * (g.checklist.horizontal ? 0.85 : 0.9)}
          horizontal={g.checklist.horizontal}
          itens={[
            {t: 37.26, texto: 'Links das aulas'},
            {t: 38.88, texto: 'E-books gratuitos'},
            {t: 40.92, texto: g.checklist.horizontal ? 'Informações' : 'Informações importantes'},
          ]}
        />
      </Trecho>

      {chip(43.46, 47.0, 'Certificações', 'DP-300 · DP-800', 44.48)}
      <Trecho de={T.selos2[0]} ate={T.selos2[1]}>
        <SelosDP g={g} t300={44.48} t800={46.08} t1={46.93} />
      </Trecho>

      {chip(47.0, 99, 'Espero você lá!', undefined, undefined, 88)}

      <LegendaKaraoke
        blocos={BLOCOS}
        top={g.legenda.top}
        tamanho={g.legenda.tamanho}
        largura={g.W}
        oculta={[
          [T.broll[0], T.broll[1]],
          [T.check1[0], T.check1[1]],
          [T.selos1[0], T.selos1[1]],
          [T.data[0], T.data[1]],
          [T.check2[0], T.check2[1]],
          [T.selos2[0], T.selos2[1]],
        ]}
      />
    </AbsoluteFill>
  );
};

export const W = VERTICAL.W;
export const H = VERTICAL.H;
export const ENv001: React.FC = () => <Video g={VERTICAL} />;

export const WQ = QUADRADO.W;
export const HQ = QUADRADO.H;
export const ENv001Quadrado: React.FC = () => <Video g={QUADRADO} />;
