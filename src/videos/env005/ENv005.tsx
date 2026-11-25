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

// 003.ENv005 — "Você já entrou no grupo?": inscritos da Black Friday SQL Server Expert 2026 → grupo do WhatsApp.
// Estilo Lima Black (mesmas peças e geometria do 004.ENv006). Plano: projetos/003.ENv005/plano.md.

export const FPS = 60;
export const DURACAO = 2037; // quadros do master (33,947 s)

const PASTA = '003.ENv005';
const MASTER = staticFile(`${PASTA}/video/ENv 005 Você já entrou no grupo.mp4`);
const MCT: RecorteSelo = {src: staticFile(`${PASTA}/prints/MCT.png`), lado: 378, x0: 49, y0: 38, x1: 325, y1: 343};

// Mesmo cenário do 004: zona do rosto conferida em projetos/003.ENv005/frames/sheet_rosto.jpg.
const MW = 1080;
const MH = 1920;
const ROSTO: ZonaRosto = {x0: 140, y0: 500, x1: 800, y1: 1180};

const BLOCOS = montarBlocos(PALAVRAS);

const T = {
  checklist: [10.83, 18.51],
  numero: [11.51, 13.69],
  grupo: [6.69, 8.39],
  data: [20.41, 23.71],
  pilula: [29.31, 31.87],
  seta: 31.05,
  cta: 31.87,
} as const;

const rampa = (t: number, a: number, b: number, z0: number, z1: number) => interpolate(t, [a, b], [z0, z1], {...clamp, easing: suave});

const zoomCamera = (t: number) => {
  if (t < 2.21) return 1;
  if (t < 5.09) return rampa(t, 2.21, 5.0, 1, 1.05);
  if (t < 6.69) return 1.12; // "mas já entrou..."
  if (t < 16.17) return 1;
  if (t < 18.51) return rampa(t, 16.17, 18.4, 1, 1.04); // "aproveitar ao máximo"
  if (t < 23.71) return 1;
  if (t < 26.27) return rampa(t, 23.71, 26.2, 1, 1.03);
  if (t < 29.31) return 1;
  if (t < T.cta) return rampa(t, 29.31, 31.8, 1, 1.05);
  return 1.05;
};

type Geo = {
  W: number;
  H: number;
  camera: (zoom: number) => LayoutCamera;
  k: number;
  chipY: number;
  legenda: {top: number; tamanho: number};
  tipo: {escala: number; centroY: number};
  checklist: {x: number; y: number; tamanho: number; horizontal: boolean};
  selo: {x: number; y: number; h: number};
  pilulaY: number;
  seta: {de: [number, number]; para: [number, number]; curva: number};
  cta: {top: number; linha: boolean};
  legendaSobPilula: boolean;
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
  pilulaY: 1330,
  seta: {de: [560, 1440], para: [540, 1690], curva: 0},
  cta: {top: 120, linha: false},
  legendaSobPilula: true,
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
  legenda: {top: 952, tamanho: 40},
  tipo: {escala: 0.78, centroY: 0.47},
  checklist: {x: 40, y: 948, tamanho: 34, horizontal: true},
  selo: {x: 36, y: 26, h: 150},
  pilulaY: 920,
  seta: {de: [880, 800], para: [960, 1050], curva: 0},
  cta: {top: 40, linha: true},
  legendaSobPilula: false,
};

const Abertura: React.FC<{g: Geo}> = ({g}) => {
  const xTexto = g.selo.x + larguraSelo(MCT, g.selo.h) + 30 * g.k;
  return (
    <>
      <SeloPNG t0={0.11} t1={2.12} x={g.selo.x} y={g.selo.y} h={g.selo.h} selo={MCT} />
      <Rotulo t0={0.2} t1={2.12} x={xTexto} y={g.selo.y + 8 * g.k} tamanho={36 * g.k}>
        Landry Duailibe
      </Rotulo>
      <ChipInclinado t0={0.3} t1={2.12} x={(xTexto + g.W - 40) / 2} y={g.selo.y + 62 * g.k} tamanho={96 * g.k} complemento="Microsoft Certified Trainer" tComplemento={0.67}>
        MCT
      </ChipInclinado>
      <ChipInclinado t0={2.21} t1={5.03} x={g.W / 2} y={g.chipY} tamanho={84 * g.k} complemento="30 de novembro" tComplemento={3.81}>
        SQL Server Expert
      </ChipInclinado>
    </>
  );
};

