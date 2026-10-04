# VIP JULIA SILVA

Biblioteca premium de vídeos com catálogo automático por pasta, busca, filtros VIP 1/2/3 e player integrado.

## Rodar localmente

```bash
npm start
```

Depois abra `http://localhost:3000`.

## Adicionar vídeos

Copie seus arquivos para `public/videos`. O servidor reconhece `.mp4`, `.webm`, `.mov`, `.m4v` e `.ogg` e atualiza o catálogo automaticamente ao recarregar a página.

Para usar o menu de três pontos, organize por coleção:

```text
public/videos/vip1/meu-video.mp4
public/videos/vip2/outro-video.webm
public/videos/vip3/mais-um-video.mov
```

Os títulos são gerados a partir do nome do arquivo. Não é preciso editar o HTML.

## GitHub

O repositório inclui o código e a pasta de vídeos. Vídeos grandes podem ultrapassar o limite de 100 MB do GitHub; nesse caso, use Git LFS ou armazenamento de mídia e mantenha apenas a estrutura de pastas neste repositório.

```bash
git add .
git commit -m "feat: criar biblioteca VIP Julia Silva"
git push
```

## Estrutura

- `server.mjs`: servidor HTTP e descoberta recursiva dos vídeos.
- `public/index.html`: interface da biblioteca e modal do player.
- `public/styles.css`: identidade visual responsiva.
- `public/app.js`: busca, filtros, menu VIP e reprodução.
- `public/videos/`: pasta para os vídeos.
