import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';

// Peças do estilo Lima Black (ficha: estilos/lima-black.md).
// Câmera cheia como base, telas pretas de tipografia gigante, verde-lima como único destaque.
// Todas as peças recebem tempos em segundos do master (vindos do palavras.json).

export const {fontFamily: FONTE_LIMA} = loadFont('normal', {weights: ['600', '800', '900'], subsets: ['latin', 'latin-ext']});

export const LIMA = {
  fundo: '#050505',
  lima: '#CFFD3A',
  sobreLima: '#0A0A0A',
  branco: '#FFFFFF',
  apagado: 'rgba(255,255,255,.35)',
  secundario: 'rgba(255,255,255,.55)',
  vermelho: '#E5342B',
  // Verde escuro da família do lima: aceita letra branca (contraste ~4:1). Branco sobre o lima puro some.
  verde: '#4C8C00',
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const suave = Easing.inOut(Easing.cubic);
const SOMBRA = '0 10px 24px rgba(0,0,0,.45)';

// ---------- Tempo ----------
// Trecho = <Sequence> que continua falando em segundos do master (useT devolve o tempo absoluto).
const Deslocamento = React.createContext(0);
export const useQuadro = () => useCurrentFrame() + React.useContext(Deslocamento);
export const useT = () => {
  const {fps} = useVideoConfig();
  return useQuadro() / fps;
};
export const Trecho: React.FC<{de: number; ate?: number; children: React.ReactNode}> = ({de, ate, children}) => {
  const {fps} = useVideoConfig();
  const base = React.useContext(Deslocamento); // Trecho dentro de Trecho: o <Sequence> é relativo ao pai
  const inicio = Math.round(de * fps);
  return (
    <Sequence from={inicio - base} durationInFrames={ate ? Math.round(ate * fps) - inicio : undefined} premountFor={fps}>
      <Deslocamento.Provider value={inicio}>{children}</Deslocamento.Provider>
    </Sequence>
  );
};

// Mola curta de entrada; sai em `saida` segundos a partir de t1.
export const useMola = (t0: number, t1 = 9999, saida = 4 / 60) => {
  const frame = useQuadro();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spring({frame: frame - t0 * fps, fps, config: {damping: 14, stiffness: 210}});
  const out = interpolate(t, [t1, t1 + saida], [1, 0], clamp);
  return {s, op: Math.min(1, s * 1.6) * out, ativo: t >= t0 && t <= t1 + saida};
};

// ---------- Chip inclinado ----------
// Retângulo lima, texto preto 900 caixa alta, girado -4°, com complemento opcional num chip preto menor.
export const ChipInclinado: React.FC<{
  t0: number;
  t1?: number;
  x: number; // centro
  y: number; // topo
  tamanho?: number;
  complemento?: string;
  tComplemento?: number;
  rot?: number;
  children: React.ReactNode;
}> = ({t0, t1, x, y, tamanho = 76, complemento, tComplemento, rot = -4, children}) => {
  const m = useMola(t0, t1);
  const c = useMola(tComplemento ?? t0 + 0.1, t1);
  if (!m.ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translateX(-50%) rotate(${rot}deg) scale(${0.6 + 0.4 * m.s})`,
        opacity: m.op, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: FONTE_LIMA,
      }}
    >
      <div
        style={{
          background: LIMA.lima, color: LIMA.sobreLima, fontWeight: 900, fontSize: tamanho, lineHeight: 1,
          padding: `${tamanho * 0.16}px ${tamanho * 0.28}px ${tamanho * 0.12}px`, borderRadius: 6, whiteSpace: 'nowrap',
          boxShadow: SOMBRA, textTransform: 'uppercase', letterSpacing: -1,
        }}
      >
        {children}
      </div>
      {complemento && c.ativo && (
        <div
          style={{
            marginTop: -tamanho * 0.08, marginRight: -tamanho * 0.12, background: '#0A0A0A', color: LIMA.branco, fontWeight: 800,
            fontSize: tamanho * 0.42, lineHeight: 1, padding: `${tamanho * 0.1}px ${tamanho * 0.18}px`, borderRadius: 4,
            whiteSpace: 'nowrap', opacity: c.op, transform: `scale(${0.6 + 0.4 * c.s})`, transformOrigin: 'right top',
            boxShadow: SOMBRA, textTransform: 'uppercase', letterSpacing: 0.5,
          }}
        >
          {complemento}
        </div>
      )}
    </div>
  );
};

// ---------- Tela tipográfica (preta) ----------
// Cobre a câmera; cada linha entra no tempo da fala. A fonte encolhe para caber na largura.
// margemAbaixo: espaço extra (px, antes da escala) quando a linha de baixo tem barra ou acento que sobe (ex.: "30/11").
export type LinhaTipo = {t: number; texto: string; cor?: 'lima' | 'branco'; tamanho?: number; espacado?: boolean; margemAbaixo?: number};

// tema 'lima' = tela cheia de data: fundo lima, todo o texto em preto.
export const TelaTipografica: React.FC<{de: number; ate: number; linhas: LinhaTipo[]; largura: number; altura: number; escala?: number; centroY?: number; tema?: 'preto' | 'lima'}> = ({
  de, ate, linhas, largura, altura, escala = 1, centroY = 0.45, tema = 'preto',
}) => {
  const claro = tema === 'lima';
  const t = useT();
  const {fps} = useVideoConfig();
  const frame = useQuadro();
  if (t < de || t >= ate) return null;
  const caber = (texto: string, tam: number, esp: boolean) =>
    Math.min(tam * escala, (largura - 120) / (texto.length * (esp ? 0.95 : 0.7)));
  return (
    <AbsoluteFill style={{background: claro ? LIMA.lima : LIMA.fundo, fontFamily: FONTE_LIMA}}>
      <AbsoluteFill
        style={{
          background: claro
            ? `radial-gradient(circle at 50% ${centroY * 100}%, rgba(255,255,255,.35), transparent 60%)`
            : `radial-gradient(circle at 50% ${centroY * 100}%, rgba(207,253,58,.13), transparent 55%)`,
        }}
      />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: altura * centroY, transform: 'translateY(-50%)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: 22 * escala, // folga para a barra e os acentos das fontes grandes
        }}
      >
        {linhas
          .filter((l) => t >= l.t)
          .map((l) => {
            const s = spring({frame: frame - l.t * fps, fps, config: {damping: 14, stiffness: 220}});
            const tam = caber(l.texto, l.tamanho ?? 140, !!l.espacado);
            const lima = l.cor === 'lima';
            return (
              <div
                key={l.texto + l.t}
                style={{
                  fontWeight: 900, fontSize: tam, lineHeight: 1.02, color: claro ? LIMA.sobreLima : lima ? LIMA.lima : LIMA.branco, whiteSpace: 'nowrap',
                  letterSpacing: l.espacado ? `${interpolate(s, [0, 1], [0.6, 0.25])}em` : -1,
                  transform: `scale(${0.75 + 0.25 * s})`, opacity: Math.min(1, s * 1.6), marginBottom: (l.margemAbaixo ?? 0) * escala,
                  textShadow: lima && !claro ? '0 0 40px rgba(207,253,58,.35)' : undefined,
                }}
              >
                {l.texto}
              </div>
            );
          })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Checklist ----------
// Caixa lima vazia entra com o item; 4 quadros (a 60 fps) depois o check se desenha.
export const Checklist: React.FC<{itens: {t: number; texto: string}[]; x: number; y: number; tamanho?: number; t1?: number; linha?: number; horizontal?: boolean}> = ({
  itens, x, y, tamanho = 62, t1, linha = 1.38, horizontal = false,
}) => {
  const t = useT();
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, display: 'flex', flexDirection: horizontal ? 'row' : 'column', gap: horizontal ? tamanho * 0.7 : tamanho * (linha - 1),
        fontFamily: FONTE_LIMA,
      }}
    >
      {itens.map((it) => (
        <Item key={it.texto} t0={it.t} t1={t1} tamanho={tamanho} marcado={interpolate(t, [it.t + 4 / 60, it.t + 0.3], [0, 1], {...clamp, easing: suave})}>
          {it.texto}
        </Item>
      ))}
    </div>
  );
};

const Item: React.FC<{t0: number; t1?: number; tamanho: number; marcado: number; children: React.ReactNode}> = ({t0, t1, tamanho, marcado, children}) => {
  const m = useMola(t0, t1);
  if (!m.ativo) return <div style={{height: tamanho}} />;
  const lado = tamanho * 0.82;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: tamanho * 0.3, opacity: m.op, transform: `translateX(${(1 - m.s) * -40}px)`}}>
      <div style={{width: lado, height: lado, borderRadius: lado * 0.18, background: LIMA.lima, boxShadow: SOMBRA, position: 'relative', flex: 'none'}}>
        <svg viewBox="0 0 24 24" style={{position: 'absolute', inset: lado * 0.12}}>
          <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={LIMA.sobreLima} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - marcado} />
        </svg>
      </div>
      <div style={{color: LIMA.branco, fontWeight: 900, fontSize: tamanho, lineHeight: 1, whiteSpace: 'nowrap', textShadow: '0 4px 18px rgba(0,0,0,.75), 0 2px 3px rgba(0,0,0,.8)', textTransform: 'uppercase'}}>
        {children}
      </div>
    </div>
  );
};

// ---------- Selo (PNG transparente recortado pela área visível) ----------
export type RecorteSelo = {src: string; lado: number; x0: number; y0: number; x1: number; y1: number};

export const SeloPNG: React.FC<{t0: number; t1?: number; x: number; y: number; h: number; selo: RecorteSelo; brilho?: number}> = ({t0, t1, x, y, h, selo, brilho = 0}) => {
  const {s, op, ativo} = useMola(t0, t1);
  if (!ativo) return null;
  const esc = h / (selo.y1 - selo.y0);
  const w = (selo.x1 - selo.x0) * esc;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, opacity: op, transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -10}deg)`,
        filter: `drop-shadow(0 12px 22px rgba(0,0,0,.55)) drop-shadow(0 0 ${28 * brilho}px rgba(207,253,58,${0.85 * brilho}))`,
      }}
    >
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <Img src={selo.src} style={{position: 'absolute', left: -selo.x0 * esc, top: -selo.y0 * esc, width: selo.lado * esc, height: selo.lado * esc}} />
      </div>
    </div>
  );
};

