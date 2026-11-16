import fs from 'node:fs';
import path from 'node:path';
import {Config} from '@remotion/cli/config';

// Temporários do Remotion (cópia da pasta projetos/ a cada render, ~400 MB cada) ficam em tmp/remotion
// dentro do projeto, e não no TEMP do sistema (no Windows, o disco C:). REMOTION_TEMP muda o local.
const TEMP = process.env.REMOTION_TEMP ?? path.join(process.cwd(), 'tmp', 'remotion');
fs.mkdirSync(TEMP, {recursive: true});
process.env.TMP = TEMP;
process.env.TEMP = TEMP;
process.env.TMPDIR = TEMP;
// O Remotion não apaga essas cópias: limpa as que têm mais de 12 h (um render em andamento é sempre mais novo).
const DOZE_HORAS = 12 * 60 * 60 * 1000;
for (const nome of fs.readdirSync(TEMP)) {
  if (!nome.startsWith('remotion-')) continue;
  const alvo = path.join(TEMP, nome);
  try {
    if (Date.now() - fs.statSync(alvo).mtimeMs > DOZE_HORAS) fs.rmSync(alvo, {recursive: true, force: true});
  } catch {
    // em uso ou sem permissão: fica para a próxima
  }
}

Config.setCodec('h264');
Config.setVideoImageFormat('jpeg');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// Tudo que está em projetos/ pode ser usado com staticFile('<NNN. slug>/...').
Config.setPublicDir('projetos');
// O cache persistente do webpack falha com EPERM em algumas instalações do Windows.
Config.setCachingEnabled(false);
