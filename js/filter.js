// Filtering functionality
// Filters cards and table rows based on data-status and data-location attributes

// Function to initialize filters (can be called multiple times)
function initializeFilters() {
    // Re-query for cards and rows (they may be loaded dynamically)
    const allCards = document.querySelectorAll('.card');
    const allTableRows = document.querySelectorAll('tr[data-status]');
    
    // Extract location from tags and add data-location attribute to cards
    allCards.forEach(card => {
        // Only process if location not already set
        if (!card.hasAttribute('data-location')) {
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
        }
    });
    
    // Extract location from borough column and add data-location attribute to table rows
    allTableRows.forEach(row => {
        // Only process if location not already set
        if (!row.hasAttribute('data-location')) {
            // Find the borough column (second td after the th scope="row")
            const cells = row.querySelectorAll('td');
            // Borough is the first td (index 0) since name is th[scope="row"]
            const boroughCell = cells[0];
            if (boroughCell) {
                const boroughText = boroughCell.textContent.trim().toLowerCase();
                // Normalize borough names to match filter values
                let location = boroughText;
                // Map common borough names to location values
                if (boroughText === 'manhattan') {
                    location = 'manhattan';
                } else if (boroughText === 'brooklyn') {
                    location = 'brooklyn';
                } else if (boroughText === 'queens') {
                    location = 'queens';
                } else if (boroughText === 'the bronx' || boroughText === 'bronx') {
                    location = 'the bronx';
                }
                
                if (location) {
                    row.setAttribute('data-location', location);
                }
            }
        }
    });
    
    // Get custom dropdowns (status + location pill dropdowns)
    const customDropdowns = document.querySelectorAll('.custom-dropdown');
    
    // If no items to filter, exit early
    if (allCards.length === 0 && allTableRows.length === 0) {
        return;
    }
    
    // Get empty state message elements
    const emptyStateMessages = document.querySelectorAll('.empty-state-message');
    const cardsContainer = document.querySelector('.cards');
    const tableContainer = document.querySelector('.work-table');
    
    // Custom dropdown functionality (status + location pill dropdowns)
    customDropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const activeFilterDisplay = dropdown.querySelector('.dropdown-active-filter');
        const menu = dropdown.querySelector('.dropdown-menu');
        const options = dropdown.querySelectorAll('.dropdown-option');
        const hiddenSelect = dropdown.querySelector('.location-select, .status-select');
        
        // Toggle dropdown on trigger click or active filter box click
        const toggleDropdown = function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        };
        
        if (trigger) {
            trigger.addEventListener('click', toggleDropdown);
        }
        if (activeFilterDisplay) {
            activeFilterDisplay.addEventListener('click', toggleDropdown);
        }
        
        // Handle option selection
        options.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = this.dataset.value;
                const text = this.textContent.trim();
                
                // Update hidden select
                if (hiddenSelect) {
                    hiddenSelect.value = value;
                }
                
                // Update active filter display box
                if (activeFilterDisplay) {
                    const filterText = activeFilterDisplay.querySelector('.filter-text');
                    if (filterText) {
                        filterText.textContent = text;
                    } else {
                        activeFilterDisplay.textContent = text;
                    }
                }
                
                // Remove active from all options
                options.forEach(opt => opt.classList.remove('active'));
                // Add active to selected option
                this.classList.add('active');
                
                // Close dropdown
                dropdown.classList.remove('active');
                
                // Filter items
                filterItems();
            });
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        customDropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });
    
    // Filter function (re-queries for cards/rows each time to handle dynamic content)
    // Make it globally accessible so it can be called after dynamic content loads
    window.filterItems = function filterItems() {
        // Re-query for cards and rows (they may be loaded dynamically)
        const cardsToFilter = document.querySelectorAll('.card');
        const rowsToFilter = document.querySelectorAll('tr[data-status]');
        
        // Get active status from pill dropdown (status-select)
        const statusSelect = document.querySelector('.status-select');
        const activeStatusFilter = statusSelect ? statusSelect.value : 'all';
        
        // Get active location from pill dropdown (location-select)
        const locationSelect = document.querySelector('.location-select');
        const activeLocationFilter = locationSelect ? locationSelect.value : 'all';
        
        // If "all" is selected in locations, treat as no filter
        const hasLocationFilter = activeLocationFilter && activeLocationFilter !== 'all';
        
        let visibleCardCount = 0;
        let visibleRowCount = 0;
        
        // Filter cards
        cardsToFilter.forEach(card => {
            const cardStatus = card.getAttribute('data-status');
            const cardLocation = card.getAttribute('data-location');
            
            // Check status filter (mutually exclusive)
            let statusMatch = false;
            if (activeStatusFilter === 'all') {
                statusMatch = true;
            } else {
                statusMatch = activeStatusFilter === cardStatus;
            }
            
            // Check location filter (mutually exclusive - single select)
            let locationMatch = true;
            if (hasLocationFilter) {
                locationMatch = cardLocation && cardLocation === activeLocationFilter;
            }
            
            // Show card only if both filters match
            const shouldShow = statusMatch && locationMatch;
            card.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) {
                visibleCardCount++;
            }
        });
        
        // Filter table rows
        rowsToFilter.forEach(row => {
            const rowStatus = row.getAttribute('data-status');
            const rowLocation = row.getAttribute('data-location');
            
            // Check status filter (mutually exclusive)
            let statusMatch = false;
            if (activeStatusFilter === 'all') {
                statusMatch = true;
            } else {
                statusMatch = activeStatusFilter === rowStatus;
            }
            
            // Check location filter (mutually exclusive - single select)
            let locationMatch = true;
            if (hasLocationFilter) {
                locationMatch = rowLocation && rowLocation === activeLocationFilter;
            }
            
            // Show row only if both filters match
            const shouldShow = statusMatch && locationMatch;
            row.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) {
                visibleRowCount++;
            }
        });
        
        // Show/hide empty state message based on visible items
        const totalVisible = visibleCardCount + visibleRowCount;
        const hasVisibleItems = totalVisible > 0;
        
        emptyStateMessages.forEach(msg => {
            if (hasVisibleItems) {
                msg.classList.remove('visible');
            } else {
                msg.classList.add('visible');
            }
        });
        
        // Hide/show containers based on empty state
        if (cardsContainer) {
            if (hasVisibleItems && visibleCardCount > 0) {
                cardsContainer.style.display = '';
            } else if (visibleCardCount === 0 && allCards.length > 0) {
                cardsContainer.style.display = 'none';
            } else {
                cardsContainer.style.display = '';
            }
        }
        
        if (tableContainer) {
            if (hasVisibleItems && visibleRowCount > 0) {
                tableContainer.style.display = '';
            } else if (visibleRowCount === 0 && allTableRows.length > 0) {
                tableContainer.style.display = 'none';
            } else {
                tableContainer.style.display = '';
            }
        }
    }
    
    // Initialize: set "all" as default for all custom dropdowns (status + location)
    customDropdowns.forEach(dropdown => {
        const hiddenSelect = dropdown.querySelector('.location-select');
        const allOption = dropdown.querySelector('.dropdown-option[data-value="all"]');
        const activeFilterDisplay = dropdown.querySelector('.dropdown-active-filter');
        
        if (hiddenSelect) {
            hiddenSelect.value = 'all';
        }
        if (allOption) {
            allOption.classList.add('active');
            // Update active filter display box with "all"
            if (activeFilterDisplay && allOption.textContent) {
                const filterText = activeFilterDisplay.querySelector('.filter-text');
                if (filterText) {
                    filterText.textContent = allOption.textContent.trim();
                } else {
                    activeFilterDisplay.textContent = allOption.textContent.trim();
                }
            }
        }
    });
    
    // Initially show all items (only if cards/rows exist)
    const initialCards = document.querySelectorAll('.card');
    const initialRows = document.querySelectorAll('tr[data-status]');
    if (initialCards.length > 0 || initialRows.length > 0) {
        filterItems();
    }
}

// Initialize filters on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeFilters);

// Also initialize filters when entries are rendered dynamically
document.addEventListener('entriesRendered', function() {
    initializeFilters();
    setTimeout(function() {
        const cardsToFilter = document.querySelectorAll('.card');
        const rowsToFilter = document.querySelectorAll('tr[data-status]');
        if ((cardsToFilter.length > 0 || rowsToFilter.length > 0) && typeof window.filterItems === 'function') {
            window.filterItems();
        }
    }, 100);
});
