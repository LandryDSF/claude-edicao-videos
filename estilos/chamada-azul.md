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
