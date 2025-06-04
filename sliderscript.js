// Function to create a slide from data
        function createSlide(slideData) {
            // Create the main slide div
            const slideDiv = document.createElement('div');
            slideDiv.className = 'swiper-slide';

            // Create icon elements
            const iconDiv = document.createElement('div');
            iconDiv.className = 'slider-one_icon';
            iconDiv.style.backgroundImage = `url(${slideData.icons.main})`;

            const iconTwoDiv = document.createElement('div');
            iconTwoDiv.className = 'slider-one_icon-two';
            iconTwoDiv.style.backgroundImage = `url(${slideData.icons.secondary})`;

            // Create pattern elements
            const patternDiv = document.createElement('div');
            patternDiv.className = 'slider-one_pattern';
            patternDiv.style.backgroundImage = `url(${slideData.patterns.pattern1})`;

            const patternTwoDiv = document.createElement('div');
            patternTwoDiv.className = 'slider-one_pattern-two';
            patternTwoDiv.style.backgroundImage = `url(${slideData.patterns.pattern2})`;

            const patternFourDiv = document.createElement('div');
            patternFourDiv.className = 'slider-one_pattern-four';
            patternFourDiv.style.backgroundImage = `url(${slideData.patterns.pattern4})`;

            // Create container and row
            const containerDiv = document.createElement('div');
            containerDiv.className = 'auto-container';

            const rowDiv = document.createElement('div');
            rowDiv.className = 'row clearfix';

            // Create content column
            const contentColumn = document.createElement('div');
            contentColumn.className = 'slider-one_content col-lg-7 col-md-12 col-sm-12';

            const contentInner = document.createElement('div');
            contentInner.className = 'slider-one_content-inner';

            // Create title
            const titleDiv = document.createElement('div');
            titleDiv.className = 'slider-one_title';
            const titleIcon = document.createElement('i');
            const titleImg = document.createElement('img');
            titleImg.src = slideData.content.title.icon;
            titleImg.alt = '';
            titleIcon.appendChild(titleImg);
            titleDiv.appendChild(titleIcon);
            titleDiv.appendChild(document.createTextNode(` ${slideData.content.title.text}`));

            // Create heading
            const heading = document.createElement('h1');
            heading.className = 'slider-one_heading';
            heading.appendChild(document.createTextNode(`${slideData.content.heading.text} `));
            const span = document.createElement('span');
            span.textContent = slideData.content.heading.highlight;
            heading.appendChild(span);
            heading.appendChild(document.createTextNode(` ${slideData.content.heading.suffix}`));

            // Create text
            const textDiv = document.createElement('div');
            textDiv.className = 'slider-one_text';
            textDiv.textContent = slideData.content.description;

            // Create button and video container
            const buttonVideoDiv = document.createElement('div');
            buttonVideoDiv.className = 'slider-one_button d-flex align-items-center flex-wrap';

            // Create button
            const buttonLink = document.createElement('a');
            buttonLink.href = slideData.content.button.link;
            buttonLink.className = 'template-btn btn-style-one';

            const btnWrap = document.createElement('span');
            btnWrap.className = 'btn-wrap';

            const textOne = document.createElement('span');
            textOne.className = 'text-one';
            textOne.textContent = slideData.content.button.text;

            const textTwo = document.createElement('span');
            textTwo.className = 'text-two';
            textTwo.textContent = slideData.content.button.text;

            btnWrap.appendChild(textOne);
            btnWrap.appendChild(textTwo);
            buttonLink.appendChild(btnWrap);

            // Create video box
            const videoDiv = document.createElement('div');
            videoDiv.className = 'slider-one_video';

            const videoLink = document.createElement('a');
            videoLink.href = slideData.content.video.link;
            videoLink.className = 'lightbox-video play-box';

            const playIcon = document.createElement('span');
            playIcon.className = 'fa fa-play';
            videoLink.appendChild(playIcon);
            videoDiv.appendChild(videoLink);

            // Create image column
            const imageColumn = document.createElement('div');
            imageColumn.className = 'slider-one_image-column col-lg-5 col-md-12 col-sm-12';

            const patternThreeDiv = document.createElement('div');
            patternThreeDiv.className = 'slider-one_pattern-three';
            patternThreeDiv.style.backgroundImage = `url(${slideData.patterns.pattern3})`;

            const imageOuter = document.createElement('div');
            imageOuter.className = 'slider-one_image-outer';

            // Create author section
            const authorDiv = document.createElement('div');
            authorDiv.className = 'slider-one_author';
            const authorIcon = document.createElement('i');
            const authorImg = document.createElement('img');
            authorImg.src = slideData.image.author.icon;
            authorImg.alt = '';
            authorIcon.appendChild(authorImg);
            const authorName = document.createElement('h5');
            authorName.className = 'slider-one_author-name';
            authorName.textContent = slideData.image.author.name;
            const authorText = document.createElement('div');
            authorText.className = 'slider-one_author-text';
            authorText.textContent = slideData.image.author.text;
            authorDiv.appendChild(authorIcon);
            authorDiv.appendChild(authorName);
            authorDiv.appendChild(authorText);

            // Create percentage section
            const percentageDiv = document.createElement('div');
            percentageDiv.className = 'slider-one_percentage';
            const arrowIcon = document.createElement('i');
            arrowIcon.className = 'fa-solid fa-arrow-up fa-fw';
            const percentDiv = document.createElement('div');
            percentDiv.className = 'slider-one_percent';
            percentDiv.innerHTML = `${slideData.image.stats.percentage}<sub>%</sub>`;
            const percentText = document.createElement('div');
            percentText.className = 'slider-one_percentage-text';
            percentText.textContent = slideData.image.stats.text;
            percentageDiv.appendChild(arrowIcon);
            percentageDiv.appendChild(percentDiv);
            percentageDiv.appendChild(percentText);

            // Create main image
            const imageDiv = document.createElement('div');
            imageDiv.className = 'slider-one_image';
            const mainImage = document.createElement('img');
            mainImage.src = slideData.image.main;
            mainImage.alt = '';
            imageDiv.appendChild(mainImage);

            // Assemble all elements
            buttonVideoDiv.appendChild(buttonLink);
            buttonVideoDiv.appendChild(videoDiv);

            contentInner.appendChild(titleDiv);
            contentInner.appendChild(heading);
            contentInner.appendChild(textDiv);
            contentInner.appendChild(buttonVideoDiv);

            contentColumn.appendChild(contentInner);

            imageOuter.appendChild(authorDiv);
            imageOuter.appendChild(percentageDiv);
            imageOuter.appendChild(imageDiv);

            imageColumn.appendChild(patternThreeDiv);
            imageColumn.appendChild(imageOuter);

            rowDiv.appendChild(contentColumn);
            rowDiv.appendChild(imageColumn);

            containerDiv.appendChild(rowDiv);

            slideDiv.appendChild(iconDiv);
            slideDiv.appendChild(iconTwoDiv);
            slideDiv.appendChild(patternDiv);
            slideDiv.appendChild(patternTwoDiv);
            slideDiv.appendChild(patternFourDiv);
            slideDiv.appendChild(containerDiv);

            return slideDiv;
        }

        // Function to initialize the slider
        function initializeSlider(slides) {
            const swiperWrapper = document.querySelector('.swiper-wrapper');
            console.log('Swiper wrapper element:', swiperWrapper);
            
            if (swiperWrapper) {
                // Clear existing content
                swiperWrapper.innerHTML = '';
                
                // Add all slides
                slides.forEach(slideData => {
                    const slide = createSlide(slideData);
                    swiperWrapper.appendChild(slide);
                });
                console.log('Slides added successfully');

                
                
                // Initialize the slider after adding content
                const mainSlider = new Swiper('.main-slider', {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    effect: 'fade',
                    speed: 1000,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false,
                    },
                   
                });
                console.log('Slider initialized');
            } else {
                console.error('Swiper wrapper not found. Make sure the HTML structure exists and the script runs after DOM load.');
            }
        }

        // Load slider data and initialize
        async function loadSliderData() {
            try {
                const response = await fetch('slider-data.json');
                const data = await response.json();
                initializeSlider(data.slides);
            } catch (error) {
                console.error('Error loading slider data:', error);
            }
        }

        // Make sure the DOM is fully loaded before running the script
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadSliderData);
        } else {
            // DOM already loaded, run immediately
            loadSliderData();
        }