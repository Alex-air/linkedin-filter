// Function to apply transparency to all job items except the selected one
function applyTransparencyToJobs() {
    const jobItems = document.querySelectorAll('div[data-job-id]:not(.jobs-search-results-list__list-item--active)');
    
    jobItems.forEach(jobItem => {
        // TODO: Add a counter to show the saved jobs, and the total ones
        if (!meetsCriteria(jobItem))
        {
            jobItem.style.height = '0px';
            jobItem.style.visibility = 'hidden';
        }
            //jobItem.style.opacity = '0.25';
    });
}

// Define your criteria function (modify as needed)
function meetsCriteria(jobItem) {
    const content = jobItem.textContent || ""; // Get text content of the job item

    const whitelist =   content.includes("Barcelona") ||
                        content.includes("Catalonia") ||
                        content.includes("Remote");
    const blacklist =   content.includes("Viewed") || 
                        content.includes("Applied") || 
                        content.includes("Saved") || 
                        content.includes("Agoda") || 
                        content.includes("myGwork") || 
                        content.includes("Crossover") || 
                        content.includes("Canonical") || 
                        content.includes("RISK") || 
                        content.includes("Revolut") || 
                        content.includes("Growth") || 
                        content.includes("Playrix") || 
                        content.includes("Semrush");
    
    return whitelist && !blacklist;
}

// Observe changes in the DOM and apply the transparency
const observer = new MutationObserver(applyTransparencyToJobs);

// Start observing the body for child changes (adjust as needed)
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial call in case job items are already loaded
applyTransparencyToJobs();