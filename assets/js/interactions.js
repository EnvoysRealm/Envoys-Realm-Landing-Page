// interactions.js - Handles UI interactions, audio playback, and transitions
// Includes 3 modes: Normal -> Rave -> Techno -> Normal cycle.
// Implements 2-stage mute button: Click 1 shows slider, Click 2+ toggles mute.
// Attempts to initialize audio on Hell Button hover (with browser limitations).

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed for interactions.js");

    // --- Element Selectors ---
    const horrorBallWrapper = document.querySelector('.horror-ball-wrapper');
    const horrorBall = document.querySelector('.horror-ball');
    const hellButton = document.getElementById('hell-button');
    const audioPrompt = document.getElementById('audio-prompt');
    const tvShutdownOverlay = document.getElementById('tv-shutdown-overlay');

    if (!hellButton || !tvShutdownOverlay) {
        console.error("Essential HTML elements missing! (hellButton or tvShutdownOverlay)");
    }
    if (!audioPrompt) {
        console.warn("Audio prompt element (#audio-prompt) not found on initial load.");
    }

    // --- State Variables ---
    let audioInitialized = false;
    let isMuted = false;               // Mute state for ALL music tracks (Initial: Not Muted)
    let currentMode = 'normal';        // Current audio/visual mode ('normal', 'rave', 'techno')
    let isVolumeSliderVisible = false; // Slider visibility state (Initial: Hidden)

    // --- Audio Management ---
    // IMPORTANT: Replace placeholder path for technoMusic!
    const backgroundMusic = new Audio('./assets/music/Pokemon RedBlue - Pokemon tower (slowed reverb).mp3');
    const raveMusic = new Audio('./assets/music/Pokemon BlueRed - Bicycle Theme.mp3');
    const technoMusic = new Audio('./assets/music/Pokemon Techno Remix 2010 (Pokemon Center Theme).mp3'); // <-- REPLACE THIS PATH

    const tvShutoffSound = new Audio('./assets/sounds/tv-shutoff.mp3');
    const tvStaticSound = new Audio('./assets/sounds/tv-static.mp3');
    tvShutoffSound.preload = 'auto';
    tvStaticSound.preload = 'auto';

    // --- Create Audio Controls Dynamically ---
    const audioControlContainer = document.createElement('div');
    audioControlContainer.id = 'audio-control-container';
    const songNameDisplay = document.createElement('div');
    songNameDisplay.id = 'song-name';
    songNameDisplay.textContent = "---";
    const volumeContainer = document.createElement('div');
    volumeContainer.id = 'volume-container';
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range'; volumeSlider.min = 0; volumeSlider.max = 100; volumeSlider.value = 25;
    volumeSlider.id = 'volume-slider';
    const muteButton = document.createElement('button');
    muteButton.id = 'mute-button';
    muteButton.classList.add('audio-button');
    muteButton.textContent = isMuted ? '🔇' : '🔊'; // Initial icon based on state
    const modeButton = document.createElement('button'); // Renamed from raveModeButton
    modeButton.id = 'mode-button'; // Give it an ID if needed
    modeButton.classList.add('audio-button');
    // Initial icon for mode button (indicates clicking it will go to 'rave')
    modeButton.textContent = '🎉';

    // Assemble the controls
    volumeContainer.appendChild(volumeSlider);
    audioControlContainer.appendChild(songNameDisplay);
    audioControlContainer.appendChild(volumeContainer);
    audioControlContainer.appendChild(muteButton);
    audioControlContainer.appendChild(modeButton); // Add the mode cycle button

    // --- Audio Utility Functions ---
    function updateSongName(audioElement) { /* ... (Keep code from previous complete version) ... */
        if (!audioElement || !songNameDisplay) return;
        try {
            if (!audioElement.src || !audioElement.src.includes('/') || audioElement.src.endsWith('/')) {
                songNameDisplay.textContent = "Loading...";
                const updateOnLoad = () => updateSongName(audioElement);
                const updateOnError = () => { songNameDisplay.textContent = "Audio Error"; };
                audioElement.addEventListener('loadedmetadata', updateOnLoad, { once: true });
                audioElement.addEventListener('error', updateOnError, { once: true });
                audioElement.addEventListener('emptied', () => {
                     audioElement.removeEventListener('loadedmetadata', updateOnLoad);
                     audioElement.removeEventListener('error', updateOnError);
                }, { once: true });
                return;
            }
            const filename = audioElement.src.split('/').pop();
            if (!filename) { songNameDisplay.textContent = "---"; return; }
            const decodedName = decodeURIComponent(filename)
                .replace(/\.(mp3|wav|ogg)$/i, '').replace(/_/g, ' ').replace(/-/g, ' - ')
                .replace(/ {2,}/g,' ').replace(/\(.*?\)/g, '').trim();
            songNameDisplay.textContent = decodedName || "---";
        } catch (e) { console.error("Error parsing/updating song name:", e); songNameDisplay.textContent = "Error"; }
    }

    function setVolume(volumeValue) {
        const volume = parseFloat(volumeValue) / 100;
        backgroundMusic.volume = volume;
        raveMusic.volume = volume;
        technoMusic.volume = volume; // Apply to techno track too
        console.log("Volume set to:", volumeValue);
    }

    function setupAudio() {
        backgroundMusic.loop = true;
        raveMusic.loop = true;
        technoMusic.loop = true; // Loop techno track
        setVolume(volumeSlider.value); // Set initial volume for all
    }

    // --- Function to Initialize Audio on User Interaction ---
    function initAudio() { /* ... (Keep code from previous complete version, it's already safe) ... */
        if (audioInitialized) return;
        audioInitialized = true;
        console.log("Running initAudio()...");
        const currentAudioPrompt = document.getElementById('audio-prompt');
        if (currentAudioPrompt) { currentAudioPrompt.remove(); }
        if (!document.getElementById('audio-control-container')) {
            document.body.appendChild(audioControlContainer);
        }
        setupAudio();
        console.log("Attempting backgroundMusic.play() inside initAudio...");
        backgroundMusic.play()
            .then(() => {
                console.log("Background music playing started successfully.");
                updateSongName(backgroundMusic);
            })
            .catch(error => {
                console.warn(`Background music play() failed inside initAudio (Error: ${error.name}). This is expected if triggered by hover before user click/tap.`);
                if (songNameDisplay) songNameDisplay.textContent = "Audio Paused";
            });
     }

    // --- Autoplay Fix: Require User Interaction (Reliable Method) ---
    function interactionHandler() { /* ... (Keep code from previous complete version) ... */
        if (!audioInitialized) {
            console.log("User interaction (click/tap/key) detected, ensuring audio initialization.");
            initAudio();
        }
    }
    document.addEventListener('click', interactionHandler, { once: true });
    document.addEventListener('touchstart', interactionHandler, { once: true });
    document.addEventListener('keydown', interactionHandler, { once: true });
    const initialAudioPrompt = document.getElementById('audio-prompt');
    if (initialAudioPrompt) {
        initialAudioPrompt.addEventListener('click', interactionHandler, { once: true });
    }

    // --- Audio Control Interactions ---

    if (volumeSlider) { volumeSlider.addEventListener('input', (e) => { setVolume(e.target.value); }); }

    // Mute Button & Volume Slider Visibility (LOGIC: Click 1: Show, Click 2: Mute)
    function hideVolumeSlider() { /* ... (Keep code from previous complete version) ... */
         if (isVolumeSliderVisible && volumeContainer) { volumeContainer.style.display = 'none'; isVolumeSliderVisible = false; }
    }
    function showVolumeSlider() { /* ... (Keep code from previous complete version) ... */
        if (!isVolumeSliderVisible && volumeContainer) { volumeContainer.style.display = 'block'; isVolumeSliderVisible = true; }
    }

    if (muteButton) {
        muteButton.textContent = isMuted ? '🔇' : '🔊'; // Set initial icon
        muteButton.addEventListener('click', () => {
            if (!audioInitialized) initAudio();
            if (isVolumeSliderVisible) {
                // --- SECOND+ CLICK LOGIC (Slider is already visible) ---
                isMuted = !isMuted; // Toggle mute state
                backgroundMusic.muted = isMuted; // Apply to all music tracks
                raveMusic.muted = isMuted;
                technoMusic.muted = isMuted;
                muteButton.textContent = isMuted ? '🔇' : '🔊'; // Update icon
                console.log("Music Muted Toggled:", isMuted);
            } else {
                // --- FIRST CLICK LOGIC (Slider is hidden) ---
                showVolumeSlider(); // ONLY show the slider.
                console.log("Volume slider shown on first click.");
            }
        });
    }

    // Click Outside Listener (Hides volume slider)
    document.addEventListener('click', (event) => { /* ... (Keep code from previous complete version) ... */
         if (isVolumeSliderVisible && muteButton && !muteButton.contains(event.target) && volumeContainer && !volumeContainer.contains(event.target)) { hideVolumeSlider(); }
    });
    document.addEventListener('touchstart', (event) => { /* ... (Keep code from previous complete version) ... */
        if (isVolumeSliderVisible && muteButton && !muteButton.contains(event.target) && volumeContainer && !volumeContainer.contains(event.target)) { hideVolumeSlider(); }
    }, { passive: true });


    // === Mode Cycle Button Interaction (NEW LOGIC) ===
    if (modeButton) {
        modeButton.addEventListener('click', () => {
            if (!audioInitialized) initAudio(); // Ensure audio is ready

            let nextMode = 'normal'; // Default to normal if something goes wrong
            let nextIcon = '🎉';
            let musicToPlay = backgroundMusic;
            let musicToPause = [raveMusic, technoMusic];

            // Determine next state based on current state
            if (currentMode === 'normal') {
                nextMode = 'rave';
                nextIcon = '🪩'; // Icon indicates clicking again goes to Techno
                musicToPlay = raveMusic;
                musicToPause = [backgroundMusic, technoMusic];
            } else if (currentMode === 'rave') {
                nextMode = 'techno';
                nextIcon = '🎵'; // Icon indicates clicking again goes to Normal
                musicToPlay = technoMusic;
                musicToPause = [backgroundMusic, raveMusic];
            } else if (currentMode === 'techno') {
                nextMode = 'normal';
                nextIcon = '🎉'; // Icon indicates clicking again goes to Rave
                musicToPlay = backgroundMusic;
                musicToPause = [raveMusic, technoMusic];
            }

            // Update the mode state
            currentMode = nextMode;
            console.log("Mode changed to:", currentMode);

            // Update button icon
            modeButton.textContent = nextIcon;

            // Pause other tracks first
            musicToPause.forEach(audio => audio.pause());

            // Play the target track only if music isn't muted globally
            if (!isMuted) {
                musicToPlay.play().catch(e => console.error(`Error playing ${currentMode} music:`, e));
            } else {
                // If muted, ensure the target track is ready but paused
                 musicToPlay.pause(); // Ensure it's paused if muted
                 // Alternatively, let it play muted:
                 // musicToPlay.play().catch(e => console.error(...)); musicToPlay.muted = true;
            }

            // Update the displayed song name
            updateSongName(musicToPlay);

            // --- Dispatch state change event for the background ---
            document.dispatchEvent(new CustomEvent('background-state-change', {
                detail: { state: currentMode } // Send 'normal', 'rave', or 'techno'
            }));
        });
    }

    // --- Hell Button Interactions ---
    if (hellButton) {
        // Attempt init on hover
        hellButton.addEventListener('mouseenter', () => { /* ... (Keep code from previous complete version) ... */
             if (!audioInitialized) { console.log("Hover on Hell Button, attempting initAudio..."); }
             initAudio();
             if (audioInitialized && tvStaticSound) {
                tvStaticSound.currentTime = 0;
                tvStaticSound.play().catch(e => { console.warn(`Static sound play() on hover failed/blocked (Error: ${e.name}). Expected before first click/tap.`); });
             }
        });
        hellButton.addEventListener('mouseleave', () => { /* ... (Keep code from previous complete version) ... */
             if (tvStaticSound) tvStaticSound.pause();
        });

        // Handle click (Transition)
        hellButton.addEventListener('click', (e) => { /* ... (Keep code from previous complete version, BUT update pause logic) ... */
            e.preventDefault();
            if (!audioInitialized) initAudio();
            console.log('Hell Button Clicked - Triggering Transition');
            hellButton.classList.add('clicked');
            setTimeout(() => { hellButton.classList.remove('clicked'); }, 150);

            // Stop ALL sounds/music (including techno)
            try {
                tvStaticSound.pause(); tvStaticSound.currentTime = 0;
                backgroundMusic.pause();
                raveMusic.pause();
                technoMusic.pause(); // Pause techno track too
                console.log("All sounds/music paused for transition.");
            } catch (err) { console.error("Error pausing sounds:", err); }

            // Play TV Shutoff Sound
            if (audioInitialized && tvShutoffSound) {
                console.log("Attempting to play TV Shutoff Sound...");
                tvShutoffSound.currentTime = 0;
                tvShutoffSound.play().catch(e => console.error("Error playing shutoff sound:", e));
            } else {
                console.warn("Audio not initialized or shutoff sound missing, cannot play sound.");
            }

            // Trigger Visual TV Shutdown Transition
            if (tvShutdownOverlay) {
                void tvShutdownOverlay.offsetWidth;
                tvShutdownOverlay.classList.add('active');
                console.log("TV Shutdown class added.");
            } else { console.error("TV Shutdown Overlay element not found!"); }

            // Navigate After Transition Delay
            const navigationDelay = 350;
            setTimeout(() => {
                console.log("Navigating to homepage.html");
                window.location.href = 'homepage.html';
            }, navigationDelay);
        });
    } else {
        console.warn("Hell button element #hell-button not found.");
    }

    // --- Pokéball Interaction (If Applicable) ---
    if (horrorBallWrapper && horrorBall) { /* ... (Keep code from previous complete version) ... */
        horrorBallWrapper.addEventListener('click', () => {
            if (horrorBall) {
                horrorBall.classList.remove('shake'); void horrorBall.offsetWidth; horrorBall.classList.add('shake');
                console.log("Pokeball clicked, shake animation applied.");
            }
        });
     } else {
        console.warn("Pokeball elements not found for click listener.");
     }

    console.log("Interaction listeners added.");

}); // End DOMContentLoaded