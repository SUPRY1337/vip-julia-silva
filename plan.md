# Plano — VIP JULIA SILVA

## Escopo
Site responsivo de biblioteca premium de vídeos, com catálogo descoberto automaticamente pela pasta `public/videos`, busca, filtros VIP 1/2/3, player integrado e estrutura pronta para versionamento e publicação no GitHub.

## Direção visual aprovada
- **Movimento:** editorial de luxo contemporâneo com atmosfera de galeria noturna.
- **Princípios:** contraste alto, espaço negativo generoso, detalhes luminosos pontuais e navegação direta.
- **Paleta:** ameixa quase preta e grafite para criar profundidade; champagne para sofisticação; coral rosado como assinatura VIP e foco de interação.
- **Layout:** hero assimétrico em duas colunas, seguido por uma faixa de filtros e uma grade fluida de cards; o conteúdo deve parecer uma coleção curada, não um painel genérico.
- **Elementos assinatura:** wordmark com monograma “J”, brilho radial champagne/coral, bordas finas translúcidas e menu de três pontos para as coleções VIP.
- **Interação:** filtros e busca atualizam a coleção sem navegação de página; cards abrem o player em modal; estados vazios explicam exatamente como adicionar arquivos.
- **Animação:** entrada suave do hero, hover com elevação mínima e brilho, transições curtas de 180–240ms; sem movimento excessivo durante a reprodução.
- **Tipografia:** Cormorant Garamond para a marca e títulos editoriais; Manrope para interface, metadados e controles.
- **Essência da marca:** “Uma biblioteca visual íntima e premium para guardar cada momento da Julia em um só lugar.” Personalidade: elegante, próxima, magnética.
- **Voz:** frases curtas, convidativas e confiantes. Exemplos: “A coleção começa aqui.” / “Escolha um capítulo e dê play.”
- **Wordmark/logo:** monograma “J” dentro de um círculo incompleto, acompanhado do nome em caixa alta e tracking amplo.
- **Cor proprietária:** coral rosado `#f27d8a`, usado apenas para ações, sinalização VIP e pontos de destaque.

## Implementação
- `server.mjs`: servidor Node sem dependências, serve `public/` e expõe `GET /api/videos` lendo recursivamente `public/videos`.
- `public/index.html`: shell semântico, hero, menu de três pontos, busca, filtros e modal de player.
- `public/styles.css`: sistema visual responsivo e componentes da biblioteca.
- `public/app.js`: consumo do catálogo, busca, filtros, renderização, modal e estados de carregamento/vazio/erro.
- `public/videos/`: pasta de mídia do usuário; subpastas `vip1`, `vip2` e `vip3` são reconhecidas como categorias.
- `public/manus-routes.json`: manifesto de rota exigido pelo Webdev.
- `README.md`: instruções de execução, inclusão de vídeos e publicação.

## Operação
1. Copiar arquivos `.mp4`, `.webm`, `.mov`, `.m4v` ou `.ogg` para `public/videos`.
2. Opcionalmente organizar em `public/videos/vip1`, `vip2` e `vip3`.
3. Rodar `npm start` e abrir a porta 3000; o catálogo é atualizado ao recarregar a página.
4. Versionar o projeto e enviar para o GitHub.
