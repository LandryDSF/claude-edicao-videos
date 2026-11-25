# Estilo Lima Black

Criativo curto de **chamada / anúncio** para Reels, Stories e Meta Ads, com cara de "lançamento". A câmera fica cheia o tempo todo e é cortada por telas pretas de tipografia gigante. Verde-lima é o único destaque. A legenda é discreta.

- **Nasceu de:** referência externa, anúncio da Biblioteca de Anúncios da Meta analisado em 2026-11-25 ([análise](../referencias/oneway-1151099207857686/analise.md)). Foi extraído só o padrão; nenhum elemento do anunciante entra.
- **Status:** ficha criada em 2026-11-25. Primeiro vídeo: **004.ENv006** (stills aprovados em 2026-11-25, "ficou tudo ótimo").
- **Código-modelo:** peças em [src/estilos/lima-black.tsx](../src/estilos/lima-black.tsx); uso completo, vertical e quadrado no mesmo arquivo, em [src/videos/env006/ENv006.tsx](../src/videos/env006/ENv006.tsx).
- **Entregas:** vertical 9:16; quadrado 1:1 para campanha.
- **Bom para:** abertura de turma, Black Friday, live com data marcada, oferta com lista de benefícios.

## Identidade visual

| Item | Valor |
|---|---|
| Fundo das telas de texto | `#050505` (preto), com brilho radial lima bem suave atrás do texto (`rgba(207,253,58,.12)`) |
| Destaque | `#CFFD3A` (verde-lima): palavra-chave, chips, checkbox, seta, tela cheia de data |
| Texto sobre lima | `#0A0A0A` |
| Texto comum | `#FFFFFF`; secundário em `rgba(255,255,255,.55)` |
| Chamada / CTA secundário | Pílula verde escura `#4C8C00` com texto branco e contorno lima, uso único por vídeo. **Nada de vermelho:** destoou no 004.ENv006. Branco direto sobre o lima puro não se lê |
| Fonte | **Poppins** 800/900 em caixa alta nos títulos; Poppins 600 minúscula na legenda |
| Peças | `ChipInclinado`, `TelaTipografica`, `NumeroGrande`, `Checklist`, `SeloTitulo`, `TelaData`, `SetaDesenhada`, `CTAComentario`, `LegendaKaraoke` |

O lima nunca é usado com o azul do **Chamada Azul** no mesmo vídeo.

## Ritmo e estrutura

- Um plano a cada **~2,5 s**; algo novo na tela a cada 1–2 s.
- **Câmera cheia é a base.** Não há tela dividida nem câmera em card.
- **Troca de bloco = troca de enquadramento:** como o master é intocável, cada bloco ganha um enquadramento (aberto, punch-in de 1,15–1,3× centrado no rosto, de volta). Os cortes que já existem na gravação também viram troca de enquadramento.
- **Telas pretas de tipografia** cobrem a câmera por **1,2–2 s**, no máximo 3 por vídeo de 30 s. O áudio segue normalmente.
- **Mapa típico:**
  1. **Gancho-objeção** em câmera cheia ("muita gente vai te vender X...");
  2. **Tela preta** com a palavra da objeção ("CURSO **VITALÍCIO?**");
  3. **Autoridade** com chips inclinados (anos de experiência, certificações);
  4. **Número grande** em tela preta (horas, alunos, módulos);
  5. **Oferta em checklist** sobre a câmera;
  6. **Prova** com selo + título (certificação, prêmio);
  7. **Data** em tela cheia lima;
  8. **CTA por comentário** sobre a câmera escurecida.

## Peças

### Chip inclinado
- Retângulo lima, texto preto Poppins 900 caixa alta, girado **-4°**, cantos de 6 px, sombra `0 10px 24px rgba(0,0,0,.45)`.
- Complemento opcional num **chip preto menor** encaixado embaixo à direita, texto branco 700 ("DE TECNOLOGIA", "FORMAÇÃO").
- Fica no **terço de cima, acima da cabeça** (vertical: y 220–330). Nunca sobre o rosto: posição a partir da zona do rosto medida.
- Entrada: escala 0,6 → 1 com mola curta, junto com a palavra falada; o complemento entra 6 quadros depois. Troca de chip = o anterior sai em 4 quadros.

