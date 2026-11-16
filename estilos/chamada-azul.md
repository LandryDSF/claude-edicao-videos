# Estilo Chamada Azul

Criativo curto de **chamada / anúncio** para Reels, Stories e Meta Ads. Fundo escuro, azul da marca como destaque, ritmo rápido e legenda palavra por palavra.

- **Nasceu em:** 001.ADv002 (aprovado em 2026-11-14), refinado no 001.ADv001 (2026-11-15).
- **Código-modelo:**
  - [src/videos/adv002/](../src/videos/adv002/);
  - [src/videos/adv001/](../src/videos/adv001/), mais recente, com a cena "mini" e o SSMS sobre lista;
  - primitivas de layout em `src/_shared/split-vertical.tsx`.
- **Entregas:** vertical 9:16, mais quadrado 1:1 para campanha no Meta Ads.

## Identidade visual

| Item | Valor |
|---|---|
| Fundo | `#0A0A0A` (preto) |
| Destaque | `#2EA3F2` (azul): palavra falada na legenda, pílulas, contornos |
| CTA | `#F5B800` (amarelo), **só** na chamada para ação |
| Fonte | Montserrat (pesada nos títulos, caixa alta) |
| Peças | `Pilula`, `Titulo`, `Aparece`, `Selo`, `Contorno`, `MarcaTexto`, `Enquadrado`, `Legenda` |

## Ritmo e estrutura

- **Os cortes da gravação viram trocas de cenário:**
  - câmera cheia, tela dividida (painel em cima e câmera em card embaixo), câmera mini no canto e tela cheia;
  - corte que cai dentro da câmera cheia vira **punch-in seco**, um zoom rápido.
- Algo novo na tela a cada **1,5 a 3 s**. Nenhum trecho parado por mais de ~3 s.
- **Mapa típico:**
  1. Abertura com o cartão de identificação (MCT);
  2. Gancho;
  3. Conteúdo em blocos;
  4. Datas e oferta;
  5. CTA amarelo;
  6. Fecho com os selos do assunto (DP-300/DP-800).
- As cenas são declaradas numa tabela `CENAS` (cheio / split / mini), com tempos tirados do `palavras.json`.

## Legenda

- Dinâmica, palavra por palavra, com a palavra falada em azul.
- Some no meio das transições: nunca atravessa o rosto.
- **Some enquanto o SSMS (código) está na tela** (lista `SEM_LEGENDA`).

## Prints e telas

- **Prints de site:** só a parte que importa, por pouco tempo. Nada de pan que termina num trecho sem sentido.
- **Gravação do SSMS:**
  - corte **sempre na mesma posição**, rente à aba da query, com as linhas de código inteiras;
  - enquadramento fixo, sem zoom variável;
  - `Contorno` azul no trecho citado;
  - clipes de tela sempre `muted`.
- **Nada apontando para o vazio:** seta só se aponta para algo visível.

## Selos e marca

- **Cartão/selo MCT só na abertura**, como identificação. Nunca no fecho nem no CTA: pode parecer que o evento ensina a ser MCT.
- No fecho, use os selos do assunto do vídeo (ex.: DP-300 e DP-800).

## Versão quadrada (1:1)

- Tela dividida **lado a lado**: painel à esquerda (640×860) e câmera à direita (360×1020).
- Sem câmera mini, porque cobriria o conteúdo. O que era mini vai para o painel.
- Câmera cheia é uma janela do master, centrada no rosto.
- Selos nas laterais da cabeça. Títulos na faixa de cima e na de baixo. Legenda embaixo.

## Selos DP-300 / DP-800 (padrão aprovado no 001.ADv004)

Aprovado em 2026-11-15 ("ficou ótima"). Código de referência: componente `Selo` e cenas `Certificacoes`/`Fecho` em [src/videos/adv004/ADv004.tsx](../src/videos/adv004/ADv004.tsx).

- **Sem cartão branco:** o PNG transparente vai direto sobre a cena, com sombra `drop-shadow(0 12px 22px rgba(0,0,0,.55))`.
- **Mesmo tamanho de verdade:** os arquivos têm margens transparentes diferentes. Recorte cada selo pela área visível medida no canal alfa (`Dp-300.png` x 18–510, y 9–516; `DP-800.png` x 8–508, y 17–507, em 525×525) e mostre os dois com a **mesma altura visível**.
- **Entram juntos** (mesmo `t0`) ou, se em sequência, só com tempo para a mola assentar antes do fim da cena: um selo ainda animando parece menor.
- **Brilho azul pulsando no fundo:** `drop-shadow(0 0 28·b px rgba(46,163,242,.9·b))`, com `b = 0,5 + 0,5·sen((t − t0)·π·1,4)`.
- **Vertical:** no peito, y 1100, altura 270, centros em x 540 ± 150. Mesma geometria na cena das certificações e no fecho.

## Logos de texto preto

- Logos com texto preto e fundo transparente (ex.: SQL Server 2025) **não** vão em cartão branco: o usuário reprovou. Use título em texto na montagem.
