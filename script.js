 (function () {
      const audio = document.getElementById('audio');
      const titleEl = document.getElementById('title');
      const statusEl = document.getElementById('status');
      const tCur = document.getElementById('tCur');
      const tDur = document.getElementById('tDur');
      const seek = document.getElementById('seek');
      const seekVal = document.getElementById('seekVal');
      const vol = document.getElementById('vol');
      const volVal = document.getElementById('volVal');
      const playBtn = document.getElementById('play');
      const prevBtn = document.getElementById('prev');
      const nextBtn = document.getElementById('next');
      const playIcon = document.getElementById('playIcon');
      const fileInput = document.getElementById('file');
      const tracksEl = document.getElementById('tracks');
      const drop = document.getElementById('drop');
      const frame = document.getElementById('frame');

      let playlist = []; // { name, url, file }
      let index = -1;
      let ctx;
      let source;
      let analyser;
      let dataArray;
      let raf;

      const canvas = document.getElementById('viz');
      const c = canvas.getContext('2d');
      let w = 0;
      let h = 0;

      try {
        vol.value = localStorage.getItem('pt:vol') ?? vol.value;
      } catch (err) {
        // Ignore storage errors.
      }

      audio.volume = clamp01(parseFloat(vol.value));
      syncVolumeLabel();

      function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.classList.remove('warn', 'error');
        if (type) statusEl.classList.add(type);
      }

      function clamp01(n) {
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(1, n));
      }

      function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '0:00';
        const total = Math.max(0, seconds | 0);
        const min = (total / 60) | 0;
        const sec = total % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
      }

      function truncateName(name) {
        return name.replace(/\.[^/.]+$/, '');
      }

      function fitCanvas() {
        const ratio = window.devicePixelRatio || 1;
        w = Math.max(1, Math.floor(canvas.clientWidth * ratio));
        h = Math.max(1, Math.floor(canvas.clientHeight * ratio));
        canvas.width = w;
        canvas.height = h;
      }

      fitCanvas();
      window.addEventListener('resize', fitCanvas, { passive: true });

      function initAudioGraph() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
      }

      function drawVisualizer() {
        if (!analyser || !dataArray) return;

        analyser.getByteFrequencyData(dataArray);

        c.clearRect(0, 0, w, h);
        c.fillStyle = '#090f2f';
        c.fillRect(0, 0, w, h);

        c.strokeStyle = '#2c3a80';
        c.lineWidth = 4;
        c.strokeRect(6, 6, w - 12, h - 12);

        c.strokeStyle = 'rgba(105, 194, 255, 0.17)';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(12, h - 28);
        c.lineTo(w - 12, h - 28);
        c.stroke();

        const bars = Math.max(12, Math.floor(w / 15));
        const step = Math.max(1, Math.floor(dataArray.length / bars));

        for (let i = 0; i < bars; i++) {
          const val = dataArray[i * step] / 255;
          const boost = audio.paused ? 0.18 : 1;
          const barH = Math.max(5, val * (h - 44) * boost);
          const x = 12 + i * 13;
          const y = h - 14;

          c.fillStyle = '#45e6b8';
          c.fillRect(x, y - barH, 8, barH * 0.5);

          c.fillStyle = '#69c2ff';
          c.fillRect(x, y - barH * 0.5, 8, barH * 0.34);

          c.fillStyle = '#ff7db4';
          c.fillRect(x, y - barH * 0.16, 8, barH * 0.16);
        }

        raf = requestAnimationFrame(drawVisualizer);
      }

      function startVisualizer() {
        initAudioGraph();
        cancelAnimationFrame(raf);
        drawVisualizer();
      }

      function stopVisualizer() {
        cancelAnimationFrame(raf);
      }

      async function resumeAudioContext() {
        if (!ctx) initAudioGraph();
        if (ctx && ctx.state === 'suspended') {
          try {
            await ctx.resume();
          } catch (err) {
            setStatus('Audio engine is blocked. Tap Play again.', 'warn');
          }
        }
      }

      function syncPlayIcon(isPlaying) {
        playIcon.innerHTML = isPlaying
          ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"></path></svg>'
          : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>';
      }

      function syncSeekLabel() {
        seekVal.textContent = `${Math.round((Number(seek.value) / 1000) * 100)}%`;
      }

      function syncVolumeLabel() {
        volVal.textContent = `${Math.round(clamp01(Number(vol.value)) * 100)}%`;
      }

      function updateTimeUi() {
        tCur.textContent = formatTime(audio.currentTime);
        tDur.textContent = formatTime(audio.duration);

        if (Number.isFinite(audio.duration) && !seek.disabled) {
          const p = Math.floor((audio.currentTime / audio.duration) * 1000);
          seek.value = String(Number.isFinite(p) ? p : 0);
          syncSeekLabel();
        }
      }

      function enableControls(enabled) {
        playBtn.disabled = !enabled;
        prevBtn.disabled = !enabled;
        nextBtn.disabled = !enabled;
        seek.disabled = !enabled;
      }

      function clearEmptyPlaylistHint() {
        const empty = tracksEl.querySelector('.empty');
        if (empty) empty.remove();
      }

      function renderPlaylist() {
        tracksEl.innerHTML = '';

        if (!playlist.length) {
          tracksEl.innerHTML = '<p class="empty">No tracks yet. Drop files to build your playlist.</p>';
          return;
        }

        playlist.forEach((track, i) => {
          const row = document.createElement('div');
          row.className = `track${i === index ? ' active' : ''}`;
          row.setAttribute('role', 'option');
          row.setAttribute('aria-selected', i === index ? 'true' : 'false');
          row.dataset.index = String(i);
          row.innerHTML = `
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h8V3z"></path></svg>
            </span>
            <div>
              <div class="track-name" title="${track.name}">${track.name}</div>
              <div class="track-meta">${track.file.type || 'audio/*'}</div>
            </div>
            <div class="track-state">${i === index ? 'Playing' : ''}</div>
          `;

          row.addEventListener('click', () => {
            loadTrack(i, true);
          });

          tracksEl.appendChild(row);
        });
      }

      function markActiveTrack() {
        const items = tracksEl.querySelectorAll('.track');
        items.forEach((el) => {
          const isActive = Number(el.dataset.index) === index;
          el.classList.toggle('active', isActive);
          el.setAttribute('aria-selected', isActive ? 'true' : 'false');
          const state = el.querySelector('.track-state');
          if (state) state.textContent = isActive ? 'Playing' : '';
          if (isActive) el.scrollIntoView({ block: 'nearest' });
        });
      }

      function addFiles(fileList) {
        if (!fileList || !fileList.length) return;

        const fresh = [];
        for (const file of fileList) {
          if (!file.type || !file.type.startsWith('audio')) continue;
          fresh.push({
            name: truncateName(file.name),
            url: URL.createObjectURL(file),
            file
          });
        }

        if (!fresh.length) {
          setStatus('No valid audio files detected.', 'warn');
          return;
        }

        const hadNoTracks = playlist.length === 0;
        playlist = playlist.concat(fresh);
        clearEmptyPlaylistHint();
        renderPlaylist();
        enableControls(true);

        setStatus(`${fresh.length} track${fresh.length > 1 ? 's' : ''} added.`);

        if (hadNoTracks) {
          loadTrack(0, false);
        }
      }

      async function play() {
        if (!playlist.length || index < 0) return;
        await resumeAudioContext();

        try {
          await audio.play();
          syncPlayIcon(true);
          startVisualizer();
          setStatus('Playing now.');
          markActiveTrack();
        } catch (err) {
          setStatus('Playback was blocked. Tap Play again.', 'warn');
        }
      }

      function pause() {
        audio.pause();
        syncPlayIcon(false);
        stopVisualizer();
        setStatus('Paused.');
      }

      async function loadTrack(i, shouldAutoPlay) {
        if (i < 0 || i >= playlist.length) return;
        index = i;

        const track = playlist[index];
        audio.src = track.url;
        titleEl.textContent = track.name;
        tCur.textContent = '0:00';
        tDur.textContent = '0:00';
        seek.value = '0';
        syncSeekLabel();

        markActiveTrack();
        setStatus(`Loaded: ${track.name}`);

        if (shouldAutoPlay) {
          await play();
        } else {
          syncPlayIcon(false);
          startVisualizer();
        }
      }

      async function next() {
        if (!playlist.length) return;
        await loadTrack((index + 1) % playlist.length, true);
      }

      async function prev() {
        if (!playlist.length) return;
        await loadTrack((index - 1 + playlist.length) % playlist.length, true);
      }

      playBtn.addEventListener('click', () => {
        if (audio.paused) {
          play();
        } else {
          pause();
        }
      });

      nextBtn.addEventListener('click', next);
      prevBtn.addEventListener('click', prev);

      audio.addEventListener('loadedmetadata', () => {
        tDur.textContent = formatTime(audio.duration);
        updateTimeUi();
      });

      audio.addEventListener('timeupdate', updateTimeUi);

      audio.addEventListener('play', () => {
        syncPlayIcon(true);
      });

      audio.addEventListener('pause', () => {
        syncPlayIcon(false);
      });

      audio.addEventListener('ended', next);

      audio.addEventListener('error', () => {
        setStatus('Unable to play this file.', 'error');
      });

      seek.addEventListener('input', () => {
        syncSeekLabel();
        if (!Number.isFinite(audio.duration)) return;
        const progress = Number(seek.value) / 1000;
        audio.currentTime = progress * audio.duration;
        updateTimeUi();
      });

      vol.addEventListener('input', () => {
        const volume = clamp01(Number(vol.value));
        audio.volume = volume;
        vol.value = String(volume.toFixed(2));
        syncVolumeLabel();

        try {
          localStorage.setItem('pt:vol', vol.value);
        } catch (err) {
          // Ignore storage errors.
        }
      });

      fileInput.addEventListener('change', (e) => {
        addFiles(e.target.files);
        fileInput.value = '';
      });

      ['dragenter', 'dragover'].forEach((type) => {
        drop.addEventListener(type, (e) => {
          e.preventDefault();
          e.stopPropagation();
          drop.classList.add('active');
          frame.classList.add('dragging');
        });
      });

      ['dragleave', 'dragend'].forEach((type) => {
        drop.addEventListener(type, (e) => {
          e.preventDefault();
          e.stopPropagation();
          drop.classList.remove('active');
          frame.classList.remove('dragging');
        });
      });

      drop.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        drop.classList.remove('active');
        frame.classList.remove('dragging');
        addFiles(e.dataTransfer && e.dataTransfer.files);
      });

      window.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      window.addEventListener('drop', (e) => {
        e.preventDefault();
      });

      window.addEventListener('keydown', (e) => {
        if (e.target.closest('input, textarea')) return;

        switch (e.key) {
          case ' ':
            e.preventDefault();
            if (playlist.length) {
              if (audio.paused) play();
              else pause();
            }
            break;
          case 'ArrowRight':
            if (Number.isFinite(audio.duration)) {
              audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            }
            break;
          case 'ArrowLeft':
            audio.currentTime = Math.max(0, audio.currentTime - 5);
            break;
          case 'ArrowUp': {
            const vUp = clamp01(Number(vol.value) + 0.05);
            vol.value = String(vUp.toFixed(2));
            vol.dispatchEvent(new Event('input'));
            break;
          }
          case 'ArrowDown': {
            const vDown = clamp01(Number(vol.value) - 0.05);
            vol.value = String(vDown.toFixed(2));
            vol.dispatchEvent(new Event('input'));
            break;
          }
          case 'Escape':
            pause();
            audio.currentTime = 0;
            updateTimeUi();
            setStatus('Stopped.');
            break;
          default:
            break;
        }
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopVisualizer();
          return;
        }
        if (!audio.paused) startVisualizer();
      });

      window.addEventListener('beforeunload', () => {
        for (const track of playlist) {
          if (track.url) URL.revokeObjectURL(track.url);
        }
      });

      enableControls(false);
      syncSeekLabel();
      setStatus('Ready. Add tracks to start playback.');
      startVisualizer();
    })();
    