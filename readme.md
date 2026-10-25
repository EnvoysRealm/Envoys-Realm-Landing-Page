# Envoy's Realm

## Project Overview
A dark, interactive web experience featuring a dynamic Three.js particle background, interactive UI elements with audio feedback, and a unique horror/hellish theme inspired by Pokémon aesthetics.

## Features
-   Dynamic Three.js particle cloud background with subtle "breathing" effect and mouse/touch interaction.
-   Themed particle colors (dark reds/purples) with a brighter, faster "Rave Mode".
-   Animated "horror pokeball" element with default wobble and interactive shake effect on click/tap.
-   "Welcome to Hell" button with interactive hover sound and click transition effect.
-   Background Music player with track display, volume control, mute, and Rave Mode toggle.
-   TV shutdown screen transition effect on button click.
-   Audio prompt for browser autoplay policy compliance.
-   Responsive design adapting elements for smaller screens.
-   Mobile touch interaction support for background drag and element clicks/taps.

## Technologies Used
-   HTML5
-   CSS3 (including Flexbox, Animations)
-   JavaScript (ES6+, DOM Manipulation, Event Handling)
-   Three.js (for particle background)
-   HTML Audio API (for sound effects and music)
-   Tailwind CSS (for utility classes, optional)

## Project Structure
.├── assets│   ├── css│   │   ├── main.css        # Base layout, structure│   │   └── theme.css       # Element styles, colors, animations│   │   └── audio.css       # (Optional) Styles for audio controls│   ├── js│   │   ├── background.js   # Three.js background logic│   │   └── interactions.js # UI interactions, audio logic│   ├── music│   │   └── placeholder_tower.mp3   # Replace with actual music files│   │   └── placeholder_bicycle.mp3 # Replace with actual music files│   └── sounds│   │   └── placeholder_tv_shutoff.mp3 # Replace with actual sound files│   │   └── placeholder_tv_static.mp3  # Replace with actual sound files├── index.html              # Main page structure└── README.md               # This file
## Setup
1.  Clone or download the repository.
2.  Create the necessary folders: `assets/music/` and `assets/sounds/`.
3.  Place your audio files into these folders. **Important:** You must rename your files or update the filenames inside `assets/js/interactions.js` to match the ones used in the script (e.g., `placeholder_tower.mp3`, `placeholder_bicycle.mp3`, `placeholder_tv_shutoff.mp3`, `placeholder_tv_static.mp3`).
4.  Open `index.html` in a modern web browser that supports WebGL (for Three.js).
5.  Click anywhere on the page when prompted to enable audio playback.
6.  Interact with the horror ball, button, and audio controls.

## Customization
-   **Visual Theme & Styles:** Modify `assets/css/theme.css` to adjust colors, glows, fonts, and element appearances.
-   **Layout:** Adjust layout rules in `assets/css/main.css`.
-   **Background Effect:** Modify parameters (particle count, speed, colors, etc.) within `assets/js/background.js`.
-   **Interactions & Audio:** Edit timings, sound files, or interaction logic in `assets/js/interactions.js`.

## License
[Your License Here]
