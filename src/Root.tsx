import React from 'react';
import {Composition, Folder} from 'remotion';
import {MinimalSuico} from './estilos/MinimalSuico';
import {PapelRecortadoLeve} from './estilos/PapelRecortadoLeve';
import {TerminalTecnico} from './estilos/TerminalTecnico';
import {VerticalDados} from './estilos/VerticalDados';
import {VerticalLegendas} from './estilos/VerticalLegendas';
import {VerticalPrint} from './estilos/VerticalPrint';
import {ADv001} from './videos/adv001/ADv001';
import * as ADV001 from './videos/adv001/ADv001';
import {ADv001Quadrado} from './videos/adv001/ADv001Quadrado';
import * as ADV001Q from './videos/adv001/ADv001Quadrado';
import {ADv002} from './videos/adv002/ADv002';
import * as ADV002 from './videos/adv002/ADv002';
import {ADv002Quadrado} from './videos/adv002/ADv002Quadrado';
import * as ADV002Q from './videos/adv002/ADv002Quadrado';
import {ADv003} from './videos/adv003/ADv003';
import * as ADV003 from './videos/adv003/ADv003';
import {ADv003Quadrado} from './videos/adv003/ADv003Quadrado';
import * as ADV003Q from './videos/adv003/ADv003Quadrado';

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
    <Folder name="001-ADv001">
      <Composition id="ADv001" component={ADv001} width={ADV001.W} height={ADV001.H} fps={ADV001.FPS} durationInFrames={ADV001.DURACAO} />
      <Composition id="ADv001Quadrado" component={ADv001Quadrado} width={ADV001Q.W} height={ADV001Q.H} fps={ADV001Q.FPS} durationInFrames={ADV001Q.DURACAO} />
    </Folder>
    <Folder name="001-ADv002">
      <Composition id="ADv002" component={ADv002} width={ADV002.W} height={ADV002.H} fps={ADV002.FPS} durationInFrames={ADV002.DURACAO} />
      <Composition id="ADv002Quadrado" component={ADv002Quadrado} width={ADV002Q.W} height={ADV002Q.H} fps={ADV002Q.FPS} durationInFrames={ADV002Q.DURACAO} />
    </Folder>
    <Folder name="001-ADv003">
      <Composition id="ADv003" component={ADv003} width={ADV003.W} height={ADV003.H} fps={ADV003.FPS} durationInFrames={ADV003.DURACAO} />
      <Composition id="ADv003Quadrado" component={ADv003Quadrado} width={ADV003Q.W} height={ADV003Q.H} fps={ADV003Q.FPS} durationInFrames={ADV003Q.DURACAO} />
    </Folder>
  </>
);
