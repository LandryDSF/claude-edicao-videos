# Modelo de edição a partir de um vídeo de referência

Os níveis 1 e 2 dizem **com que ferramenta** editamos. O **modelo de edição** diz **com que cara**: ritmo, layout, tipografia, cores, legenda, gancho, CTA. Este guia transforma um vídeo de que você gostou (um anúncio da Meta, um Reels, um vídeo do YouTube) num modelo reutilizável, para os seus vídeos não ficarem todos iguais.

Um modelo pronto é uma **ficha** em `estilos/<nome>.md` (igual à do **Chamada Azul**) e, quando valer a pena, peças de código em `src/estilos/`. Ele vale nos dois níveis.

## 1. Trazer o vídeo de referência

Crie a pasta `referencias/<slug>/` (ex.: `referencias/oneway-mvp/`). Os vídeos ficam fora do Git.

| Caminho | Como |
|---|---|
| **Link** (mais fácil) | Cole o link na conversa. O Claude baixa com `yt-dlp` (YouTube, Instagram, TikTok, Facebook e a Biblioteca de Anúncios da Meta no formato `facebook.com/ads/library/?id=NNNN`). |
| **Arquivo** | Salve o MP4 em `referencias/<slug>/video/`. |
| **Gravação de tela** | Se nada baixar: grave a tela com a Ferramenta de Captura (`Win + Shift + R`) ou a Xbox Game Bar (`Win + Alt + R`) e salve em `referencias/<slug>/video/`. Serve para análise; a qualidade não importa. |

Na Biblioteca de Anúncios, o link certo é o do anúncio individual: clique em **Ver detalhes do anúncio** e copie a URL com `?id=`. A URL da busca (`?q=...`) não serve.

## 2. Assistir e decompor

O Claude assiste com a skill `watch` (quadros + transcrição) e preenche `referencias/<slug>/analise.md` com:

- **Estrutura:** duração, gancho dos 3 primeiros segundos, blocos, oferta, CTA, fecho;
- **Ritmo:** cortes por segundo, de quanto em quanto tempo algo novo entra na tela;
- **Câmera:** cheia, card, tela dividida, punch-in, posição do rosto;
- **Texto:** fonte (ou a mais parecida no Google Fonts), tamanho, caixa alta, onde fica, como entra;
- **Legenda:** palavra por palavra, por frase, cor de destaque, posição;
- **Cores:** fundo, destaque, CTA, em hex;
- **Recursos:** prints, selos, emojis, setas, B-roll, sons, transições;
- **O que não copiar:** marca, logo, rosto, fotos e textos do anunciante.

## 3. Virar modelo

1. O Claude escreve a ficha `estilos/<nome>.md` no mesmo formato do **Chamada Azul** (identidade, ritmo, legenda, prints, versões de formato) e mostra para você aprovar.
2. Se o modelo tiver uma peça nova (um tipo de título, um card, uma transição), ela vira componente em `src/estilos/<nome>.tsx`, com um exemplo que roda no `npm run studio` sem vídeo.
3. A ficha entra na tabela **Seus estilos** de [estilos/README.md](../estilos/README.md), com um quadro em `estilos/imagens/`.

## 4. Usar num vídeo novo

```text
Edita o 004 no modelo "MVP Dourado", vertical, intensidade equilibrada.
```

O modelo é ponto de partida: o plano (`plano.md`) diz o que segue a ficha e o que muda neste vídeo. Ajustes aprovados voltam para a ficha.

## Regras

- **Extraia o padrão, não o anúncio.** Nada de logo, marca, rosto, fotos, música ou frases do vídeo de referência na sua edição; recrie o visual com os seus elementos.
- A referência fica só em `referencias/`, nunca em `edicoes/`.
- As regras de sempre continuam: master intocável, tempo por palavra, rosto livre.
