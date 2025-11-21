// Render functions for cards and table rows from JSON data

// Render a single card (for activities, museums, sightseeing)
function renderCard(entry) {
    // Build tags HTML
    const tagsHtml = entry.tags.map(tag => 
        `<span class="tag text-tag">${escapeHtml(tag)}</span>`
    ).join('\n              ');
    
    // Build image credit HTML
    let imageCreditHtml = '';
    if (entry.imageCredit) {
        if (entry.imageCreditUrl) {
            imageCreditHtml = `Image courtesy of <a href="${entry.imageCreditUrl}">${escapeHtml(entry.imageCredit)}</a>.`;
        } else {
            imageCreditHtml = `Image courtesy of ${escapeHtml(entry.imageCredit)}.`;
        }
    }
    
    // Build description HTML (preserve HTML links if they exist in the description)
    // Description can contain HTML, so we don't escape it
    const descriptionHtml = entry.description || '';
    
    // Build title with optional link
    let titleHtml = escapeHtml(entry.title);
    if (entry.url) {
        titleHtml = `<a href="${entry.url}">${titleHtml}</a>`;
    }
    
    return `
          <article class="card" data-status="${entry.status}">
              <div class="card__surface">
              <div class="card__tags">
              ${tagsHtml}
              </div>
                  <h2 class="card__title text-title"> ${titleHtml} </h2>
              <figure class="card__media">
                  <img src="${entry.image}" alt="${escapeHtml(entry.imageAlt || '')}">
                  ${imageCreditHtml ? `<figcaption class="card__credit text-note">${imageCreditHtml}</figcaption>` : ''}
              </figure>
              <div class="card__body text-body">
                  <p>${descriptionHtml}</p>
              </div>
              </div>
          </article>`;
}

// Render a single table row (for workspots)
function renderTableRow(entry) {
    const nameHtml = entry.url ? 
        `<a href="${entry.url}">${escapeHtml(entry.name)}</a>` : 
        escapeHtml(entry.name);
    
    const locationHtml = entry.locationUrl ? 
        `<a href="${entry.locationUrl}">${escapeHtml(entry.location)}</a>` : 
        escapeHtml(entry.location);
    
    // Format hours (preserve <br> tags if they exist)
    const hoursHtml = entry.hours || '';
    
    return `
                    <tr data-status="${entry.status}" class="text-body">
                        <th scope="row">${nameHtml}</th>
                        <td>${escapeHtml(entry.borough || entry.location)}</td>
                        <td>${locationHtml}</td>
                        <td>${hoursHtml}</td>
                        <td>${escapeHtml(entry.wifi || '')}</td>
                        <td>${escapeHtml(entry.type || '')}</td>
                        <td><span class="status">${escapeHtml(entry.status)}</span></td>
                    </tr>`;
}

// Render all cards from JSON data
async function renderCards(containerSelector, data) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    if (!data || !data.entries || data.entries.length === 0) {
        container.classList.remove('loading');
        container.classList.add('loaded');
        return;
    }
    
    // Mark as loading
    container.classList.add('loading');
    container.classList.remove('loaded');
    
    const cardsHtml = data.entries.map(entry => renderCard(entry)).join('\n');
    container.innerHTML = cardsHtml;
    
    // Wait for all images to load before showing content
    await waitForImages(container);
    
    // Mark as loaded and show content
    container.classList.remove('loading');
    container.classList.add('loaded');
}

// Render all table rows from JSON data
async function renderTableRows(containerSelector, data) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    if (!data || !data.entries || data.entries.length === 0) {
        container.classList.remove('loading');
        container.classList.add('loaded');
        return;
    }
    
    // Mark as loading
    container.classList.add('loading');
    container.classList.remove('loaded');
    
    const rowsHtml = data.entries.map(entry => renderTableRow(entry)).join('\n');
    container.innerHTML = rowsHtml;
    
    // Wait for any images (if any) to load before showing content
    await waitForImages(container);
    
    // Mark as loaded and show content
    container.classList.remove('loading');
    container.classList.add('loaded');
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Wait for all images in a container to load
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    if (images.length === 0) {
        return Promise.resolve();
    }
    
    // Create promises for each image
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to prevent hanging
            // Timeout after 5 seconds to prevent infinite waiting
            setTimeout(resolve, 5000);
        });
    });
    
    return Promise.all(imagePromises);
}