### Tela tipográfica (preta)
- Cobre a câmera inteira. Texto centralizado, Poppins 900, 130–170 px (vertical).
- Monta **palavra por palavra no tempo da fala**: "CURSO" → "CURSO **VITALÍCIO?**", e a palavra-chave em lima.
- A legenda continua embaixo, menor.

### Número grande
- Variação da tela tipográfica: o número sozinho em lima (220–260 px), depois a unidade em branco com espaçamento largo (`letter-spacing: .25em`) e depois o complemento menor.
- O número pode contar até o valor falado em 0,4 s.

### Checklist
- Sobre a câmera, à esquerda e na altura do peito (abaixo do queixo), Poppins 900 caixa alta branca com sombra.
- Cada item entra quando é dito: **caixa lima vazia** → 4 quadros depois o **check** se desenha.
- Máximo de 4 itens.

### Selo + título
- Selo/brasão real (PNG transparente) à esquerda, rótulo pequeno em cinza acima e o título no chip lima à direita. Fica no topo.
- Use os seus selos (DP-300, DP-800, MCT), com o mesmo recorte pela área visível do Chamada Azul.
- **MCT só na abertura**, nunca no CTA.

### Tela de data (lima)
- Tela cheia lima com texto preto: rótulo pequeno ("ABERTURA DA TURMA"), dia gigante (300+ px), mês em caixa alta e linha final "20H · AO VIVO".
- O mês entra com o espaçamento fechando (`letter-spacing` de .6em para .02em).
- Dura 1,5–2 s. Pode vir logo depois de uma tela preta curta com o nome do evento ("BLACK FRIDAY" em chip).

### CTA por comentário
- Últimos 2–3 s: câmera escurecida a ~35% de brilho, "COMENTE" em branco e a **palavra-código gigante em lima**, com a data embaixo.
- **Seta desenhada** em lima (traço de 8 px, ponta arredondada) se desenha em direção ao canto inferior direito, onde ficam os comentários no Reels.
- No quadrado, o fecho vira uma linha só ("COMENTE **JÁ USOU?**") na faixa de baixo, e a legenda some enquanto a pílula está na tela.
- O texto do CTA **nunca cobre o rosto**: na vertical, fica acima da cabeça.
- Antes do CTA final, pode aparecer a **pílula verde** (`PilulaAlerta`) com a chamada falada ("RESPONDE NOS COMENTÁRIOS") sobre a câmera por 1–2 s.
- A palavra-código é sua (ex.: "SQL", "DP300"); nunca a do anúncio de referência.

## Legenda

- Poppins 600, **minúscula**, branca, 44–52 px (vertical), a **~64% da altura** (sobre o peito).
- Janela de 2–3 palavras: as que ainda não foram ditas aparecem em `rgba(255,255,255,.35)` e acendem em branco quando faladas. Sem cor de destaque: o lima fica para os chips.
- Some quando um chip ou checklist ocupa a mesma faixa, e **some enquanto o SSMS (código) está na tela**.

## Prints e telas

- Valem as regras do **Chamada Azul**: o SSMS é cortado na mesma posição, rente à aba, sem zoom variável, com clipes `muted`; prints de site ficam por pouco tempo, mostrando só a parte que importa.
- O contorno do trecho citado é **lima** (não azul).
- Nada de seta para o vazio: a única seta do estilo é a do CTA, que aponta para os comentários.

## Versão quadrada (1:1)

- A câmera cheia é uma janela do master centrada no rosto.
- Chips na faixa de cima; checklist à esquerda do rosto, se couber, ou embaixo; legenda embaixo.
- Telas pretas e tela de data com o texto reduzido a ~80%.
- A seta do CTA aponta para baixo à direita.

## Dicas de gravação (para o estilo render bem)

- Gancho com **objeto na mão** (certificações, crachá de evento, livro).
- Duas ou três posições na mesma gravação (em pé, sentado, mais perto) dão a troca de "locação" sem cortar nada na edição.
- Diga a palavra-código do CTA com clareza no final.
