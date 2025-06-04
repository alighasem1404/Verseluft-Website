// Get the swiper-wrapper element where slides will be injected
// Corrected: Using querySelector to target the element by its class 'swiper-wrapper'
const swiperWrapper = document.querySelector('.swiper-wrapper');

// Function to create a single Swiper slide DOM element
function createSlide(slideData) {
    // IMPORTANT: These pattern image URLs refer to local assets.
    // They are set to the original paths provided in your HTML.
    // For this preview environment, these images will not load unless they are served from a web server.
    // If you are running this code locally, ensure these image files exist at the specified paths.
    const pattern1 = 'assets/images/main-slider/pattern-1.png';
    const pattern2 = 'assets/images/main-slider/pattern-2.png';
    const pattern4 = 'assets/images/main-slider/pattern-4.png';

    const slideElement = document.createElement('div');
    slideElement.classList.add('swiper-slide'); // Add the swiper-slide class

    slideElement.innerHTML = `
        <div class="slider-one_pattern" style="background-image:url(${pattern1})"></div>
        <div class="slider-one_pattern-two" style="background-image:url(${pattern2})"></div>
        <div class="slider-one_pattern-four" style="background-image:url(${pattern4})"></div>
        <div class="auto-container">
            <div class="row clearfix flex flex-col md:flex-row items-center justify-between">

                <!-- Image Column - Placed FIRST to ensure it's above content on mobile and left on desktop -->
                <div class="slider-one_image flex-1 md:w-1/2 lg:w-2/5">
                    <div class="slider-one_percentage">
                        <i class="fa-solid fa-arrow-up fa-fw"></i>
                        <div class="slider-one_percent">${slideData.percentageValue}<sub>%</sub></div>
                        <div class="slider-one_percentage-text">efficiency</div>
                    </div>
                    <img src="${slideData.imageName}" alt="Slider image" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found';" class="rounded-xl shadow-lg"/>
                </div>

                <!-- Content Column - Placed SECOND -->
                <div class="slider-one_content flex-1 md:w-1/2 lg:w-3/5 text-center md:text-left">
                    <h1 class="slider-one_heading">${slideData.title}</h1>
                    <div class="slider-one_content-inner">
                        <div class="slider-one_text">${slideData.text}</div>
                        <div class="slider-one_button d-flex align-items-center flex-wrap justify-center md:justify-start">
                            <a href="${slideData.buttonLink}" class="template-btn btn-style-one rounded-lg">
                                <span class="btn-wrap">
                                    <span class="text-one" style="width: 100px;">Learn More</span>
                                    <span class="text-two" style="width: 100px;">On Kickstart</span>
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Author Column - Placed THIRD, outside content div, as per original HTML -->
                <div class="slider-one_author mt-4 md:mt-0 w-full flex justify-center md:justify-start">
                    <i><img src="${slideData.authorIcon}" alt="${slideData.authorName} icon" onerror="this.onerror=null;this.src='https://placehold.co/50x50/000000/FFFFFF?text=Icon';" class="rounded-full shadow-md"/></i>
                    <h5 class="slider-one_author-name">${slideData.authorName}</h5>
                </div>
            </div>
        </div>
    `;
    return slideElement;
}

// Function to initialize the slider with fetched slides
function initializeSlider(slides) {
    // Re-select swiperWrapper inside this function to ensure it's available when called
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    console.log('Swiper wrapper element:', swiperWrapper);

    if (swiperWrapper) {
        // Clear existing content to prevent duplicates on re-initialization
        swiperWrapper.innerHTML = '';

        // Add all slides by creating DOM elements and appending them
        slides.forEach(slideData => {
            const slide = createSlide(slideData);
            swiperWrapper.appendChild(slide);
        });
        console.log('Slides added successfully');

        // Initialize the Swiper instance after adding content
        // Ensure the Swiper library is loaded before attempting to initialize
        if (typeof Swiper !== 'undefined') {
            const mainSlider = new Swiper('.swiper-container', {
                slidesPerView: 1,
                spaceBetween: 0,
                effect: 'fade', // Smooth fade transition between slides
                speed: 1000, // Transition speed in milliseconds
                autoplay: {
                    delay: 7000, // Time between slide transitions in milliseconds
                    disableOnInteraction: false, // Autoplay continues even if user interacts with slider
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
            console.log('Slider initialized');
        } else {
            console.error("Swiper library not loaded. Please ensure 'swiper-bundle.min.js' is correctly linked.");
        }
    } else {
        console.error('Swiper wrapper not found. Make sure the HTML structure exists and the script runs after DOM load.');
    }
}

// Async function to fetch slider data and then initialize the slider
async function fetchAndInitializeSlider() {
    try {
        // Fetch the slider_data.json file from the same directory
        const response = await fetch('slider_data.json');
        if (!response.ok) {
            // Throw an error if the HTTP response status is not OK (e.g., 404, 500)
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON response into a JavaScript object
        const sliderData = await response.json();

        // Call the initializeSlider function with the fetched array of slide data
        initializeSlider(sliderData.allSlidesData);

    } catch (error) {
        // Log any errors that occur during fetching or parsing
        console.error('Error fetching or parsing slider data:', error);
        // Display a user-friendly message on the page if the slider cannot be loaded
        // Ensure swiperWrapper is accessed after it's potentially found by querySelector
        const currentSwiperWrapper = document.querySelector('.swiper-wrapper');
        if (currentSwiperWrapper) {
            currentSwiperWrapper.innerHTML = '<div class="text-red-500 text-center p-4">Failed to load slider content. Please try again later.</div>';
        }
    }
}

// Call the main function to fetch data and initialize the slider when the window loads
window.onload = fetchAndInitializeSlider;