// Extract location attributes from cards and table rows (needed for filtering)
function extractLocationAttributes() {
    // Extract location from tags and add data-location attribute to cards
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        const tags = card.querySelectorAll('.card__tags .tag');
        tags.forEach(tag => {
            const tagText = tag.textContent.trim().toLowerCase();
            // Check if it's a location tag (not status tags like to-try or loved)
            if (tagText !== 'to-try' && 
                tagText !== 'loved' && 
                tagText !== 'to-do') {
                // Use as location
                if (tagText) {
                    card.setAttribute('data-location', tagText);
                }
            }
        });
    });
    
    // Extract location from borough column and add data-location attribute to table rows
    const allTableRows = document.querySelectorAll('tr[data-status]');
    allTableRows.forEach(row => {
        // Find the borough column (first td after the th scope="row")
        const cells = row.querySelectorAll('td');
        const boroughCell = cells[0];
        if (boroughCell) {
            const boroughText = boroughCell.textContent.trim().toLowerCase();
            // Normalize borough names to match filter values
            let location = boroughText;
            if (boroughText === 'the bronx' || boroughText === 'bronx') {
                location = 'the bronx';
            }
            if (location) {
                row.setAttribute('data-location', location);
            }
        }
    });
}

// Load and render data from JSON file
async function loadAndRender(pageType) {
    let dataFile, renderFunction, containerSelector;
    
    switch(pageType) {
        case 'activities':
            dataFile = 'data/activities.json';
            renderFunction = renderCards;
            containerSelector = '.cards';
            break;
        case 'museums':
            dataFile = 'data/museums.json';
            renderFunction = renderCards;
            containerSelector = '.cards';
            break;
        case 'sightseeing':
            dataFile = 'data/sightseeing.json';
            renderFunction = renderCards;
            containerSelector = '.cards';
            break;
        case 'workspots':
            dataFile = 'data/workspots.json';
            renderFunction = renderTableRows;
            containerSelector = '.work-table tbody';
            break;
        default:
            console.error('Unknown page type:', pageType);
            return;
    }
    
    // Show loading spinner
    const container = document.querySelector(containerSelector);
    let spinner = null;
    
    if (container) {
        // For tables, look for spinner relative to the table
        // For cards, look relative to the container
        const searchParent = containerSelector === '.work-table tbody' 
            ? container.closest('.work-table')?.parentElement 
            : container.parentElement;
        
        spinner = searchParent?.querySelector('.loading-spinner');
        
        if (!spinner && searchParent) {
            // Create spinner if it doesn't exist
            spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            
            // For tables, place after the table
            // For cards, place before the container
            if (containerSelector === '.work-table tbody') {
                const table = container.closest('.work-table');
                if (table && table.parentElement) {
                    table.parentElement.insertBefore(spinner, table.nextSibling);
                }
            } else {
                searchParent.insertBefore(spinner, container);
            }
        }
    }
    
    if (spinner) {
        spinner.classList.remove('hidden');
    }
    
    // Mark container as loading initially
    if (container) {
        container.classList.add('loading');
        container.classList.remove('loaded');
    }
    
    try {
        const response = await fetch(dataFile);
        if (!response.ok) {
            throw new Error(`Failed to load ${dataFile}`);
        }
        const data = await response.json();
        
        // Render content (this will wait for images)
        await renderFunction(containerSelector, data);
        
        // Extract location attributes from newly rendered cards/rows
        extractLocationAttributes();
        
        // Hide loading spinner
        if (spinner) {
            spinner.classList.add('hidden');
        }
        
        // Dispatch custom event to trigger filter initialization
        setTimeout(() => {
            const event = new CustomEvent('entriesRendered', { detail: { pageType } });
            document.dispatchEvent(event);
            // Also call filterItems directly if it exists
            if (typeof window.filterItems === 'function') {
                window.filterItems();
            }
        }, 100);
    } catch (error) {
        console.error('Error loading data:', error);
        // Hide loading spinner on error
        if (spinner) {
            spinner.classList.add('hidden');
        }
        // Show content even on error (might be empty)
        if (container) {
            container.classList.remove('loading');
            container.classList.add('loaded');
        }
    }
}

