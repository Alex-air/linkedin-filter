// Function to apply transparency based on criteria
function applyTransparencyToJobs() {
    const jobItems = document.querySelectorAll('div[data-job-id]');
    
    jobItems.forEach(jobItem => {
        if (meetsCriteria(jobItem))
            jobItem.style.opacity = '1';
        else
            jobItem.style.opacity = '0.25';
    });
}

// Define your criteria function (modify as needed)
function meetsCriteria(jobItem) {
    const content = jobItem.textContent || ""; // Get text content of the job item

    // Criteria: True if meets the following:
    // - Contains "Barcelona" but does NOT contain "viewed" or "applied"
    // - OR contains "Remote" but does NOT contain "viewed" or "applied"
    const containsBarcelona = content.includes("Barcelona");
    const containsRemote = content.includes("Remote");
    const containsViewedOrApplied = content.includes("Viewed") || content.includes("Applied");
    
    return (containsBarcelona || containsRemote) && !containsViewedOrApplied;
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