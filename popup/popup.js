document.addEventListener('DOMContentLoaded', () => {
    const extensionEnabledCheck = document.getElementById('extensionEnabled');
    const whitelistInput = document.getElementById('whitelist');
    const blacklistKeywordsInput = document.getElementById('blacklistKeywords');
    const blacklistCompaniesInput = document.getElementById('blacklistCompanies');
    const saveButton = document.getElementById('saveButton');
    const appliedFilter = document.getElementById("appliedFilter");
    const viewedFilter = document.getElementById("viewedFilter");
    const savedFilter = document.getElementById("savedFilter");
    const promotedFilter = document.getElementById("promotedFilter");
    const earlyApplicantFilter = document.getElementById("earlyApplicantHighlight");
    const hasConnectionsFilter = document.getElementById("hasConnectionsHighlight");
    const earlyReviewFilter = document.getElementById("earlyReviewTimeHighlight");

    // Load saved whitelist and blacklist from storage
    chrome.storage.sync.get(["enabled", "whitelist", "blacklistKeywords", "blacklistCompanies", "effect", "quickFilters", "highlightCriteria"], (data) => {
        extensionEnabledCheck.checked = data.enabled !== false; // Default to enabled if not set
        whitelistInput.value = data.whitelist ? data.whitelist.join(", ") : "";
        blacklistKeywordsInput.value = data.blacklistKeywords ? data.blacklistKeywords.join(", ") : "";
        blacklistCompaniesInput.value = data.blacklistCompanies ? data.blacklistCompanies.join(", ") : "";

        // Init the filters
        const quickFilters = data.quickFilters || [];
        appliedFilter.checked = quickFilters.includes("Applied");
        viewedFilter.checked = quickFilters.includes("Viewed");
        savedFilter.checked = quickFilters.includes("Saved");
        promotedFilter.checked = quickFilters.includes("Promoted");

        // Set highlight checkboxes
        const highlightCriteria = data.highlightCriteria || [];
        earlyApplicantFilter.checked = highlightCriteria.includes("EarlyApplicant");
        hasConnectionsFilter.checked = highlightCriteria.includes("HasConnections");
        earlyReviewFilter.checked = highlightCriteria.includes("EarlyReviewTime");
        
        // Set the saved radio button for effect
        if (data.effect) {
            document.querySelector(`input[name="effect"][value="${data.effect}"]`).checked = true;
        } else {
            // If no value is saved, default to "transparent"
            document.querySelector(`input[name="effect"][value="transparent"]`).checked = true;
        }

        // Disable or enable UI controls based on the enabled state
        toggleControls(extensionEnabledCheck.checked);
    });

    // Function to enable or disable controls based on extension state
    function toggleControls(enabled) {
        const controls = document.querySelectorAll(
            "#whitelist, #blacklistKeywords, #blacklistCompanies, input[name='effect'], #appliedFilter, #viewedFilter, #savedFilter, #promotedFilter, #earlyApplicantHighlight, #hasConnectionsHighlight, #earlyReviewTimeHighlight"
        );
        controls.forEach(control => control.disabled = !enabled);
    }
    // Save and apply the whitelist and blacklist when the save button is clicked
    saveButton.addEventListener('click', () => {
        const enabled = extensionEnabledCheck.checked;
        const whitelist = whitelistInput.value.split(",").map(item => item.trim());
        const blacklistKeywords = blacklistKeywordsInput.value.split(",").map(item => item.trim());
        const blacklistCompanies  = blacklistCompaniesInput.value.split(",").map(item => item.trim());
        const effect = document.querySelector('input[name="effect"]:checked').value;

        // Collect selected quick filters
        const quickFilters = [];
        if (appliedFilter.checked) quickFilters.push("Applied");
        if (viewedFilter.checked) quickFilters.push("Viewed");
        if (savedFilter.checked) quickFilters.push("Saved");
        if (promotedFilter.checked) quickFilters.push("Promoted");

        const highlightCriteria = [];
        if (earlyApplicantFilter.checked) highlightCriteria.push("EarlyApplicant");
        if (hasConnectionsFilter.checked) highlightCriteria.push("HasConnections");
        if (earlyReviewFilter.checked) highlightCriteria.push("EarlyReviewTime");    

        chrome.storage.sync.set({ enabled, whitelist, blacklistKeywords, blacklistCompanies, effect, quickFilters, highlightCriteria }, () => {
            // Send message to the active tab to apply filter
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

            // Check if we are in a LinkedIn page. Not checking it raises an error
            const url = tabs[0].url || "";
            if (url.includes("https://www.linkedin.com/jobs/")) 
                chrome.tabs.sendMessage(tabs[0].id, { action: "applyFilter" });
            else
                console.log("Not on a LinkedIn job page. No message sent to content script.");
            });
        });
    });

    // Enable/disable toggle
    extensionEnabledCheck.addEventListener("change", (event) => {
        const enabled = event.target.checked;
        toggleControls(enabled);
    });
});
