//const whitelist = ["Barcelona", "Catalonia", "Remote"];  // Add any other terms to whitelist
//const blacklist = ["Viewed", "Applied", "Saved", "Agoda", "myGwork", "Crossover", "Canonical", "RISK", "Revolut", "Growth", "Playrix", "Semrush"];    // Add any other terms to blacklist

// Function to apply transparency to all job items except the selected one
function applyEffectToJobs(whitelist, blacklist) {
    const jobItems = document.querySelectorAll('div[data-job-id]:not(.jobs-search-results-list__list-item--active)');

    jobItems.forEach(jobItem => {
        // TODO: Add a counter to show the saved jobs, and the total ones

        if (!meetsCriteria(jobItem, whitelist, blacklist))
            jobItem.style.opacity = '0.25';
        else
            jobItem.style.opacity = '1';
        /*
        {
            jobItem.style.height = '0px';
            jobItem.style.visibility = 'hidden';
        }*/
    });
}

// Define your criteria function (modify as needed)
function meetsCriteria(jobItem, whitelist, blacklist) {
    const content = jobItem.textContent || "";

    // Check if any whitelisted term is present
    const isWhitelisted = whitelist.some(term => content.includes(term));
    
    // Check if any blacklisted term is present
    const isBlacklisted = blacklist.some(term => content.includes(term));

    return isWhitelisted && !isBlacklisted;
}

// Load whitelist and blacklist from Chrome storage, then apply effect
function applyJobFilter() {
    chrome.storage.sync.get(['whitelist', 'blacklist'], (data) => {
        const whitelist = data.whitelist || [];
        const blacklist = data.blacklist || [];

        // Observe changes in the DOM and apply the transparency
        const observer = new MutationObserver(() => applyEffectToJobs(whitelist, blacklist));
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial call in case job items are already loaded
        applyEffectToJobs(whitelist, blacklist);
    });
}

// Listen for messages from popup.js to apply the filter
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "applyFilter") {
        applyJobFilter();
    }
});

// Apply the filter on initial load
applyJobFilter();