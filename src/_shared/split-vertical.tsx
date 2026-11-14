import React from 'react';
import {interpolate} from 'remotion';
import {enquadrarRosto, type ZonaRosto} from './enquadramento';

// Tela dividida para vídeos VERTICAIS (9:16): conteúdo em cima, câmera em card embaixo.
// Mesma regra da synchronized-split.tsx: a câmera e o painel usam o MESMO progresso (mesma curva,
// mesma janela de tempo), e o painel só aparece quando a câmera já fez ~70% do caminho.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type Retangulo = {x: number; y: number; w: number; h: number; r: number};

// Onde fica o card da câmera e como o master é posicionado dentro dele (transform-origin 0 0).
export type LayoutCamera = {card: Retangulo; video: {x: number; y: number; scale: number}};

// Câmera cheia, com zoom em torno do centro do rosto (push-in / punch-in sem borda preta).
export const layoutCheio = (w: number, h: number, rosto: ZonaRosto, zoom = 1): LayoutCamera => {
  const cx = (rosto.x0 + rosto.x1) / 2;
  const cy = (rosto.y0 + rosto.y1) / 2;
  const x = Math.min(0, Math.max(w - w * zoom, cx - cx * zoom));
  const y = Math.min(0, Math.max(h - h * zoom, cy - cy * zoom));
  return {card: {x: 0, y: 0, w, h, r: 0}, video: {x, y, scale: zoom}};
};

// Câmera em card: escala e posição vêm de enquadrarRosto (o rosto inteiro cabe, com margem).
export const layoutCard = (card: Retangulo, rosto: ZonaRosto, canvasWidth: number, canvasHeight: number): LayoutCamera => {
  const v = enquadrarRosto({w: card.w, h: card.h}, rosto, {canvasWidth, canvasHeight});
  return {card, video: {x: v.x, y: v.y, scale: v.scale}};
};

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const misturarLayouts = (a: LayoutCamera, b: LayoutCamera, p: number): LayoutCamera => ({
  card: {
    x: mix(a.card.x, b.card.x, p),
    y: mix(a.card.y, b.card.y, p),
    w: mix(a.card.w, b.card.w, p),
    h: mix(a.card.h, b.card.h, p),
    r: mix(a.card.r, b.card.r, p),
  },
  video: {
    x: mix(a.video.x, b.video.x, p),
    y: mix(a.video.y, b.video.y, p),
    scale: mix(a.video.scale, b.video.scale, p),
  },
});

// Progresso do painel a partir do progresso da câmera: entra de 70% a 100% e sai nos primeiros 40%.
export const painelEntrando = (progressoCamera: number) => interpolate(progressoCamera, [0.7, 1], [0, 1], clamp);
export const painelSaindo = (progressoCamera: number) => interpolate(progressoCamera, [0, 0.4], [1, 0], clamp);

export const CameraCard: React.FC<{layout: LayoutCamera; children: React.ReactNode; sombra?: boolean}> = ({
  layout,
  children,
  sombra = true,
}) => (
  <div
    style={{
      position: 'absolute',
      left: layout.card.x,
      top: layout.card.y,
      width: layout.card.w,
      height: layout.card.h,
      borderRadius: layout.card.r,
      overflow: 'hidden',
      boxShadow: sombra && layout.card.r > 1 ? '0 24px 70px rgba(0,0,0,.6), 0 0 0 2px rgba(46,163,242,.35)' : 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transformOrigin: '0 0',
        transform: `translate(${layout.video.x}px, ${layout.video.y}px) scale(${layout.video.scale})`,
      }}
    >
      {children}
    </div>
  </div>
);
