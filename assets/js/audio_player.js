// combined_audio_player.js
// Creates the audio player UI, injects CSS, and handles playback logic.

(function() {
    'use strict';

    // --- Configuration ---
    const playlist = [
        // Define your playlist here - relative paths from the HTML file
        // Example paths assuming music is in 'assets/music/' relative to HTML
        './assets/music/Pokemon RedBlue - Pokemon tower (slowed reverb).mp3',
        './assets/music/Pokemon BlueRed - Bicycle Theme.mp3',
        './assets/music/Pokemon Techno Remix 2010 (Pokemon Center Theme).mp3',
        // Add more tracks...
    ];
    const DEFAULT_VOLUME = 0.2; // Default volume level (0.0 to 1.0)
    const VOLUME_SLIDER_HIDE_DELAY = 400; // Delay in ms before hiding slider on mouse leave
    const SETTINGS_KEY_AUTOPLAY = 'audioPlayer_autoplayEnabled'; // localStorage key for autoplay
    const SETTINGS_KEY_VOLUME = 'audioPlayer_volume'; // localStorage key for volume
    const SETTINGS_KEY_MUTED = 'audioPlayer_muted'; // localStorage key for mute state

    // --- CSS Styles ---
    const cssStyles = `
        /* audio_player.css - Embedded Styles */
        :root {
            --audio-bg-color: rgba(20, 5, 30, 0.85);
            --audio-border-color: hsla(0, 70%, 50%, 0.6);
            --audio-text-color: #e5e7eb;
            --audio-icon-color: #f3e8ff;
            --audio-button-bg: rgba(138, 43, 226, 0.4);
            --audio-button-hover-bg: rgba(138, 43, 226, 0.7);
            --audio-slider-track-bg: rgba(220, 38, 38, 0.5);
            --audio-slider-thumb-bg: #e5e7eb;
            --audio-slider-thumb-border: rgba(138, 43, 226, 0.5);
            --audio-shadow-color-1: hsla(300, 50%, 8%, 0.7);
            --audio-shadow-color-2: hsla(0, 50%, 8%, 0.5);
            --audio-control-radius: 25px;
            --audio-button-size: 32px;
            --audio-font: 'Asap', sans-serif; /* Ensure Asap is loaded in HTML */
            --audio-transition-speed: 0.2s;
        }

        #audio-prompt {
            position: fixed; bottom: 20px; right: 20px;
            background-color: var(--audio-bg-color); color: var(--audio-text-color);
            padding: 10px 15px; border-radius: 8px; font-size: 0.9rem;
            font-family: var(--audio-font); cursor: pointer; z-index: 1001;
            box-shadow: 0 2px 10px var(--audio-shadow-color-1);
            transition: background-color var(--audio-transition-speed) ease, transform var(--audio-transition-speed) ease;
            border: 1px solid var(--audio-border-color); text-align: center;
        }
        #audio-prompt:hover {
            background-color: var(--audio-button-hover-bg); transform: translateY(-2px);
        }

        #audio-control-container {
            position: fixed; bottom: 15px; right: 15px;
            display: none; /* Initially hidden */
            align-items: center; gap: 8px; z-index: 1000;
            background-color: var(--audio-bg-color); padding: 8px 12px;
            border-radius: var(--audio-control-radius); border: 1px solid var(--audio-border-color);
            box-shadow: 0 3px 12px var(--audio-shadow-color-1), 0 1px 4px var(--audio-shadow-color-2);
            font-family: var(--audio-font);
        }

        #song-name {
            color: var(--audio-text-color); font-size: 13px; margin-right: 8px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7); white-space: nowrap;
            overflow: hidden; text-overflow: ellipsis; max-width: 130px; cursor: default;
        }

        .audio-button {
            background: var(--audio-button-bg); color: var(--audio-icon-color);
            border: none; border-radius: 50%; width: var(--audio-button-size);
            height: var(--audio-button-size); display: flex; align-items: center;
            justify-content: center; cursor: pointer;
            transition: all var(--audio-transition-speed) ease; flex-shrink: 0;
        }
        .audio-button:hover {
            background: var(--audio-button-hover-bg); transform: scale(1.1);
            box-shadow: 0 0 8px hsla(0, 70%, 60%, 0.5);
        }
        .audio-button:active { transform: scale(0.95); }
        .audio-button:disabled {
            opacity: 0.5; cursor: not-allowed; background: #555;
            transform: scale(1); box-shadow: none;
        }
        .audio-button i { line-height: 1; font-size: 0.9rem; display: block; }

        #mute-button { position: relative; }

        #volume-container {
            position: absolute; bottom: calc(100% + 8px); left: 50%;
            transform: translateX(-50%); width: auto;
            background: rgba(30, 10, 40, 0.95); border-radius: 6px;
            padding: 10px 8px; box-sizing: border-box;
            border: 1px solid var(--audio-border-color);
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            display: none; /* Hidden initially */
            opacity: 0; /* Start faded out */
            z-index: 10;
            transition: opacity 0.15s ease-in-out;
        }
        #mute-button:hover #volume-container,
        #volume-container:hover {
            display: block; opacity: 1;
        }

        #volume-slider {
            width: 100px; height: 6px; cursor: pointer;
            appearance: none; -webkit-appearance: none;
            background: var(--audio-slider-track-bg); border-radius: 3px;
            outline: none; display: block;
        }
        #volume-slider::-webkit-slider-thumb {
            appearance: none; -webkit-appearance: none; width: 14px; height: 14px;
            background: var(--audio-slider-thumb-bg); border-radius: 50%;
            cursor: pointer; border: 1px solid var(--audio-slider-thumb-border);
            margin-top: -4px;
        }
        #volume-slider::-moz-range-thumb {
            width: 14px; height: 14px; background: var(--audio-slider-thumb-bg);
            border-radius: 50%; cursor: pointer;
            border: 1px solid var(--audio-slider-thumb-border);
        }

        #settings-button { margin-left: 4px; }
        #settings-button:hover { box-shadow: 0 0 8px hsla(210, 70%, 60%, 0.6); }
    `;

    // --- Elements (Will be assigned after creation) ---
    let audioPrompt, audioControlContainer, playPauseButton, nextSongButton, muteButton, volumeContainer, volumeSlider, songNameDisplay, settingsButton;

    // --- State ---
    let audio = null; // The HTMLAudioElement
    let currentSongIndex = 0;
    let isAudioInitialized = false; // Has the Audio object been created?
    let isMuted = false; // Current mute state
    let volumeBeforeMute = DEFAULT_VOLUME;
    let volumeHideTimeout = null;
    let autoplayEnabled = false; // Default, loaded from settings
    let userHasInteracted = false; // Track first user interaction

    /** Injects the CSS styles into the document's head */
    function injectAudioPlayerCSS() {
        try {
            const styleElement = document.createElement('style');
            styleElement.id = 'audio-player-styles'; // Add ID to prevent duplicates
            styleElement.textContent = cssStyles;
            if (!document.getElementById(styleElement.id)) {
                document.head.appendChild(styleElement);
                console.log("[Audio] CSS Injected.");
            }
        } catch (e) {
            console.error("[Audio] Failed to inject CSS:", e);
        }
    }

    /** Creates the HTML elements for the audio player and appends them to the body */
    function createAudioPlayerUI() {
        // --- Create Prompt ---
        audioPrompt = document.createElement('div');
        audioPrompt.id = 'audio-prompt';
        audioPrompt.style.display = 'block'; // Show initially
        audioPrompt.textContent = 'Click anywhere to enable audio';
        document.body.appendChild(audioPrompt);

        // --- Create Controls Container ---
        audioControlContainer = document.createElement('div');
        audioControlContainer.id = 'audio-control-container';
        audioControlContainer.style.display = 'none'; // Hide initially

        // --- Song Name ---
        songNameDisplay = document.createElement('span');
        songNameDisplay.id = 'song-name';
        songNameDisplay.title = 'Current Song';
        songNameDisplay.textContent = '---';
        audioControlContainer.appendChild(songNameDisplay);

        // --- Play/Pause Button ---
        playPauseButton = document.createElement('button');
        playPauseButton.id = 'play-pause-button';
        playPauseButton.className = 'audio-button';
        playPauseButton.setAttribute('aria-label', 'Play');
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        audioControlContainer.appendChild(playPauseButton);

        // --- Next Button ---
        nextSongButton = document.createElement('button');
        nextSongButton.id = 'next-song-button';
        nextSongButton.className = 'audio-button';
        nextSongButton.setAttribute('aria-label', 'Next Song');
        nextSongButton.innerHTML = '<i class="fas fa-forward-step"></i>';
        audioControlContainer.appendChild(nextSongButton);

        // --- Mute Button Wrapper ---
        const muteButtonWrapper = document.createElement('div');
        muteButtonWrapper.id = 'mute-button'; // ID on the wrapper for hover target
        muteButtonWrapper.className = 'audio-button relative'; // Add relative for positioning context
        muteButtonWrapper.setAttribute('aria-label', 'Mute');
        muteButtonWrapper.innerHTML = '<i class="fas fa-volume-high"></i>'; // Initial icon
        audioControlContainer.appendChild(muteButtonWrapper);
        // Assign the wrapper div to the muteButton variable for event listeners
        muteButton = muteButtonWrapper;

        // --- Volume Container (inside Mute Button Wrapper) ---
        volumeContainer = document.createElement('div');
        volumeContainer.id = 'volume-container';
        // Styles are applied via CSS, no need for inline styles here
        muteButtonWrapper.appendChild(volumeContainer);

        // --- Volume Slider (inside Volume Container) ---
        volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.id = 'volume-slider';
        volumeSlider.min = '0';
        volumeSlider.max = '1';
        volumeSlider.step = '0.01';
        volumeSlider.value = String(DEFAULT_VOLUME); // Set initial value
        volumeContainer.appendChild(volumeSlider);

        // --- Settings Button ---
        settingsButton = document.createElement('button');
        settingsButton.id = 'settings-button';
        settingsButton.className = 'audio-button';
        settingsButton.setAttribute('aria-label', 'Audio Settings');
        settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
        audioControlContainer.appendChild(settingsButton);

        // --- Append Controls Container ---
        document.body.appendChild(audioControlContainer);

        console.log("[Audio] UI Created.");
    }


    // --- Audio Logic Functions (Adapted from Forte Previewer audio.js) ---

    function loadAudioSettings() { /* ... Keep function from previous script ... */
        try {
            const storedAutoplay = localStorage.getItem(SETTINGS_KEY_AUTOPLAY);
            autoplayEnabled = storedAutoplay === 'true';
            const storedVolume = localStorage.getItem(SETTINGS_KEY_VOLUME);
            const initialVolume = storedVolume !== null ? parseFloat(storedVolume) : DEFAULT_VOLUME;
            volumeBeforeMute = (initialVolume > 0) ? initialVolume : DEFAULT_VOLUME;
            const storedMuted = localStorage.getItem(SETTINGS_KEY_MUTED);
            isMuted = storedMuted === 'true';
            console.log(`[Audio] Settings Loaded: Autoplay=${autoplayEnabled}, Volume=${initialVolume}, Muted=${isMuted}`);
            if (volumeSlider) volumeSlider.value = isMuted ? 0 : initialVolume;
        } catch (e) { console.error("[Audio] Error loading settings:", e); autoplayEnabled = false; volumeBeforeMute = DEFAULT_VOLUME; isMuted = false; if (volumeSlider) volumeSlider.value = DEFAULT_VOLUME;}
    }
    function saveAudioSettings() { /* ... Keep function from previous script ... */
        try {
             const volumeToSave = (audio && !audio.muted) ? audio.volume : volumeBeforeMute;
             localStorage.setItem(SETTINGS_KEY_VOLUME, volumeToSave.toString());
             localStorage.setItem(SETTINGS_KEY_MUTED, String(isMuted));
             localStorage.setItem(SETTINGS_KEY_AUTOPLAY, String(autoplayEnabled));
        } catch (e) { console.error("[Audio] Error saving settings:", e); }
    }
    function handleUserInteraction() { /* ... Keep function from previous script ... */
        if (userHasInteracted || !audioPrompt) return; userHasInteracted = true;
        document.body.removeEventListener('click', handleUserInteraction); document.body.removeEventListener('keydown', handleUserInteraction); document.body.removeEventListener('touchstart', handleUserInteraction);
        console.log("[Audio] User interaction detected."); initAudio();
    }
    function initAudio() { /* ... Keep function from previous script ... */
        if (isAudioInitialized || !audioPrompt || !userHasInteracted) return;
        console.log("[Audio] Initializing audio object...");
        try {
            if (!audio) {
                audio = new Audio(); audio.volume = isMuted ? 0 : volumeBeforeMute; audio.muted = isMuted; audio.loop = false;
                audio.addEventListener('ended', playNextSong); audio.addEventListener('error', handleAudioError);
                audio.addEventListener('play', updatePlayPauseIcon); audio.addEventListener('pause', updatePlayPauseIcon);
                audio.addEventListener('volumechange', () => { if (audio) updateMuteIcon(audio.muted ? 0 : audio.volume); saveAudioSettings(); });
            }
            currentSongIndex = 0;
            if (playlist.length > 0) { audio.preload = 'metadata'; audio.src = playlist[currentSongIndex]; updateSongNameDisplay(); }
            else { console.warn("[Audio] Playlist is empty."); if(songNameDisplay) songNameDisplay.textContent = "No Songs"; if(playPauseButton) playPauseButton.disabled = true; if(nextSongButton) nextSongButton.disabled = true; }
            isAudioInitialized = true; audioPrompt.style.display = 'none'; if (audioControlContainer) audioControlContainer.style.display = 'flex';
            if (autoplayEnabled && playlist.length > 0) { console.log("[Audio] Autoplay enabled, attempting playback..."); playSong(currentSongIndex).catch(()=>{}); }
            else { console.log("[Audio] Autoplay disabled or empty playlist."); updatePlayPauseIcon(); updateMuteIcon(audio.muted ? 0 : audio.volume); }
            console.log("[Audio] Initialization sequence complete.");
        } catch (e) { console.error("[Audio] Error initializing audio object:", e); if(audioPrompt) { audioPrompt.textContent = "Audio Error"; audioPrompt.style.display = 'block'; } if (audioControlContainer) audioControlContainer.style.display = 'none'; isAudioInitialized = false; }
    }
    function playSong(index) { /* ... Keep function from previous script ... */
        if (!audio || index < 0 || index >= playlist.length) return Promise.reject("Invalid index or audio element");
        if (!isAudioInitialized) return Promise.reject("Audio not initialized");
        currentSongIndex = index; const songPath = playlist[currentSongIndex]; console.log(`[Audio] Setting src and playing index ${index}: ${songPath}`);
        audio.src = songPath; updateSongNameDisplay(); const playPromise = audio.play();
        if (playPromise !== undefined) { return playPromise.catch(error => { console.error(`[Audio] Playback failed for ${songPath}:`, error); updatePlayPauseIcon(); throw error; }); }
        else { console.warn("[Audio] audio.play() did not return a promise."); updatePlayPauseIcon(); return Promise.resolve(); }
    }
    function togglePlayPause() { /* ... Keep function from previous script ... */
        if (!userHasInteracted) { handleUserInteraction(); return; } if (!isAudioInitialized || !audio) { console.warn("[Audio] Cannot toggle play/pause: Audio not ready."); return; }
        if (audio.paused) { if (!audio.currentSrc || audio.ended) { console.log("[Audio] Attempting to play from start/current index."); playSong(currentSongIndex).catch(()=>{}); } else { audio.play().catch(e => console.error("[Audio] Resume play error:", e)); } } else { audio.pause(); }
    }
    function playNextSong() { /* ... Keep function from previous script ... */
        if (!isAudioInitialized || !audio || playlist.length === 0) return; console.log("[Audio] Song ended or next requested.");
        let nextIndex = (currentSongIndex + 1) % playlist.length; playSong(nextIndex).catch(() => { console.error(`[Audio] Failed to play next song index ${nextIndex}. Stopping playback.`); audio.pause(); updatePlayPauseIcon(); });
    }
    function updateSongNameDisplay() { /* ... Keep function from previous script ... */
        if (!songNameDisplay || playlist.length === 0) return; const indexToDisplay = (currentSongIndex >= 0 && currentSongIndex < playlist.length) ? currentSongIndex : 0; const songPath = playlist[indexToDisplay]; if (!songPath) { songNameDisplay.textContent = "No Song"; return; }
        try { const decodedPath = decodeURIComponent(songPath); const filename = decodedPath.substring(decodedPath.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, ""); const cleanedName = filename.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/(\d+)/g, ' $1').replace(/\s{2,}/g, ' ').trim(); songNameDisplay.textContent = cleanedName || "Unknown Song"; songNameDisplay.title = cleanedName || "Unknown Song"; } catch (e) { console.error("[Audio] Error decoding/parsing song path:", songPath, e); songNameDisplay.textContent = "Unknown Song"; songNameDisplay.title = "Unknown Song"; }
    }
    function toggleMute() { /* ... Keep function from previous script ... */
        if (!isAudioInitialized || !audio) return; isMuted = !isMuted; audio.muted = isMuted;
        if (isMuted) { if (audio.volume > 0) { volumeBeforeMute = audio.volume; } if(volumeSlider) volumeSlider.value = 0; if(muteButton) muteButton.setAttribute('aria-label', 'Unmute'); console.log(`[Audio] Muted. Volume stored: ${volumeBeforeMute}`); }
        else { const restoreVolume = (volumeBeforeMute > 0) ? volumeBeforeMute : DEFAULT_VOLUME; audio.volume = restoreVolume; if(volumeSlider) volumeSlider.value = restoreVolume; if(muteButton) muteButton.setAttribute('aria-label', 'Mute'); console.log(`[Audio] Unmuted. Volume restored to: ${restoreVolume}`); }
        saveAudioSettings();
    }
    function updateMuteIcon(volume) { /* ... Keep function from previous script ... */
        if (!muteButton || !audio) return; let iconClass = 'fa-volume-high'; if (audio.muted || volume <= 0) { iconClass = 'fa-volume-xmark'; } else if (volume <= 0.5) { iconClass = 'fa-volume-low'; }
        const iconElement = muteButton.querySelector('i'); if (iconElement) { iconElement.className = `fas ${iconClass}`; } else { muteButton.innerHTML = `<i class="fas ${iconClass}"></i>`; }
    }
    function updatePlayPauseIcon() { /* ... Keep function from previous script ... */
        if (!playPauseButton || !audio) return; const iconElement = playPauseButton.querySelector('i'); if (!iconElement) { playPauseButton.innerHTML = `<i class="fas fa-play"></i>`; playPauseButton.setAttribute('aria-label', 'Play'); return; }
        if (audio.paused) { iconElement.className = 'fas fa-play'; playPauseButton.setAttribute('aria-label', 'Play'); } else { iconElement.className = 'fas fa-pause'; playPauseButton.setAttribute('aria-label', 'Pause'); }
    }
    function handleAudioError(e) { /* ... Keep function from previous script ... */
        console.error("[Audio] Playback Error Event:", e); if(songNameDisplay) songNameDisplay.textContent = "Audio Error"; updatePlayPauseIcon();
    }
    function showVolumeSlider() { /* ... Keep function from previous script ... */
        if (!volumeContainer) return; clearTimeout(volumeHideTimeout); volumeContainer.style.display = 'block'; requestAnimationFrame(() => { volumeContainer.style.opacity = '1'; });
    }
    function startHideVolumeSlider() { /* ... Keep function from previous script ... */
        if (!volumeContainer) return; clearTimeout(volumeHideTimeout);
        volumeHideTimeout = setTimeout(() => {
            volumeContainer.style.opacity = '0';
            volumeContainer.addEventListener('transitionend', function handler() {
                volumeContainer.style.display = 'none';
                volumeContainer.removeEventListener('transitionend', handler);
            }, { once: true });
        }, VOLUME_SLIDER_HIDE_DELAY);
    }

    /** Attaches event listeners to the dynamically created UI elements */
    function attachEventListeners() {
        if (!audioPrompt || !playPauseButton || !nextSongButton || !muteButton || !volumeSlider || !settingsButton || !volumeContainer) {
            console.error("[Audio] Cannot attach listeners: One or more UI elements missing.");
            return;
        }

        // Initial interaction listeners
        document.body.addEventListener('click', handleUserInteraction, { once: true });
        document.body.addEventListener('keydown', handleUserInteraction, { once: true });
        document.body.addEventListener('touchstart', handleUserInteraction, { once: true });

        // Control button listeners
        playPauseButton.addEventListener('click', togglePlayPause);
        nextSongButton.addEventListener('click', playNextSong);
        muteButton.addEventListener('click', toggleMute);

        // Volume Slider Hover Logic
        const showHideElements = [muteButton, volumeContainer];
        showHideElements.forEach(el => {
            el.addEventListener('mouseenter', showVolumeSlider);
            el.addEventListener('mouseleave', startHideVolumeSlider);
        });

        // Volume Slider Input Logic
        volumeSlider.addEventListener('input', (e) => {
             if (!audio) return;
             const newVolume = parseFloat(e.target.value);
             audio.volume = newVolume; // Update volume (triggers 'volumechange' listener)

             // Implicitly unmute if volume > 0
             if (newVolume > 0 && audio.muted) {
                 isMuted = false;
                 audio.muted = false; // Triggers 'volumechange' which saves state and updates icon
                 if(muteButton) muteButton.setAttribute('aria-label', 'Mute');
                 console.log("[Audio] Unmuted via volume slider.");
             }
             // Store volume level if not muted
             if (!audio.muted) {
                 volumeBeforeMute = newVolume;
             }
        });

        // Settings Button Listener (Placeholder)
        settingsButton.addEventListener('click', () => {
            console.log("[Audio] Settings button clicked (placeholder).");
            alert("Audio settings panel not yet implemented.");
            // TODO: Implement settings panel logic here
        });

        console.log("[Audio] Event listeners attached.");
    }

    // --- Main Initialization ---
    function initializePlayer() {
        // 1. Inject CSS
        injectAudioPlayerCSS();
        // 2. Create HTML UI
        createAudioPlayerUI();
        // 3. Load settings (before attaching listeners that might use them)
        loadAudioSettings();
        // 4. Attach event listeners to the created UI
        attachEventListeners();
        // 5. Initial UI updates based on loaded settings
        updatePlayPauseIcon(); // Set initial play/pause icon
        updateMuteIcon(isMuted ? 0 : volumeBeforeMute); // Set initial mute icon

        console.log("[Audio] Player Initialized. Waiting for user interaction.");
    }

    // --- Run Initialization ---
    // Wait for the DOM to be ready before creating UI and attaching listeners
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlayer);
    } else {
        initializePlayer(); // DOM already loaded
    }

})(); // End IIFE

