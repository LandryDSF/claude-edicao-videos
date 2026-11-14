# Primeiros passos

Este tutorial leva você do zero até a primeira edição. Leva uns 20 minutos, a maior parte esperando instalações.

---

## 1. O que você precisa

| Item | Para quê | Obrigatório? |
|---|---|---|
| **Claude** com acesso ao Claude Code (plano Pro ou Max) | é o seu diretor de vídeo | sim |
| **Node.js** (versão LTS) | roda o Remotion | sim |
| **Python** 3.10 ou mais novo | transcrição e skill `watch` | sim |
| **FFmpeg** | lê e converte vídeo | sim |
| **Git** | baixar e atualizar este repositório | recomendado |
| Conta **Higgsfield** com créditos | só para o Nível 2 | não |

Você pode usar o Claude de três jeitos. Todos funcionam com este repositório:

- **Claude Desktop, aba Code** (mais simples, sem terminal);
- **Claude Code no VS Code** (extensão);
- **Claude Code no terminal** (comando `claude`).

> A skill `watch` **não funciona no Cowork nem no chat comum** do Claude. Use sempre uma sessão **Code**.

## 2. Instalar os programas

### Windows

Instale tudo **antes** de pedir qualquer coisa ao Claude. O roteiro abaixo instala para **todos os usuários** e numa pasta do `D:` (útil quando o `C:` tem pouco espaço); se preferir o `C:`, é só manter as pastas padrão dos instaladores.

