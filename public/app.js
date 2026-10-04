const state = { videos: [], category: 'Todos', query: '' };
const grid = document.querySelector('#videoGrid');
const statusMessage = document.querySelector('#statusMessage');
const emptyState = document.querySelector('#emptyState');
const count = document.querySelector('#videoCount');
const searchInput = document.querySelector('#searchInput');
const playerModal = document.querySelector('#playerModal');
const videoPlayer = document.querySelector('#videoPlayer');
const imagePlayer = document.querySelector('#imagePlayer');
const videoFallback = document.querySelector('#videoFallback');
const playerTitle = document.querySelector('#playerTitle');
const playerCategory = document.querySelector('#playerCategory');
const playerFilename = document.querySelector('#playerFilename');
const moreButton = document.querySelector('#moreButton');
const vipMenu = document.querySelector('#vipMenu');

function formatDate(iso) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso)).replace('.', '');
}

function formatBytes(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function filteredVideos() {
  return state.videos.filter((video) => {
    const matchesCategory = state.category === 'Todos' || video.category === state.category;
    const query = state.query.toLowerCase();
    return matchesCategory && (!query || `${video.title} ${video.filename} ${video.category}`.toLowerCase().includes(query));
  });
}

function renderCard(video, index) {
  const card = document.createElement('article');
  card.className = 'video-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Reproduzir ${video.title}`);
  const preview = video.kind === 'image' ? `<img class="card-preview" src="${video.src}" alt="${video.title}" loading="lazy" />` : '';
  card.innerHTML = `<div class="card-art">${preview}<span class="card-index">${String(index + 1).padStart(2, '0')}</span><span class="card-category">${video.category}</span><span class="play-button">${video.kind === 'image' ? '↗' : '▶'}</span></div><div class="card-details"><h3>${video.title}</h3><p>${video.kind === 'image' ? 'imagem' : 'vídeo'} · ${formatDate(video.updatedAt)}${video.size ? ` · ${formatBytes(video.size)}` : ''}</p></div>`;
  const open = () => openPlayer(video);
  card.addEventListener('click', open);
  card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  return card;
}

function render() {
  const videos = filteredVideos();
  count.textContent = state.videos.length;
  grid.replaceChildren(...videos.map(renderCard));
  emptyState.hidden = videos.length > 0 || state.videos.length > 0 && state.query === '' && state.category === 'Todos';
  if (state.videos.length === 0) {
    emptyState.hidden = false;
    emptyState.querySelector('h3').innerHTML = 'Sua coleção<br /><em>está esperando.</em>';
    emptyState.querySelector('p:not(.eyebrow)').innerHTML = 'Coloque vídeos ou imagens dentro de <code>public/videos</code> e recarregue a página.';
  } else if (videos.length === 0) {
    emptyState.hidden = false;
    emptyState.querySelector('h3').innerHTML = 'Nada por aqui<br /><em>ainda.</em>';
    emptyState.querySelector('p:not(.eyebrow)').textContent = 'Tente outro termo de busca ou escolha uma coleção diferente.';
  } else {
    emptyState.hidden = true;
  }
}

function setCategory(category) {
  state.category = category;
  document.querySelectorAll('.pill').forEach((button) => button.classList.toggle('active', button.dataset.category === category));
  render();
}

function openPlayer(video) {
  playerTitle.textContent = video.title;
  playerCategory.textContent = video.category;
  playerFilename.textContent = video.filename;
  videoFallback.hidden = true;
  videoPlayer.hidden = video.kind === 'image';
  imagePlayer.hidden = video.kind !== 'image';
  if (video.kind === 'image') {
    imagePlayer.src = video.src;
    imagePlayer.alt = video.title;
  } else {
    videoPlayer.src = video.src;
    videoPlayer.load();
    videoPlayer.play().catch(() => {});
  }
  playerModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closePlayer() {
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  imagePlayer.removeAttribute('src');
  imagePlayer.hidden = true;
  playerModal.hidden = true;
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
  setCategory(button.dataset.category);
  if (button.closest('.vip-menu')) { vipMenu.hidden = true; moreButton.setAttribute('aria-expanded', 'false'); }
}));
searchInput.addEventListener('input', (event) => { state.query = event.target.value.trim(); render(); });
document.querySelectorAll('[data-close-player]').forEach((element) => element.addEventListener('click', closePlayer));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !playerModal.hidden) closePlayer(); });
moreButton.addEventListener('click', () => { vipMenu.hidden = !vipMenu.hidden; moreButton.setAttribute('aria-expanded', String(!vipMenu.hidden)); });
document.addEventListener('click', (event) => { if (!event.target.closest('.header-actions')) { vipMenu.hidden = true; moreButton.setAttribute('aria-expanded', 'false'); } });

async function loadVideos() {
  try {
    const localCatalog = new URL('api/videos', document.baseURI);
    const staticCatalog = new URL('videos/catalog.json', document.baseURI);
    let response = await fetch(localCatalog, { headers: { Accept: 'application/json' } });
    if (!response.ok) response = await fetch(staticCatalog, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('catalog');
    const payload = await response.json();
    state.videos = Array.isArray(payload.videos) ? payload.videos : [];
    state.videos = state.videos.map((video) => ({ ...video, src: new URL(video.src, document.baseURI).href }));
    statusMessage.textContent = state.videos.length ? '' : '';
    render();
  } catch {
    statusMessage.textContent = 'Não foi possível carregar a coleção. Verifique o servidor e tente novamente.';
    emptyState.hidden = false;
    grid.replaceChildren();
  }
}

loadVideos();
