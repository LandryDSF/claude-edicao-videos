import React from 'react';
import {Composition, Folder} from 'remotion';
import {MinimalSuico} from './estilos/MinimalSuico';
import {PapelRecortadoLeve} from './estilos/PapelRecortadoLeve';
import {TerminalTecnico} from './estilos/TerminalTecnico';
import {VerticalDados} from './estilos/VerticalDados';
import {VerticalLegendas} from './estilos/VerticalLegendas';
import {VerticalPrint} from './estilos/VerticalPrint';
import {ADv002} from './videos/adv002/ADv002';
import * as ADV002 from './videos/adv002/ADv002';
import {ADv002Quadrado} from './videos/adv002/ADv002Quadrado';
import * as ADV002Q from './videos/adv002/ADv002Quadrado';

const FPS = 30;
const SEIS_SEGUNDOS = 6 * FPS;

export const RemotionRoot: React.FC = () => (
  <>
    {/* Exemplos que rodam sem nenhum vídeo. Servem de referência de estilo, não de padrão fixo. */}
    <Folder name="Estilos">
      <Composition id="MinimalSuico" component={MinimalSuico} width={1920} height={1080} fps={FPS} durationInFrames={SEIS_SEGUNDOS} />
      <Composition id="TerminalTecnico" component={TerminalTecnico} width={1920} height={1080} fps={FPS} durationInFrames={SEIS_SEGUNDOS} />
      <Composition id="PapelRecortadoLeve" component={PapelRecortadoLeve} width={1920} height={1080} fps={FPS} durationInFrames={SEIS_SEGUNDOS} />
      <Composition id="VerticalLegendas" component={VerticalLegendas} width={1080} height={1920} fps={FPS} durationInFrames={SEIS_SEGUNDOS} />
      <Composition id="VerticalPrint" component={VerticalPrint} width={1080} height={1920} fps={FPS} durationInFrames={SEIS_SEGUNDOS} />
      <Composition id="VerticalDados" component={VerticalDados} width={1080} height={1920} fps={FPS} durationInFrames={SEIS_SEGUNDOS} />
    </Folder>

    {/* Seus vídeos entram aqui: um <Folder name="001-slug"> por projeto, com o código em src/videos/<slug>/. */}
    <Folder name="001-ADv002">
      <Composition id="ADv002" component={ADv002} width={ADV002.W} height={ADV002.H} fps={ADV002.FPS} durationInFrames={ADV002.DURACAO} />
      <Composition id="ADv002Quadrado" component={ADv002Quadrado} width={ADV002Q.W} height={ADV002Q.H} fps={ADV002Q.FPS} durationInFrames={ADV002Q.DURACAO} />
    </Folder>
  </>
);
