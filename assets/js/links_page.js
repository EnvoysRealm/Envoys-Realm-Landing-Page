// assets/js/links_page.js

// Ensure the App namespace exists *before* other scripts might try to use it.
window.App = window.App || {};
console.log("links_page.js: Initializing App namespace if needed.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("links_page.js: DOMContentLoaded event fired.");

    // --- Project Data (Define within App namespace) ---
    App.projects = [
         {
            id: "project-1",
            title: "Forte Previewer",
            description: "This project is a web-based image gallery viewer with advanced features, designed to showcase images (like Pokémon TCG cards) organized in folders. It includes filtering, sorting by folder, dynamic sizing, interactive hover effects, background music, and a particle background animation.",
            icon: null,
            iconUrl: 'https://raw.githubusercontent.com/Envoyofhell/Pocket-Image-Previewer/Forte/resources/forte-arrivals.png',
            projectUrl: "https://forte.meta-ptcg.org/", // Subdomain URL
            githubUrl: "https://github.com/Envoyofhell",
            glowHue: 0
        },
        {
            id: "project-2",
            title: "Meta-PTCG",
            description: "A custom Pokémon TCG simulator application designed for experimenting with non-standard Pokémon mechanics and custom cards.",
            iconUrl: 'https://raw.githubusercontent.com/Envoyofhell/ptcg-sim-meta/refs/heads/main/client/src/assets/favicon.ico',
            projectUrl: "https://meta.meta-ptcg.org/", // Subdomain URL
            githubUrl: "https://github.com/Envoyofhell/ptcg-sim-meta",
            glowHue: 280
        },
        {
            id: "project-3",
            title: "Pokedex",
            description: "A web-based application that allows users to browse Pokémon by generation, search for specific Pokémon, and view detailed information including game stats, descriptions, moves, abilities, and related Trading Card Game (TCG) cards.",
            // **PATH CHECK:** Verify '/src/dex.png' is correct on Cloudflare
            iconUrl: '/src/dex.png',
            projectUrl: "https://pokedex.meta-ptcg.org/", // Subdomain URL
            githubUrl: "https://github.com/Envoyofhell",
            glowHue: 330
        },
        {
            id: "project-4",
            title: "BallsDex Card Maker",
            description: "A tool for creating stunning, interactive charts and graphs from complex datasets using D3.js.",
             // **PATH CHECK:** Verify '/src/ball.png' is correct on Cloudflare
            iconUrl: '/src/ball.png',
            projectUrl: "https://ballsdex.meta-ptcg.org/", // Subdomain URL
            githubUrl: "https://github.com/Envoyofhell",
            glowHue: 210
        },
        {
            id: "project-5",
            title: "Poke Clicker",
            description: "A retro-themed Pokemon Clicker inspired by the popular cookie clicker game.",
             // **PATH CHECK:** Verify '/src/egg.png' is correct on Cloudflare
            iconUrl: '/src/egg.png',
            projectUrl: "https://clicker.meta-ptcg.org/", // Subdomain URL
            githubUrl: "https://github.com/Envoyofhell",
            glowHue: 300
        },
         {
            id: "project-6",
            title: "Pi-Calculator",
            description: "This is an interactive web application featuring multiple calculators or visualizers presented in a tabbed interface, enhanced with dynamic effects, themed styling, and a bubble wrap clicker mini-game.",
            iconUrl: 'https://i.pinimg.com/474x/fd/a4/b7/fda4b72909472b12602bd9c26c0c0cdc.jpg',
            projectUrl: "https://envoyofhell.github.io/Pi-Calculator/", // External URL
            githubUrl: "https://github.com/Envoyofhell/Pi-Calculator",
            glowHue: 260
        },
    ];
    App.areProjectsLoading = false;
    console.log("links_page.js: App.projects defined.");

    // --- DOM Element Selectors (Get elements *after* DOM is ready) ---
    // These might be re-queried if content loads dynamically
    let cardsContainer = document.querySelector(".cards-container");
    let cardsWrapper = document.querySelector(".cards-wrapper");
    const cursorLight = document.querySelector(".cursor-light");
    const mainContentArea = document.querySelector('main'); // Keep reference
    const initialLoader = document.getElementById('initial-loader'); // Get initial loader

    // --- State Variables ---
    let totalWidthOfOneSet = 0;
    let scrollPosition = 0;
    let animationFrameId = null;
    let isManuallyScrolling = false;
    let resizeTimeout;
    const scrollSpeed = 0.4;
    const HOME_PAGE_FILENAME = 'homepage.html'; // Define home page filename
    const HOME_PAGE_PATH = '/homepage'; // Define the path used on deployment

    // --- Carousel Functions ---

    function createCardElement(project) {
        const card = document.createElement("div");
        card.className = "card";
        card.id = project.id;
        card.style.setProperty("--glow-hue", String(project.glowHue));

        // Animation timing
        const glowDuration = 3 + Math.random() * 3;
        const glowDelay = Math.random() * -4;
        const floatDuration = 4 + Math.random() * 3;
        card.style.setProperty("--glow-duration", `${glowDuration}s`);
        card.style.setProperty("--glow-delay", `${glowDelay}s`);
        card.style.animationDuration = `${floatDuration}s, ${glowDuration}s`;

        // Icon logic - Refined onerror
        let finalIconContent = '<span class="text-xl font-bold text-gray-500">?</span>'; // Default fallback
        if (project.iconUrl) {
            // Use template literal for cleaner onerror fallback
            finalIconContent = `<img src="${project.iconUrl}" alt="${project.title} icon" class="w-full h-full object-contain" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-xl font-bold text-gray-500\\'>?</span>';">`;
        } else if (project.icon) {
            finalIconContent = project.icon.replace('<svg', '<svg class="w-full h-full object-contain"');
        }


        // Card HTML
        card.innerHTML = `
            <div class="card-content">
                <div class="flex-grow">
                    <div class="card-header">
                        <span class="card-icon">${finalIconContent}</span>
                        <h3 class="card-title">${project.title}</h3>
                    </div>
                    <p class="card-description">${project.description}</p>
                </div>
                <div class="card-links">
                    <a href="${project.projectUrl}" target="_blank" rel="noopener noreferrer" class="card-link" title="View Project: ${project.title}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                        <span>View</span>
                    </a>
                    <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="card-github-link" title="View GitHub Repository for ${project.title}">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                        <span>GitHub</span>
                    </a>
                </div>
            </div>`;

        // --- Card Click Listener uses App.loadProjectIframe ---
        card.addEventListener('click', (e) => {
            const clickedLink = e.target.closest('a.card-link, a.card-github-link');
            if (clickedLink) {
                // console.log(`Card Click: Clicked on explicit link (${clickedLink.href}), allowing default.`);
                return; // Allow default behavior for View/GitHub links
            }

            // If click is on card body, load project iframe
            console.log(`Card Click: Clicked on card body for project: ${project.title}. Calling App.loadProjectIframe.`);
            e.preventDefault();
            e.stopPropagation();

            if (typeof App.loadProjectIframe === 'function') {
                 // Pass necessary info to the iframe loader function
                 App.loadProjectIframe(project.projectUrl, project.title, project.id);
            } else {
                 console.error("Card Click Error: App.loadProjectIframe function is not defined!");
            }
        });

        return card;
    }

    function initializeCarousel() {
        console.log("Carousel: Attempting initialization...");
        // Re-query elements in case they were loaded dynamically
        cardsContainer = document.querySelector(".cards-container");
        cardsWrapper = document.querySelector(".cards-wrapper");

        if (!cardsContainer || !cardsWrapper) {
            console.error("Carousel Init Failed: container or wrapper missing.");
            return false; // Indicate failure
        }
        if (!App.projects || App.projects.length === 0) {
             console.warn("Carousel Init Failed: Projects array empty or not ready.");
             // Ensure placeholder is visible if init fails here
             cardsContainer.innerHTML = '<div class="text-center text-gray-400 p-10">No projects to display.</div>';
             return false; // Indicate failure
        }

        console.log("Carousel: Elements found, populating cards...");
        cardsContainer.innerHTML = ""; // Clear existing (including potential placeholder)
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 3; i++) {
            App.projects.forEach(project => fragment.appendChild(createCardElement(project)));
        }
        cardsContainer.appendChild(fragment);
        console.log("Carousel: Cards populated.");

        // Use setTimeout to allow rendering before calculation
        setTimeout(() => {
            console.log("Carousel: Calculating set width...");
            totalWidthOfOneSet = calculateSetWidth();
            if (totalWidthOfOneSet > 0) {
                scrollPosition = totalWidthOfOneSet;
                if (cardsWrapper) { // Check again inside timeout
                     cardsWrapper.style.transition = 'none';
                     cardsWrapper.style.transform = `translateX(-${scrollPosition}px)`;
                     void cardsWrapper.offsetWidth;
                     cardsWrapper.style.transition = '';
                     console.log(`Carousel: Initialized. Set width: ${totalWidthOfOneSet}px. Initial scroll: ${scrollPosition}px`);
                     startCarouselAnimation();
                } else {
                     console.error("Carousel Init Timeout: cardsWrapper became null.");
                }
            } else {
                console.warn("Carousel Init Timeout: Width calculation failed.");
                if(cardsWrapper) cardsWrapper.style.transform = `translateX(0px)`;
            }
        }, 100); // Delay for rendering
        return true; // Indicate success
    }

    function calculateSetWidth() {
        // (Function content remains the same)
        cardsContainer = document.querySelector(".cards-container");
        if (!App.projects || App.projects.length === 0 || !cardsContainer) return 0;
        const firstCard = cardsContainer.querySelector('.card');
        if (!firstCard) return 0;

        try {
            const containerStyle = window.getComputedStyle(cardsContainer);
            const cardWidth = firstCard.offsetWidth;
            const gap = parseFloat(containerStyle.gap) || 0;
            const setWidth = (cardWidth * App.projects.length) + (gap * App.projects.length);
            return setWidth > 0 ? setWidth : 0;
        } catch (e) {
            console.error("Error calculating set width:", e);
            return 0;
        }
    }

    function animateCarouselLoop() {
        // (Function content remains the same)
         cardsWrapper = document.querySelector(".cards-wrapper");
        if (isManuallyScrolling || totalWidthOfOneSet <= 0 || !cardsWrapper) {
            animationFrameId = requestAnimationFrame(animateCarouselLoop);
            return;
        }

        scrollPosition += scrollSpeed;
        const startOfSecondSet = totalWidthOfOneSet;
        const startOfThirdSet = totalWidthOfOneSet * 2;

        if (scrollPosition >= startOfThirdSet) {
            const positionWithinSet = (scrollPosition - startOfSecondSet) % totalWidthOfOneSet;
            const newScrollPosition = startOfSecondSet + positionWithinSet;
            cardsWrapper.style.transition = 'none';
            requestAnimationFrame(() => {
                 if (cardsWrapper) {
                      cardsWrapper.style.transform = `translateX(-${newScrollPosition}px)`;
                      requestAnimationFrame(() => {
                           if (cardsWrapper) cardsWrapper.style.transition = '';
                      });
                 }
            });
            scrollPosition = newScrollPosition;
        } else {
            cardsWrapper.style.transform = `translateX(-${scrollPosition}px)`;
        }
        animationFrameId = requestAnimationFrame(animateCarouselLoop);
    }

    function startCarouselAnimation() {
        // (Function content remains the same)
         cardsWrapper = document.querySelector(".cards-wrapper");
        if (!animationFrameId && totalWidthOfOneSet > 0 && cardsWrapper) {
            console.log("Carousel: Starting animation.");
            isManuallyScrolling = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(animateCarouselLoop);
        } else if (totalWidthOfOneSet <= 0) {
             console.warn("Carousel: Cannot start animation, width is invalid.");
        } else if (!cardsWrapper) {
             console.warn("Carousel: Cannot start animation, wrapper not found.");
        }
    }

    function stopCarouselAnimation() {
        // (Function content remains the same)
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    /**
     * Smoothly scrolls the carousel to bring the specified card into view.
     * Exposed via App.scrollToCard.
     * @param {string} cardId - The ID of the card element to scroll to.
     */
    App.scrollToCard = function(cardId) {
        // (Function content remains the same)
        console.log(`App.scrollToCard called for: ${cardId}`);
        const currentCardsContainer = document.querySelector(".cards-container");
        const currentCardsWrapper = document.querySelector(".cards-wrapper");

        if (!currentCardsContainer || !currentCardsWrapper || !App.projects || App.projects.length === 0) {
            console.warn(`ScrollToCard: Cannot scroll, missing elements or projects. Container: ${!!currentCardsContainer}, Wrapper: ${!!currentCardsWrapper}`);
            return;
        }
        totalWidthOfOneSet = calculateSetWidth();
        if (totalWidthOfOneSet <= 0) {
             console.warn("ScrollToCard: Cannot scroll, set width is zero.");
             return;
        }

        const allCards = Array.from(currentCardsContainer.querySelectorAll('.card'));
        if (allCards.length === 0) {
             console.warn("ScrollToCard: No cards found in container.");
             return;
        }

        const projectIndex = App.projects.findIndex(p => p.id === cardId);
        if (projectIndex === -1) {
            console.warn(`ScrollToCard: Project index for card ID ${cardId} not found.`);
            return;
        }

        const targetCardInstanceIndex = App.projects.length + projectIndex;
        const targetCardInstance = allCards[targetCardInstanceIndex];
        if (!targetCardInstance) {
            console.warn(`ScrollToCard: Card instance ${targetCardInstanceIndex} for ID ${cardId} not found.`);
            return;
        }

        const carouselVisibleWidth = currentCardsWrapper.parentElement?.offsetWidth || window.innerWidth;
        const cardWidth = targetCardInstance.offsetWidth;
        const cardOffsetLeft = targetCardInstance.offsetLeft;

        let targetScroll = cardOffsetLeft - (carouselVisibleWidth / 2) + (cardWidth / 2);
        const targetOffsetWithinAnySet = targetScroll % totalWidthOfOneSet;
        let finalTargetScroll = totalWidthOfOneSet + targetOffsetWithinAnySet;

        finalTargetScroll = Math.max(totalWidthOfOneSet, finalTargetScroll);
        finalTargetScroll = Math.min(totalWidthOfOneSet * 2 - 1, finalTargetScroll);

        console.log(`ScrollToCard: Scrolling to ${cardId}. Final Target Scroll: ${finalTargetScroll.toFixed(2)}`);

        stopCarouselAnimation();
        isManuallyScrolling = true;

        currentCardsWrapper.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        currentCardsWrapper.style.transform = `translateX(-${finalTargetScroll}px)`;
        scrollPosition = finalTargetScroll;

        clearTimeout(window.resumeScrollTimeout);
        window.resumeScrollTimeout = setTimeout(() => {
            const wrapperAfterScroll = document.querySelector(".cards-wrapper");
            if (wrapperAfterScroll) {
                wrapperAfterScroll.style.transition = '';
            }
            isManuallyScrolling = false;
            startCarouselAnimation();
            console.log("ScrollToCard: Resuming auto-scroll.");
        }, 900);
    }

    // --- Cursor Light Effect ---
    function handleMouseMove(e) { /* (same) */ }
    function handleMouseOver(e) { /* (same) */ }


    // --- Content Loading (SPA Functionality for INTERNAL links only) ---
    /**
     * Fetches and loads content into the main area FOR INTERNAL PAGES.
     * Exposed via App.loadContent.
     * @param {string} url - The URL of the internal page content to load (e.g., about.html).
     * @param {boolean} [isPopState=false] - True if triggered by back/forward button.
     * @returns {Promise<void>} - Promise that resolves when content is loaded/processed.
     */
    App.loadContent = async function(url, isPopState = false) {
        // (Function content remains largely the same, ensure it uses HOME_PAGE_FILENAME correctly)
        return new Promise(async (resolve, reject) => {
             const currentMainContentArea = document.querySelector('main');
            if (!currentMainContentArea) {
                console.error("LoadContent (Internal): Main content area not found!");
                return reject(new Error("Main content area not found!"));
            }

            console.log(`LoadContent (Internal): Loading content from: ${url}`);
            stopCarouselAnimation();
            currentMainContentArea.innerHTML = '<p class="text-center text-xl p-10">Loading...</p>';
            document.title = "Loading... | Envoy's Links";

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.error(`LoadContent (Internal): HTTP error! status: ${response.status} fetching ${url}`);
                    throw new Error(`HTTP error! status: ${response.status} loading ${url}`);
                }
                const htmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');
                const newContentElement = doc.querySelector('main');
                const newTitle = doc.querySelector('title')?.textContent || "Envoy's Links";

                if (newContentElement) {
                    console.log("LoadContent (Internal): Found new <main> content.");
                    currentMainContentArea.innerHTML = newContentElement.innerHTML;
                    document.title = newTitle;

                    if (typeof App.Menu?.init === 'function') {
                         console.log("LoadContent (Internal): Re-initializing Menu...");
                         App.Menu.init(); // Re-initialize menu to ensure listeners are attached
                    } else {
                         console.warn("LoadContent (Internal): App.Menu.init function not found.");
                    }

                    // **FIX:** Check if the loaded page is the homepage using filename or path
                    const isHomePage = url === HOME_PAGE_FILENAME || url === HOME_PAGE_PATH || (url === '/' && HOME_PAGE_FILENAME === 'homepage.html');
                    console.log(`LoadContent (Internal): Checking if loaded URL '${url}' is homepage (${HOME_PAGE_FILENAME}): ${isHomePage}`);

                    if (isHomePage) {
                         const carouselContainer = currentMainContentArea.querySelector('.carousel-container');
                         if (carouselContainer) {
                              console.log("LoadContent (Internal): Homepage loaded and contains carousel. Re-initializing Carousel...");
                              requestAnimationFrame(() => {
                                   const carouselInitialized = initializeCarousel();
                                   if (!carouselInitialized) {
                                        console.error("LoadContent (Internal): Failed to re-initialize carousel.");
                                   }
                              });
                         } else {
                              console.warn("LoadContent (Internal): Homepage loaded but '.carousel-container' not found in its <main> content.");
                         }
                    } else {
                         console.log("LoadContent (Internal): Non-homepage loaded, no carousel init needed.");
                         stopCarouselAnimation(); // Ensure stopped if navigating away from index
                    }

                    // Update history state ONLY for non-iframe views
                    if (!isPopState) {
                         console.log(`LoadContent (Internal): Pushing state for internal page ${url}`);
                         const relativeUrl = url.startsWith('/') ? url.substring(1) : url; // Ensure relative path
                         window.history.pushState({ path: relativeUrl }, newTitle, relativeUrl);
                    }
                    console.log(`LoadContent (Internal): Successfully loaded ${url}`);
                    resolve();

                } else {
                     console.error(`LoadContent (Internal): Could not find <main> element in fetched HTML from ${url}.`);
                     currentMainContentArea.innerHTML = `<p class="text-center text-red-500 p-10">Error: Could not parse content from ${url}. Missing &lt;main&gt; tag?</p>`;
                     reject(new Error(`Could not find <main> element in fetched HTML from ${url}`));
                }

            } catch (error) {
                console.error('LoadContent (Internal): Failed to load or process content:', error);
                 if (currentMainContentArea) {
                      currentMainContentArea.innerHTML = `<p class="text-center text-red-500 p-10">Error loading internal content from ${url}.</p><p class="text-center text-sm text-gray-400">${error.message}</p>`;
                 }
                document.title = "Error | Envoy's Links";
                reject(error);
            }
        });
    }

    // --- Function to Load Project Iframe ---
    /**
     * Clears main content and loads the specified project URL into an iframe.
     * @param {string} projectUrl - The URL of the project (subdomain).
     * @param {string} projectTitle - The title of the project.
     * @param {string} projectId - The unique ID of the project (e.g., 'project-3').
     */
    App.loadProjectIframe = function(projectUrl, projectTitle, projectId) {
         console.log(`App.loadProjectIframe called for: ${projectTitle} (${projectUrl})`);
         const currentMainContentArea = document.querySelector('main');
         if (!currentMainContentArea) {
              console.error("LoadProjectIframe: Main content area not found!");
              return;
         }
         if (!projectUrl || projectUrl === '#') {
              console.error("LoadProjectIframe: Invalid project URL provided.");
              return;
         }
          if (typeof App.loadContent !== 'function') {
               console.error("LoadProjectIframe: App.loadContent function is missing for back button functionality.");
               return; // Need loadContent for the back button
          }

         console.log(`LoadProjectIframe: Loading ${projectUrl} into iframe.`);
         stopCarouselAnimation(); // Stop carousel if it's running
         currentMainContentArea.innerHTML = ''; // Clear main content area

         // --- Create Back Button ---
         const backButton = document.createElement('button');
         backButton.textContent = '← Back to Projects';
         backButton.className = 'absolute top-20 left-4 z-10 mb-4 px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded shadow-md transition-colors duration-200'; // Adjusted top
         backButton.onclick = () => {
              console.log("Back Button Clicked: Reloading homepage content.");
              App.loadContent(HOME_PAGE_FILENAME) // **FIX:** Use filename for loading
                   .catch(err => console.error("Back Button: Error loading homepage content:", err));
         };
         currentMainContentArea.appendChild(backButton);

         // --- Create Loading Indicator (Spinner) ---
         const loadingContainer = document.createElement('div');
         // Center the container itself
         loadingContainer.id = 'iframe-loader'; // Add ID for potential targeting
         loadingContainer.className = 'absolute inset-0 flex flex-col items-center justify-center text-gray-400';
         loadingContainer.innerHTML = `
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <p>Loading ${projectTitle}...</p>
         `;
         currentMainContentArea.appendChild(loadingContainer);


         // --- Create Iframe ---
         const iframe = document.createElement('iframe');
         iframe.src = projectUrl;
         iframe.style.width = '100%';
         iframe.style.height = 'calc(100vh - 100px)'; // Adjust height as needed
         iframe.style.border = 'none';
         iframe.style.display = 'block';
         iframe.style.visibility = 'hidden'; // Hide iframe initially
         iframe.style.marginTop = '40px'; // Push below back button
         iframe.setAttribute('title', `Embedded project: ${projectTitle}`);
         iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
         iframe.setAttribute('loading', 'eager'); // Load iframe eagerly now

         iframe.onload = () => {
              console.log(`Iframe loaded: ${projectUrl}`);
              // Check if loader still exists before removing
              const loader = document.getElementById('iframe-loader');
              if (loader) loader.remove();
              iframe.style.visibility = 'visible'; // Show iframe
         };
         iframe.onerror = () => {
              console.error(`Iframe failed to load: ${projectUrl}. Possible X-Frame-Options or CSP issue.`);
              const loader = document.getElementById('iframe-loader');
              if (loader) { // Update text within spinner container if it exists
                    loader.innerHTML = `<p class="text-red-500">Error: Could not load project (${projectTitle}). It might not allow embedding.</p>`;
              }
         };

         currentMainContentArea.appendChild(iframe);

         // --- Update History ---
         const iframeViewPath = `project-${projectId}`; // Use relative path based on ID
         const iframeTitle = `${projectTitle} | Envoy's Links`;
         document.title = iframeTitle;
         // **FIX:** Check against relative path for replaceState condition
         const currentRelativePath = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
         if (currentRelativePath === iframeViewPath) {
              console.log("LoadProjectIframe: Already on this iframe view, replacing state instead of pushing.");
              window.history.replaceState({ path: iframeViewPath, isIframe: true, iframeSrc: projectUrl }, iframeTitle, iframeViewPath);
         } else {
              console.log(`LoadProjectIframe: Pushing history state for iframe view: ${iframeViewPath}`);
              window.history.pushState({ path: iframeViewPath, isIframe: true, iframeSrc: projectUrl }, iframeTitle, iframeViewPath);
         }
    }


    // --- Global Event Listeners ---

    // Click listener ONLY handles 'internal-link' for SPA
    document.addEventListener('click', (event) => {
        // (Listener logic remains the same - only handles internal SPA links)
        const link = event.target.closest('a.internal-link');

        if (link) {
            if (link.closest('.card')) return;
            if (link.closest('#menu') && link.closest('li')?.hasAttribute('data-target-card')) return;

            console.log(`Global Click: Found 'a.internal-link' for SPA navigation:`, link);
            event.preventDefault();
            event.stopPropagation();

            const url = link.getAttribute('href');
            if (!url || url === '#') {
                 console.warn("Global Click (SPA): Internal link has invalid href:", url);
                 return;
            }

            const absoluteUrl = new URL(url, window.location.origin).href;
            if (absoluteUrl !== window.location.href) {
                 console.log(`Global Click (SPA): Intercepted internal link to: ${url}. Calling loadContent.`);
                 if (typeof App.Menu?.close === 'function') App.Menu.close();
                 App.loadContent(url)
                    .then(() => console.log(`Global Click (SPA): loadContent for ${url} completed.`))
                    .catch(err => console.error("Global Click (SPA): Error during content load:", err));
            } else {
                 console.log(`Global Click (SPA): Already on page ${url}. Closing menu.`);
                 if (typeof App.Menu?.close === 'function') App.Menu.close();
            }
        }
    });


    // Browser Back/Forward Listener (Handles SPA and iframe states)
    window.addEventListener('popstate', (event) => {
        // (Listener logic remains the same - uses HOME_PAGE_FILENAME)
        const state = event.state;
        console.log("Popstate event:", state);

        const homeRelativeUrl = HOME_PAGE_FILENAME; // Use filename for loading

        if (state) {
            if (state.isIframe) {
                console.log(`Popstate: Detected iframe state, loading homepage: ${homeRelativeUrl}`);
                App.loadContent(homeRelativeUrl, true)
                   .catch(err => console.error("Popstate: Error loading homepage from iframe state:", err));
            } else if (state.path) {
                console.log(`Popstate: Navigating to internal state path: ${state.path}`);
                 const relativePath = state.path.startsWith('/') ? state.path.substring(1) : state.path;
                App.loadContent(relativePath, true)
                   .catch(err => console.error("Popstate: Error loading internal content:", err));
            } else {
                 console.log(`Popstate: State exists but unrecognized structure, loading homepage: ${homeRelativeUrl}`);
                 App.loadContent(homeRelativeUrl, true).catch(err => console.error("Popstate: Error loading homepage from unrecognized state:", err));
            }
        } else {
             console.log(`Popstate: No state found, navigating to fallback: ${homeRelativeUrl}`);
             const currentPath = window.location.pathname; // Get full path
             // **FIX:** Check against filename and deployed path
             if (!currentPath.endsWith(homeRelativeUrl) && currentPath !== HOME_PAGE_PATH && currentPath !== '/') {
                  App.loadContent(homeRelativeUrl, true).catch(err => console.error("Popstate: Error loading homepage from no state:", err));
             } else {
                  console.log("Popstate: Already on homepage, doing nothing.");
                  if (document.querySelector('.carousel-container') && !animationFrameId) {
                       requestAnimationFrame(initializeCarousel);
                  }
             }
        }
    });

    // Debounced Resize Handler
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log("Resize: Window resized, recalculating layout...");
            stopCarouselAnimation();
            const currentCarouselContainer = document.querySelector('.carousel-container');
            if (currentCarouselContainer) {
                 console.log("Resize: Carousel found, re-initializing...");
                 requestAnimationFrame(() => {
                      const carouselInitialized = initializeCarousel();
                      if (!carouselInitialized) {
                           console.error("Resize: Failed to re-initialize carousel after resize.");
                      } else {
                           console.log("Resize: Carousel re-initialized.");
                      }
                 });
            } else {
                 console.log("Resize: No carousel currently displayed.");
            }
        }, 250);
     }


    // Attach Global Listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    console.log("links_page.js: Global event listeners attached.");


    // --- Initial Page Setup ---
    console.log("links_page.js: Performing initial setup...");
    const initialPath = HOME_PAGE_FILENAME; // Use filename for initial state path
    window.history.replaceState({ path: initialPath }, document.title, window.location.href);
    console.log(`links_page.js: Initial history state set for path: ${initialPath}`);

    // Use requestAnimationFrame for initial setup to ensure DOM is fully ready
    requestAnimationFrame(() => {
        console.log("links_page.js: Running initial setup inside requestAnimationFrame...");

        // **FIX:** More robust check for homepage, accounting for path variations
        const currentPagePath = window.location.pathname;
        const isCurrentPageHome = currentPagePath === '/' || currentPagePath === HOME_PAGE_PATH || currentPagePath.endsWith('/' + HOME_PAGE_FILENAME);
        console.log(`links_page.js: Current path: ${currentPagePath}, Is homepage? ${isCurrentPageHome}`);

        let carouselInitPromise = Promise.resolve(true); // Assume success unless proven otherwise

        if (isCurrentPageHome) {
             const carouselContainer = document.querySelector('.carousel-container');
             if (carouselContainer) {
                  console.log("links_page.js: Initializing carousel on homepage load...");
                  carouselInitPromise = new Promise(resolveInit => {
                       // Add slight delay before initializing carousel on first load
                       setTimeout(() => {
                            const success = initializeCarousel();
                            resolveInit(success);
                       }, 50); // Small delay (50ms)
                  });
             } else {
                  console.log("links_page.js: Homepage loaded, but no carousel container found.");
             }
        } else {
             console.log("links_page.js: Not on homepage, skipping initial carousel load.");
        }

        // Initialize Menu *after* carousel attempt finishes
        carouselInitPromise.then((carouselSuccess) => {
             if (carouselSuccess === false) {
                  console.warn("links_page.js: Carousel initialization may have failed, proceeding with Menu init anyway.");
             }
             // **FIX:** Ensure Menu init is called correctly
             if (typeof App.Menu?.init === 'function') {
                  console.log("links_page.js: Calling App.Menu.init()...");
                  App.Menu.init(); // Initialize menu
             } else {
                  console.error("links_page.js: App.Menu.init not found!");
             }

             // **FIX:** Hide initial loader AFTER both init attempts
             if (initialLoader) {
                  console.log("links_page.js: Hiding initial page loader.");
                  initialLoader.style.display = 'none';
             }

        }).catch(error => {
             console.error("links_page.js: Error during carousel initialization promise:", error);
             // Still try to initialize menu and hide loader even if carousel promise fails
             if (typeof App.Menu?.init === 'function') { App.Menu.init(); }
             if (initialLoader) { initialLoader.style.display = 'none'; }
        });


        // Initialize Background Script (if applicable)
        if (typeof App.Background?.init === 'function') { App.Background.init(); }

        console.log("links_page.js: Initial setup complete (async part scheduled).");
    }); // End requestAnimationFrame

}); // End DOMContentLoaded