1. **Git**: baixe em [git-scm.com/download/win](https://git-scm.com/download/win). Escolha a pasta (ex.: `D:\Programas\Git`). Nas telas seguintes, o padrão serve; só troque o editor de Vim para **Notepad** (ou VS Code, se tiver) e deixe o PATH em *"Git from the command line and also from 3rd-party software"*.
2. **Node.js LTS**: baixe o `.msi` em [nodejs.org](https://nodejs.org). Escolha a pasta (ex.: `D:\Programas\nodejs`) e **desmarque "Automatically install the necessary tools"**: essa opção instala Chocolatey, outro Python e o Visual Studio Build Tools (~6 GB no `C:`), que o projeto não usa.
3. **Python**: as versões antigas (3.12, 3.13) só recebem correções de segurança e já não têm instalador para Windows; use a 3.14. No **PowerShell como Administrador** (troque `3.14.10` pela versão mais recente da 3.14 em [python.org/ftp/python](https://www.python.org/ftp/python/)):

   ```powershell
   Invoke-WebRequest -UseBasicParsing "https://www.python.org/ftp/python/3.14.10/python-3.14.10-amd64.exe" -OutFile "$env:USERPROFILE\Downloads\python-instalador.exe"
   Start-Process "$env:USERPROFILE\Downloads\python-instalador.exe" -ArgumentList '/passive','InstallAllUsers=1','TargetDir=D:\Programas\Python314','PrependPath=1','Include_test=0','Include_launcher=1' -Wait
   ```

4. **FFmpeg**, no **PowerShell como Administrador**:

   ```powershell
   Invoke-WebRequest -UseBasicParsing "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" -OutFile "$env:USERPROFILE\Downloads\ffmpeg.zip"
   Expand-Archive "$env:USERPROFILE\Downloads\ffmpeg.zip" -DestinationPath "D:\Programas" -Force; Get-ChildItem "D:\Programas\ffmpeg-*-essentials_build" | Rename-Item -NewName "ffmpeg"
   [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','Machine') + ';D:\Programas\ffmpeg\bin', 'Machine')
   ```

5. **Claude Code no terminal** (recomendado: com ele, o `npm run instalar` já instala a skill `watch`). Instalador oficial, só para o seu usuário:

   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```

   Se depois `claude` não for reconhecido, adicione a pasta dele ao PATH do usuário:

   ```powershell
   [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','User') + ';' + "$env:USERPROFILE\.local\bin", 'User')
   ```

> **O `winget` travou?** Ele depende de servidores da Microsoft; quando estão instáveis, o comando fica parado sem mensagem nenhuma. Use os instaladores e downloads diretos acima. E se aparecer *"Acesso ao Registro solicitado não é permitido"*, o PowerShell não foi aberto como Administrador.

Feche e abra o PowerShell de novo e confira (todos devem responder com a versão):

```powershell
git --version; node --version; python --version; ffmpeg -version; claude --version
```

Se `python` abrir a mensagem da Microsoft Store, desligue os atalhos `python.exe` e `python3.exe` em **Configurações → Aplicativos → Configurações avançadas de aplicativos → Aliases de execução de aplicativo**.

Por último, **reinicie o Claude Desktop**: ele só enxerga programas novos depois de reaberto.

### macOS

Instale o [Homebrew](https://brew.sh) e rode:

```bash
brew install node python ffmpeg yt-dlp git
```

## 3. Baixar o Studio e instalar tudo

### Jeito fácil: peça ao Claude

Abra uma sessão **Code** no Claude, escolha a pasta onde quer o estúdio (fora do OneDrive, iCloud ou Dropbox: a sincronização atrapalha o render) e cole:

```text
Clone https://github.com/LandryDSF/claude-edicao-videos nesta pasta. Antes, leia o README, que tem as instruções para montar a pasta.
```

Ele clona, instala as dependências e as duas skills gratuitas (**remotion-best-practices** e **watch**). Quando terminar, **abra uma sessão nova** do Claude dentro da pasta `claude-edicao-videos`: skills novas só aparecem numa sessão nova.

### Jeito manual

Escolha uma pasta **fora** do OneDrive, iCloud ou Dropbox. Por exemplo, `D:\Claude\Videos` no Windows ou `~/dev` no Mac.

```bash
cd D:\Claude\Videos
git clone https://github.com/LandryDSF/claude-edicao-videos.git
cd claude-edicao-videos
npm run instalar
```

O `npm run instalar` faz tudo de uma vez: dependências do Remotion, transcrição local (`faster-whisper`), skill `remotion-best-practices` (dentro do projeto) e skill `watch`. No fim ele mostra um resumo do que deu certo e do que falhou.

Sem Git? Baixe o ZIP pelo botão verde **Code → Download ZIP** no GitHub, descompacte e rode `npm run instalar` dentro da pasta.

Teste o Remotion:

```bash
npm run studio
```

Abre uma página no navegador com os exemplos da galeria. Se você vê as composições em `Estilos` e consegue dar play, está tudo certo. Feche com `Ctrl+C` no terminal.

## 4. Sobre as skills gratuitas

Skills são pacotes de conhecimento que o Claude carrega quando precisa. O `npm run instalar` já instala as duas:

- **`watch`**: assiste vídeos, extrai quadros e transcreve ([bradautomates/claude-video](https://github.com/bradautomates/claude-video));
- **`remotion-best-practices`**: boas práticas do Remotion ([remotion-dev/skills](https://github.com/remotion-dev/skills)).

Usa só o Claude Desktop, sem o comando `claude` no terminal? A `watch` está declarada no projeto (`.claude/settings.json`), então o Claude oferece instalá-la ao abrir a pasta: aceite. Se não aparecer, instale à mão em **Personalizar → Plugins → Adicionar → Adicionar marketplace → Adicionar de um repositório**, cole `https://github.com/bradautomates/claude-video`, clique em **Sincronizar** e instale **Watch**.

## 5. (Opcional) Chave gratuita da Groq

A `watch` pode usar a Groq para transcrever rápido. É grátis dentro de um limite generoso.

1. Crie a chave em [console.groq.com/keys](https://console.groq.com/keys).
2. Salve como variável de ambiente:
   - Windows: `[Environment]::SetEnvironmentVariable("GROQ_API_KEY", "sua-chave", "User")`
   - Mac: adicione `export GROQ_API_KEY="sua-chave"` ao `~/.zshrc`.
3. Reabra o Claude.

Sem essa chave tudo funciona igual: o `tools/transcrever.py` transcreve localmente, de graça.

## 6. (Só para o Nível 2) Conectar a Higgsfield

Siga a seção [Conectar a Higgsfield ao Claude](4-nivel-2-higgsfield.md#1-conectar-a-higgsfield-ao-claude). Resumo: no Claude Desktop, **Configurações → Conectores → Adicionar conector personalizado**, URL `https://mcp.higgsfield.ai/mcp`, e login na sua conta.

---

## 7. Entendendo as pastas

```text
claude-edicao-videos/
├─ CLAUDE.md           o "diretor": instruções que o Claude lê ao abrir o projeto
├─ README.md           visão geral
├─ guias/              os manuais (você está aqui)
├─ estilos/            galeria de estilos de referência, com imagens
│
├─ projetos/           ← VOCÊ COLOCA AQUI o vídeo e os prints
│  └─ 001. meu-video/
│     ├─ video/        o vídeo gravado, já cortado (nunca é alterado)
│     ├─ prints/       prints e imagens do que você quer ver animado
│     ├─ frames/       (gerado) quadros que o Claude "assistiu"
│     ├─ transcricao/  (gerado) texto com o tempo de cada palavra
│     ├─ hf/           (Nível 2) imagens e vídeos gerados na Higgsfield
│     ├─ plano.md      (gerado) o plano de edição que você aprova
│     └─ edit.jsx      (Nível 2) roteiro de montagem no Higgsedit
│
├─ edicoes/            ← AQUI SAI o vídeo pronto
│  └─ 001. meu-video/
│
├─ src/                código do Remotion (Nível 1)
│  ├─ Root.tsx         lista de vídeos registrados
│  ├─ videos/          uma subpasta por vídeo seu
│  ├─ estilos/         código dos exemplos da galeria
│  └─ _shared/         peças reaproveitadas
├─ tools/              transcrição local e gerador da Higgsfield Cloud API
└─ scripts/            verificações automáticas
```

Regra de bolso: **você só mexe em `projetos/`** (para entregar material) **e em `edicoes/`** (para pegar o resultado). O resto é trabalho do Claude.

A pasta `projetos/` inteira fica fora do Git (`.gitignore`), com exceção do exemplo. Assim, seus vídeos e prints não vão parar no GitHub por acidente se você publicar um fork.

## 8. Sua primeira edição

1. Crie a pasta `projetos/001. meu-video/video/` e coloque seu vídeo lá (MP4 ou MOV, já cortado).
2. Crie `projetos/001. meu-video/prints/` e salve prints de tudo o que você cita no vídeo: sites, notícias, telas de ferramentas.
3. Abra a pasta `claude-edicao-videos` no Claude (Desktop → Code → escolher pasta; ou `claude` no terminal dentro dela).
4. O Claude vai perguntar se você quer o **Nível 1** ou o **Nível 2**. Responda.
5. Diga o que quer. Exemplo:
   ```text
   Edita o projeto 001. Quero o vídeo completo, estilo minimal suíço, sem exagero de zoom.
   ```
6. Aprove (ou ajuste) o plano de edição que ele apresentar.
7. Confira os quadros de revisão que ele mostrar.
8. Pegue o vídeo em `edicoes/001. meu-video/`.

Não sabe o que pedir? Pergunte ao próprio Claude: "o que dá para fazer com esse vídeo?". Ele foi instruído a sugerir opções.

## 9. Glossário rápido

| Termo | Significado |
|---|---|
| **Master** | o seu vídeo gravado e cortado, a base de tudo |
| **Inserção** | qualquer elemento que entra por cima ou no lugar da câmera |
| **Overlay** | inserção com fundo transparente, que fica por cima do vídeo |
| **B-roll** | imagens de apoio em tela cheia enquanto você continua falando |
| **Split / tela dividida** | conteúdo de um lado, câmera do outro |
| **PiP** (picture-in-picture) | câmera pequena num canto |
| **Push-in / punch-in** | zoom lento / zoom rápido na câmera |
| **Gatilho** | a palavra falada que faz uma inserção aparecer |
| **Render** | gerar o arquivo de vídeo final |
| **Still** | um quadro parado exportado como imagem, usado para revisão |
| **MCP** | o "cabo" que conecta o Claude a um serviço externo, como a Higgsfield |
| **Skill** | um pacote de instruções que ensina o Claude a fazer uma tarefa |
