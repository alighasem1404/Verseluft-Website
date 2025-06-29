/**
 * Creates a single 'step-block_one' HTML element using a template literal.
 * This function dynamically generates the HTML structure for each step block,
 * using the class names exactly as provided in the user's original snippet.
 * @param {object} slideData - The data for the step block.
 * @param {string} slideData.stepText - The text for the step (e.g., "Black Cube Games", "step 02").
 * @param {string} slideData.title - The title of the step block.
 * @param {string} slideData.description - The description text.
 * @param {string} slideData.imageSrc - The source URL for the image.
 * @param {string} slideData.imageAlt - The alt text for the image.
 * @returns {HTMLElement} The created step block DOM element.
 */
function createStepBlock(slideData) {
    const stepBlock = document.createElement('div');
    // Apply the exact class from the user's original snippet for the outer step block
    stepBlock.classList.add('step-block_one');

    // Construct the inner HTML using a template literal, adhering to original class names.
    // Specific IDs for the first block will be assigned in renderHtmlStructure after creation.
    stepBlock.innerHTML = `
        <div class="step-block_one-inner">
            <div class="step-block_one-steps">${slideData.stepText}</div>
            <h5 class="step-block_one-title">${slideData.title}</h5>
            <div class="step-block_one-text">${slideData.description}</div>
            <div class="step-block_one-content">
                <div class="image">
                    <!-- Image tag with responsive Tailwind classes and error fallback -->
                    <img src="${slideData.imageSrc}" alt="${slideData.imageAlt}" 
                         class="w-full h-auto rounded-lg object-cover" 
                         onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/333333?text=Image+Error';">
                </div>
            </div>
        </div>
    `;
    return stepBlock;
}

/**
 * Renders the entire HTML structure into the content container by fetching data from a JSON file.
 * This function orchestrates the creation and appending of all step blocks.
 */
async function renderHtmlStructure() {
    // The main container where content will be injected.
    // It's assumed this div exists in the HTML with id="next_projects".
    const contentContainer = document.getElementById('next_projects');
    if (!contentContainer) {
        console.error("Content container with ID 'next_projects' not found.");
        return;
    }

    // Clear any existing content and show a loading message
    contentContainer.innerHTML = '<p class="text-center text-gray-600 py-8">Loading project data...</p>';

    let projectData;
    try {
        // Fetch data from the nextProjectsData.json file
        const response = await fetch('nextProjectsData.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        projectData = await response.json();

        // Validate the fetched data structure
        if (typeof projectData !== 'object' || projectData === null || 
            !projectData.block1 || !projectData.block2 || !projectData.block3) {
            throw new Error("Invalid or insufficient data in nextProjectsData.json. Expected an object with 'block1', 'block2', and 'block3' properties.");
        }

    } catch (error) {
        console.error('Error fetching or parsing project data:', error);
        contentContainer.innerHTML = '<p class="text-center text-red-600 py-8">Failed to load project data. Please ensure "nextProjectsData.json" exists and is correctly formatted with ' + 
                                     'properties like "block1", "block2", and "block3".</p>';
        return; // Exit if data fetching or parsing failed
    }

    // Create the main row container with responsive Tailwind flexbox classes.
    // These classes are for overall layout and responsiveness, not part of the individual step block's internal structure.
    const rowClearfix = document.createElement('div');
    rowClearfix.classList.add('row', 'clearfix', 'flex', 'flex-wrap', '-mx-4', 'justify-center');

    // Get data for the three step blocks from the fetched JSON
    const block1Data = projectData.block1;
    const block2Data = projectData.block2;
    const block3Data = projectData.block3;

    // Create the first column for the first step block
    const column1 = document.createElement('div');
    // Apply the original column classes from the user's snippet, along with Tailwind for responsiveness.
    column1.classList.add('column', 'col-lg-6', 'col-md-12', 'col-sm-12', 'px-4', 'mb-8', 'w-full', 'lg:w-1/2');
    const stepBlock1 = createStepBlock(block1Data); // Create the step block using the generic function
    column1.appendChild(stepBlock1);

    // Manually assign the specific IDs to elements within the first block,
    // as these IDs are unique to this block and not passed via JSON.
    const block1Steps = stepBlock1.querySelector('.step-block_one-steps');
    if (block1Steps) block1Steps.id = 'creator_name';

    const block1Title = stepBlock1.querySelector('.step-block_one-title');
    if (block1Title) block1Title.id = 'next_project_title';
    
    const block1Description = stepBlock1.querySelector('.step-block_one-text');
    if (block1Description) block1Description.id = 'next_project_description';

    // Create the second column for the remaining two step blocks
    const column2 = document.createElement('div');
    // Apply the original column classes from the user's snippet, along with Tailwind for responsiveness.
    column2.classList.add('column', 'col-lg-6', 'col-md-12', 'col-sm-12', 'px-4', 'w-full', 'lg:w-1/2');
    
    const stepBlock2 = createStepBlock(block2Data);
    const stepBlock3 = createStepBlock(block3Data);
    
    // Remove the 'mb-8' (margin-bottom) class from the last step block to avoid extra space
    // if it's the final element in its column. This class is added by createStepBlock by default.
    stepBlock3.classList.remove('mb-8'); 

    column2.appendChild(stepBlock2);
    column2.appendChild(stepBlock3);

    // Append both columns to the main row
    rowClearfix.appendChild(column1);
    rowClearfix.appendChild(column2);

    // Clear the loading message and append the newly created structure
    contentContainer.innerHTML = '';
    contentContainer.appendChild(rowClearfix);
}

// Ensure the DOM is fully loaded before attempting to render the HTML structure.
document.addEventListener('DOMContentLoaded', renderHtmlStructure);