export const larguraSelo = (selo: RecorteSelo, h: number) => ((selo.x1 - selo.x0) * h) / (selo.y1 - selo.y0);

// Rótulo pequeno (nome) acima do chip de título, ao lado do selo.
export const Rotulo: React.FC<{t0: number; t1?: number; x: number; y: number; tamanho?: number; children: React.ReactNode}> = ({t0, t1, x, y, tamanho = 34, children}) => {
  const m = useMola(t0, t1);
  if (!m.ativo) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: FONTE_LIMA, fontWeight: 600, fontSize: tamanho, color: LIMA.branco, opacity: m.op * 0.9, textShadow: '0 2px 10px rgba(0,0,0,.8)', whiteSpace: 'nowrap'}}>
      {children}
    </div>
  );
};

// ---------- Pílula de chamada (uso único por vídeo) ----------
// Padrão aprovado no 004.ENv006: verde escuro com letra branca e contorno lima (o vermelho destoou).
export const PilulaAlerta: React.FC<{t0: number; t1?: number; x: number; y: number; tamanho?: number; children: React.ReactNode}> = ({t0, t1, x, y, tamanho = 50, children}) => {
  const m = useMola(t0, t1);
  if (!m.ativo) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${0.6 + 0.4 * m.s})`, opacity: m.op, background: LIMA.verde,
        border: `${Math.max(3, tamanho * 0.07)}px solid ${LIMA.lima}`,
        color: LIMA.branco, fontFamily: FONTE_LIMA, fontWeight: 900, fontSize: tamanho, lineHeight: 1, padding: `${tamanho * 0.32}px ${tamanho * 0.6}px`,
        borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 0 26px rgba(207,253,58,.35), 0 10px 24px rgba(0,0,0,.45)', textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  );
};

// ---------- Seta desenhada ----------
export const SetaDesenhada: React.FC<{t0: number; de: [number, number]; para: [number, number]; curva?: number; largura?: number}> = ({t0, de, para, curva = -120, largura = 9}) => {
  const t = useT();
  const p = interpolate(t, [t0, t0 + 0.5], [0, 1], {...clamp, easing: suave});
  const ponta = interpolate(t, [t0 + 0.42, t0 + 0.6], [0, 1], clamp);
  if (p <= 0) return null;
  const [x0, y0] = de;
  const [x1, y1] = para;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + curva;
  const ang = Math.atan2(y1 - cy, x1 - cx);
  const a = 34;
  const asa = (d: number) => `${x1 - a * Math.cos(ang + d)},${y1 - a * Math.sin(ang + d)}`;
  return (
    <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width="100%" height="100%">
      <path d={`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`} fill="none" stroke={LIMA.lima} strokeWidth={largura} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <polyline points={`${asa(0.5)} ${x1},${y1} ${asa(-0.5)}`} fill="none" stroke={LIMA.lima} strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" opacity={ponta} />
    </svg>
  );
};

// ---------- Contorno lima (código no SSMS) ----------
export const ContornoLima: React.FC<{t0: number; t1?: number; x: number; y: number; w: number; h: number}> = ({t0, t1 = 9999, x, y, w, h}) => {
  const t = useT();
  const p = interpolate(t, [t0, t0 + 0.35], [0, 1], {...clamp, easing: suave}) * interpolate(t, [t1, t1 + 0.15], [1, 0], clamp);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 8, border: `4px solid ${LIMA.lima}`, opacity: p,
        boxShadow: `0 0 ${18 * p}px ${LIMA.lima}, inset 0 0 0 999px rgba(207,253,58,.10)`, transform: `scale(${1.12 - 0.12 * p})`, transformOrigin: 'left center',
      }}
    />
  );
};

// ---------- Legenda karaokê ----------
// Minúscula, branca, janela de 2–3 palavras; as que ainda não foram ditas ficam apagadas.
export type Palavra = {w: string; s: number; e: number};
export type BlocoLegenda = {s: number; e: number; palavras: Palavra[]};

export const montarBlocos = (palavras: Palavra[], max = 3): BlocoLegenda[] => {
  const out: BlocoLegenda[] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p, i) => {
    atual.push(p);
    const prox = palavras[i + 1];
    if (!prox || /[.,!?]$/.test(p.w) || atual.length >= max || prox.s - p.e > 0.35 || p.w.length > 14) {
      out.push({s: atual[0].s, e: p.e, palavras: atual});
      atual = [];
    }
  });
  return out.map((b, i) => ({...b, e: Math.min(out[i + 1]?.s ?? b.e + 0.5, b.e + 0.5)}));
};

const minuscula = (w: string) => {
  const limpa = w.replace(/[.,!?]$/, '');
  return limpa === limpa.toUpperCase() && /[A-Z]/.test(limpa) ? limpa : limpa.toLowerCase();
};

export const LegendaKaraoke: React.FC<{blocos: BlocoLegenda[]; top: number; tamanho?: number; oculta?: [number, number][]; largura: number}> = ({
  blocos, top, tamanho = 50, oculta = [], largura,
}) => {
  const t = useT();
  if (oculta.some(([a, b]) => t >= a && t < b)) return null;
  const bloco = blocos.find((b) => t >= b.s && t < b.e);
  if (!bloco) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 60, width: largura - 120, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `4px ${tamanho * 0.28}px`,
        fontFamily: FONTE_LIMA, fontWeight: 600, fontSize: tamanho, lineHeight: 1.2,
      }}
    >
      {bloco.palavras.map((w) => (
        <span key={w.s} style={{color: t >= w.s ? LIMA.branco : LIMA.apagado, textShadow: t >= w.s ? '0 3px 10px rgba(0,0,0,.85), 0 1px 2px rgba(0,0,0,.9)' : '0 2px 8px rgba(0,0,0,.5)', whiteSpace: 'nowrap'}}>
          {minuscula(w.w)}
        </span>
      ))}
    </div>
  );
};

// ---------- Efeitos sonoros ----------
// Biblioteca sintetizada em projetos/_audio/efeitos/ (sem licença, pico em -3 dB). A voz do master é intocável:
// os efeitos são camadas por baixo dela. O whoosh começa em silêncio: dispare 0,2 s antes do corte.
export type Som = 'whoosh' | 'pop' | 'check' | 'impacto' | 'riser' | 'swish';
// Medido no 006.ENv007: com o dobro destes volumes os efeitos empatavam com a voz. Assim ficam ~6–8 dB abaixo da fala.
export const VOLUME_SOM: Record<Som, number> = {whoosh: 0.18, pop: 0.12, check: 0.15, impacto: 0.22, riser: 0.15, swish: 0.2};
const DURACAO_SOM: Record<Som, number> = {whoosh: 0.55, pop: 0.16, check: 0.32, impacto: 0.9, riser: 1.2, swish: 0.4};

export const Efeitos: React.FC<{lista: {t: number; som: Som; volume?: number}[]}> = ({lista}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {lista.map(({t, som, volume}) => (
        <Sequence key={`${som}-${t}`} from={Math.max(0, Math.round(t * fps))} durationInFrames={Math.ceil((DURACAO_SOM[som] + 0.05) * fps)}>
          <Audio src={staticFile(`_audio/efeitos/${som}.wav`)} volume={volume ?? VOLUME_SOM[som]} />
        </Sequence>
      ))}
    </>
  );
};
