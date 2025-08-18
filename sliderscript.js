// Get the swiper-container element
const swiperContainer = document.querySelector('.swiper-container');
// Get the swiper-wrapper element where slides will be injected
const swiperWrapper = document.querySelector('.swiper-wrapper');

// Store slider instance globally
let mainSlider = null;
let slidesDataCache = null; // To store fetched slides data

// Function to create a single Swiper slide DOM element
function createSlide(slideData) {
    const pattern1 = 'assets/images/main-slider/pattern-1.png';
    const pattern2 = 'assets/images/main-slider/pattern-2.png';
    const pattern4 = 'assets/images/main-slider/pattern-4.png';

    const slideElement = document.createElement('div');
    slideElement.classList.add('swiper-slide');

    slideElement.innerHTML = `
        <div class="slider-one_pattern" style="background-image:url(${pattern1}) style="padding-bottom: 20px;"></div>
        <div class="slider-one_pattern-two" style="background-image:url(${pattern2})"></div>
        <div class="slider-one_pattern-four" style="background-image:url(${pattern4})"></div>
        <div class="auto-container">
            <div class="row clearfix flex flex-col md:flex-row items-center justify-between">
                <div class="slider-one_image flex-1 md:w-1/2 lg:w-2/5">
                   
                    <div class="slider-one_percentage">
                        <i class="fa-solid fa-arrow-up fa-fw"></i>
                        <div class="slider-one_percent">${slideData.percentageValue}<sub>%</sub></div>
                        <div class="slider-one_percentage-text">Funded</div>
                    </div>
                    <img src="${slideData.imageName}" alt="Slider image" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found';" class="rounded-xl shadow-lg"/>
                </div>
                <div class="slider-one_content flex-1 md:w-1/2 lg:w-3/5 text-center md:text-left">
                    <h1 class="slider-one_heading">${slideData.title}</h1>
                    <div class="slider-one_content-inner">
                        <div class="slider-one_text">${slideData.text}</div>
                        <div class="slider-one_button d-flex align-items-center flex-wrap justify-center md:justify-start">
                        <h5 class="slider-one_author-name" style="margin-top:-0px">${slideData.authorName}</h5>
                            
                        <a href="${slideData.buttonLink}" class="template-btn btn-style-one rounded-lg">
                                <span class="btn-wrap">
                                    <span class="text-one" style="width: 100px;">Learn More</span>
                                    <span class="text-two" style="width: 100px;">On Kickstart</span>
                                </span>
                            </a>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return slideElement;
}

// Function to populate the DOM with slides (runs only once)
function populateSwiperSlides(slides) {
    if (!swiperWrapper) {
        console.error('Swiper wrapper not found for populating slides.');
        return;
    }

    if (swiperWrapper.children.length === 0) { // Only add if empty
        console.log('Populating swiper slides...');
        slides.forEach(slideData => {
            const slide = createSlide(slideData);
            swiperWrapper.appendChild(slide);
        });
        console.log('Slides populated successfully.');
    } else {
        console.log('Swiper wrapper already contains slides. Skipping re-population.');
    }
}

// Function to initialize the Swiper instance
function initializeSwiperInstance() {
    if (typeof Swiper === 'undefined') {
        console.error("Swiper library not loaded. Cannot initialize Swiper instance.");
        return;
    }

    if (!swiperContainer || !swiperWrapper || swiperWrapper.children.length === 0) {
        console.warn('Swiper container or slides not ready for initialization.');
        return; // Don't try to initialize if elements aren't there
    }

    // Crucial check: Is the container visible and has dimensions?
    // If display: none, offsetWidth will be 0.
    if (swiperContainer.offsetWidth === 0 || swiperContainer.offsetHeight === 0) {
        console.warn('Swiper container has zero dimensions. Deferring initialization.');
        // This is a very common scenario for elements in tabs/modals
        // If this happens, you need a way to call initializeSwiperInstance()
        // when the container becomes visible.
        return;
    }

    // Destroy existing slider if it exists to prevent multiple instances
    if (mainSlider) {
        console.log('Destroying existing Swiper instance before re-initialization.');
        mainSlider.destroy(true, true);
        mainSlider = null;
    }

    console.log('Initializing new Swiper instance...');
    mainSlider = new Swiper(swiperContainer, {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        speed: 1000,
        autoplay: {
            delay: 7000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        // IMPORTANT for dynamic content and responsiveness:
        observer: true,           // Reacts to changes in the Swiper container's DOM
        observeParents: true,     // Reacts to changes in parent elements' DOM
        preloadImages: true,      // Ensures images are loaded before layout calculation
        updateOnImagesReady: true // Recalculates Swiper when all images are loaded
        // autoHeight: true,      // Uncomment if slide heights vary significantly and affect layout
    });
    console.log('Swiper instance initialized:', mainSlider);
}

// Async function to fetch slider data, populate slides, and then initialize Swiper
async function fetchAndSetupSlider() {
    // If slides are already populated, don't re-fetch data or re-populate DOM.
    if (swiperWrapper && swiperWrapper.children.length > 0 && mainSlider) {
        console.log('Slider content already present and Swiper initialized. Skipping re-fetch and re-population.');
        return;
    }

    if (!slidesDataCache) { // Only fetch if not already cached
        try {
            console.log('Fetching slider data...');
            const response = await fetch('slider_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const sliderData = await response.json();
            slidesDataCache = sliderData.allSlidesData; // Cache the data
            populateSwiperSlides(slidesDataCache); // Populate DOM only after fetch
        } catch (error) {
            console.error('Error fetching slider data:', error);
            if (swiperWrapper) {
                swiperWrapper.innerHTML = '<div class="text-red-500 text-center p-4">Failed to load slider content.</div>';
            }
            return; // Exit if data fetching failed
        }
    } else {
        // If data is cached but slides aren't populated (e.g., first attempt failed to populate)
        populateSwiperSlides(slidesDataCache);
    }

    // Always attempt to initialize Swiper after slides are (re)populated or confirmed present
    initializeSwiperInstance();
}

// Initial load: Ensure DOM is ready, then fetch and setup
document.addEventListener('DOMContentLoaded', fetchAndSetupSlider);

// Resize handling: Swiper's observers should handle most cases.
// If you still see issues on resize, re-evaluate.
// No manual update() call is needed for Swiper 9+.
window.addEventListener('resize', () => {
    // A small debounce is still good practice for performance if you were to add
    // more complex logic here, but for just Swiper's internal observers, it's often not strictly necessary.
    // console.log('Window resized. Swiper observers should handle it.');
});