/* MIT License

Copyright (c) 2024 Alex R. R.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

// Function to apply transparency to all job items except the selected one
function applyEffectToJobs(enabled, whitelist, blacklist, effect, highlightCriteria) {
    const jobItems = document.querySelectorAll('div[data-job-id]:not(.jobs-search-results-list__list-item--active)');

    jobItems.forEach(jobItem => {
        // TODO: Add a counter to show the saved jobs, and the total ones
        // It is better not to do it, since LinkedIn renders many more out of the visible area.
        // The number could be misleading

        // If the extension is not enabled, just print as default
        if (!enabled)
        {
            resetJobStyle(jobItem);
            return;
        }

        if (!meetsCriteria(jobItem, whitelist, blacklist))
        {
            if (effect === 'transparent')
            {
                jobItem.style.opacity = '0.25';
                jobItem.style.height = ""; // Reset height to original
                jobItem.style.overflow = ""; // Reset overflow to original
            }
            else
            {
                jobItem.style.opacity = '0';
                jobItem.style.height = "0"; // Collapse height
                jobItem.style.overflow = "hidden"; // Hide any overflow content
            }
        }
        else
        {
            resetJobStyle(jobItem);

            // Apply highlighting if criteria are met
            jobItem.style.backgroundColor = shouldHighlight(jobItem, highlightCriteria) ? "rgba(255, 255, 0, 0.2)" : "";
        }
    });
}

function resetJobStyle(jobItem) {
    jobItem.style.opacity = '1'; // Restore the opacity
    jobItem.style.height = ""; // Reset height to original
    jobItem.style.overflow = ""; // Reset overflow to original
    jobItem.style.backgroundColor = "";
}

// Define your criteria function (modify as needed)
function meetsCriteria(jobItem, whitelist, blacklist) {
    const content = jobItem.textContent || "";

    // Check if any whitelisted term is present
    // If whitelist is empty, consider it as "all pass"
    const isWhitelisted = whitelist.length === 0 || whitelist.some(term => content.includes(term));
    
    // Check if any blacklisted term is present
    const isBlacklisted = blacklist.some(term => content.includes(term));

    return isWhitelisted && !isBlacklisted;
}

// Just search for the content in the job items
function shouldHighlight(jobItem, highlightCriteria)
{
    const content = jobItem.textContent || "";
    return (
        (highlightCriteria.includes("EarlyApplicant") && /be an early applicant|hour ago|hours ago|h ago|minute ago|minutes ago|day ago/i.test(content)) ||
        (highlightCriteria.includes("HasConnections") && /connection works here|connections work here|school alum|school alumni/i.test(content)) ||
        (highlightCriteria.includes("EarlyReviewTime") && /applicant review time/i.test(content))
    );
}

// Load whitelist and blacklist from Chrome storage, then apply effect
function applyJobFilter() {
    chrome.storage.sync.get(['enabled', 'whitelist', 'blacklistKeywords', 'blacklistCompanies', 'effect', 'quickFilters', 'highlightCriteria'], (data) => {

        const enabled = data.enabled !== false;
        const whitelist = data.whitelist || [];
        const blacklistKeywords = data.blacklistKeywords || [];
        const blacklistCompanies = data.blacklistCompanies || [];
        const quickFilters = data.quickFilters || [];
        const highlightCriteria = data.highlightCriteria || [];
        const effect = data.effect || "transparent"; // Default to "transparent" if not set

        // Combine blacklistKeywords, blacklistCompanies and quickFilters for filtering
        const combinedBlacklist = [...new Set([...blacklistKeywords, ...blacklistCompanies, ...quickFilters])].filter(Boolean);

        // Observe changes in the DOM and apply the transparency
        const observer = new MutationObserver(() => applyEffectToJobs(enabled, whitelist, combinedBlacklist, effect, highlightCriteria));
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial call in case job items are already loaded
        applyEffectToJobs(enabled, whitelist, combinedBlacklist, effect, highlightCriteria);
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