const CTA: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const veu = interpolate(t, [T.cta, T.cta + 0.3], [0, 0.62], clamp);
  const a = useMola(T.cta);
  const b = useMola(32.37); // "no grupo"
  const c = useMola(33.07); // "espero você lá"
  return (
    <AbsoluteFill style={{fontFamily: FONTE_LIMA}}>
      <AbsoluteFill style={{background: `rgba(0,0,0,${veu})`}} />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: g.cta.top, display: 'flex', flexDirection: g.cta.linha ? 'row' : 'column',
          alignItems: g.cta.linha ? 'baseline' : 'center', justifyContent: 'center', columnGap: 24,
        }}
      >
        <div style={{color: LIMA.branco, fontWeight: 900, fontSize: g.cta.linha ? 66 : 96, lineHeight: 1, opacity: a.op, transform: `scale(${0.7 + 0.3 * a.s})`, whiteSpace: 'nowrap'}}>
          ENTRA NO
        </div>
        <div
          style={{
            color: LIMA.lima, fontWeight: 900, fontSize: g.cta.linha ? 112 : 180, lineHeight: 1.05, letterSpacing: -3, whiteSpace: 'nowrap',
            opacity: b.op, transform: `scale(${0.6 + 0.4 * b.s})`, textShadow: '0 0 50px rgba(207,253,58,.35)',
          }}
        >
          GRUPO
        </div>
        {!g.cta.linha && (
          <div style={{color: LIMA.branco, fontWeight: 800, fontSize: 42, opacity: c.op, letterSpacing: 2, marginTop: 8}}>ESPERO VOCÊ LÁ</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const Video: React.FC<{g: Geo}> = ({g}) => {
  const t = useT();
  const tela = (de: number, ate: number, linhas: React.ComponentProps<typeof TelaTipografica>['linhas'], tema: 'preto' | 'lima' = 'preto') => (
    <Trecho de={de} ate={ate}>
      <TelaTipografica de={de} ate={ate} linhas={linhas} largura={g.W} altura={g.H} escala={g.tipo.escala} centroY={g.tipo.centroY} tema={tema} />
    </Trecho>
  );
  return (
    <AbsoluteFill style={{background: LIMA.fundo, fontFamily: FONTE_LIMA}}>
      {/* câmera: UMA instância contínua do master, com o áudio original */}
      <CameraCard layout={g.camera(zoomCamera(t))} sombra={false}>
        <OffthreadVideo src={MASTER} style={{width: MW, height: MH}} />
      </CameraCard>

      <Trecho de={0} ate={5.1}>
        <Abertura g={g} />
      </Trecho>

      {tela(T.grupo[0], T.grupo[1], [
        {t: 6.69, texto: 'GRUPO', tamanho: 140},
        {t: 7.01, texto: 'OFICIAL', tamanho: 140},
        {t: 7.73, texto: 'WHATSAPP?', cor: 'lima', tamanho: 160},
      ])}

      <Trecho de={T.checklist[0]} ate={T.checklist[1]}>
        <Checklist
          t1={T.checklist[1] - 0.07}
          x={g.checklist.x}
          y={g.checklist.y}
          tamanho={g.checklist.tamanho}
          horizontal={g.checklist.horizontal}
          itens={[
            {t: 10.83, texto: 'Links das aulas'},
            {t: 13.69, texto: 'E-books'},
            {t: 15.09, texto: 'Orientações'},
          ]}
        />
      </Trecho>

      {tela(T.numero[0], T.numero[1], [
        {t: 11.51, texto: '4', cor: 'lima', tamanho: 320},
        {t: 12.19, texto: 'AULAS', tamanho: 100, espacado: true},
        {t: 12.71, texto: 'GRATUITAS', tamanho: 120},
      ])}

      {tela(
        T.data[0],
        T.data[1],
        [
          {t: 20.41, texto: 'AULAS AO VIVO', tamanho: 56, espacado: true, margemAbaixo: 40},
          {t: 20.41, texto: '30/11', tamanho: 300},
          {t: 22.13, texto: 'ATÉ 03/12', tamanho: 140},
        ],
        'lima',
      )}

      <Trecho de={24.17} ate={26.27}>
        <ChipInclinado t0={24.17} t1={26.2} x={g.W / 2} y={g.chipY} tamanho={96 * g.k} complemento="ao vivo" tComplemento={25.07}>
          20h
        </ChipInclinado>
      </Trecho>

      <Trecho de={26.99} ate={29.31}>
        <ChipInclinado t0={26.99} t1={29.25} x={g.W / 2} y={g.chipY} tamanho={84 * g.k} complemento="grupo do WhatsApp" tComplemento={28.49}>
          Ainda não entrou?
        </ChipInclinado>
      </Trecho>

      <Trecho de={T.pilula[0]} ate={T.pilula[1]}>
        <PilulaAlerta t0={T.pilula[0]} t1={T.pilula[1] - 0.07} x={g.W / 2} y={g.pilulaY} tamanho={56 * g.k}>
          Clica no link
        </PilulaAlerta>
      </Trecho>

      <Trecho de={T.cta}>
        <CTA g={g} />
      </Trecho>

      {/* seta para o link ("aqui embaixo"), fica até o fim */}
      <Trecho de={T.seta}>
        <SetaDesenhada t0={T.seta} de={g.seta.de} para={g.seta.para} curva={g.seta.curva} largura={11 * g.k} />
      </Trecho>

      <LegendaKaraoke
        blocos={BLOCOS}
        top={g.legenda.top}
        tamanho={g.legenda.tamanho}
        largura={g.W}
        oculta={[
          [T.checklist[0], T.checklist[1]],
          [T.data[0], T.data[1]],
          [T.cta, 999],
          ...(g.legendaSobPilula ? [] : [[T.pilula[0], T.pilula[1]] as [number, number]]),
        ]}
      />
    </AbsoluteFill>
  );
};

export const W = VERTICAL.W;
export const H = VERTICAL.H;
export const ENv005: React.FC = () => <Video g={VERTICAL} />;

export const WQ = QUADRADO.W;
export const HQ = QUADRADO.H;
export const ENv005Quadrado: React.FC = () => <Video g={QUADRADO} />;
