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
import {ADv004} from './videos/adv004/ADv004';
import * as ADV004 from './videos/adv004/ADv004';
import {ADv004Quadrado} from './videos/adv004/ADv004Quadrado';
import * as ADV004Q from './videos/adv004/ADv004Quadrado';
import {ADv005} from './videos/adv005/ADv005';
import * as ADV005 from './videos/adv005/ADv005';
import {ADv005Quadrado} from './videos/adv005/ADv005Quadrado';
import * as ADV005Q from './videos/adv005/ADv005Quadrado';
import {Live147} from './videos/live147/Live147';
import {ENv001, ENv001Quadrado} from './videos/env001/ENv001';
import * as ENV001 from './videos/env001/ENv001';
import {ENv005, ENv005Quadrado} from './videos/env005/ENv005';
import * as ENV005 from './videos/env005/ENv005';
import {ENv006, ENv006Quadrado} from './videos/env006/ENv006';
import * as ENV006 from './videos/env006/ENv006';
import * as LIVE147 from './videos/live147/Live147';

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
    <Folder name="001-ADv004">
      <Composition id="ADv004" component={ADv004} width={ADV004.W} height={ADV004.H} fps={ADV004.FPS} durationInFrames={ADV004.DURACAO} />
      <Composition id="ADv004Quadrado" component={ADv004Quadrado} width={ADV004Q.W} height={ADV004Q.H} fps={ADV004Q.FPS} durationInFrames={ADV004Q.DURACAO} />
    </Folder>
    <Folder name="001-ADv005">
      <Composition id="ADv005" component={ADv005} width={ADV005.W} height={ADV005.H} fps={ADV005.FPS} durationInFrames={ADV005.DURACAO} />
      <Composition id="ADv005Quadrado" component={ADv005Quadrado} width={ADV005Q.W} height={ADV005Q.H} fps={ADV005Q.FPS} durationInFrames={ADV005Q.DURACAO} />
    </Folder>
    <Folder name="002-LIVE147">
      <Composition id="Live147" component={Live147} width={LIVE147.W} height={LIVE147.H} fps={LIVE147.FPS} durationInFrames={LIVE147.DURACAO} />
    </Folder>
    <Folder name="003-ENv005">
      <Composition id="ENv005" component={ENv005} width={ENV005.W} height={ENV005.H} fps={ENV005.FPS} durationInFrames={ENV005.DURACAO} />
      <Composition id="ENv005Quadrado" component={ENv005Quadrado} width={ENV005.WQ} height={ENV005.HQ} fps={ENV005.FPS} durationInFrames={ENV005.DURACAO} />
    </Folder>
    <Folder name="004-ENv006">
      <Composition id="ENv006" component={ENv006} width={ENV006.W} height={ENV006.H} fps={ENV006.FPS} durationInFrames={ENV006.DURACAO} />
      <Composition id="ENv006Quadrado" component={ENv006Quadrado} width={ENV006.WQ} height={ENV006.HQ} fps={ENV006.FPS} durationInFrames={ENV006.DURACAO} />
    </Folder>
    <Folder name="005-ENv001">
      <Composition id="ENv001" component={ENv001} width={ENV001.W} height={ENV001.H} fps={ENV001.FPS} durationInFrames={ENV001.DURACAO} />
      <Composition id="ENv001Quadrado" component={ENv001Quadrado} width={ENV001.WQ} height={ENV001.HQ} fps={ENV001.FPS} durationInFrames={ENV001.DURACAO} />
    </Folder>
  </>
);
