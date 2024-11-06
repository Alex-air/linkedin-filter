document.addEventListener('DOMContentLoaded', () => {
    const whitelistInput = document.getElementById('whitelist');
    const blacklistInput = document.getElementById('blacklist');
    const saveButton = document.getElementById('saveButton');
    const appliedFilter = document.getElementById("appliedFilter");
    const viewedFilter = document.getElementById("viewedFilter");
    const savedFilter = document.getElementById("savedFilter");
    const promotedFilter = document.getElementById("promotedFilter");

    // Load saved whitelist and blacklist from storage
    chrome.storage.sync.get(["whitelist", "blacklist", "effect"], (data) => {
        whitelistInput.value = data.whitelist ? data.whitelist.join(", ") : "";
        blacklistInput.value = data.blacklist ? data.blacklist.join(", ") : "";

        // Init the filters
        const quickFilters = data.quickFilters || [];
        appliedFilter.checked = quickFilters.includes("Applied");
        viewedFilter.checked = quickFilters.includes("Viewed");
        savedFilter.checked = quickFilters.includes("Saved");
        promotedFilter.checked = quickFilters.includes("Promoted");
        
        // Set the saved radio button for effect
        if (data.effect) {
            document.querySelector(`input[name="effect"][value="${data.effect}"]`).checked = true;
        } else {
            // If no value is saved, default to "transparent"
            document.querySelector(`input[name="effect"][value="transparent"]`).checked = true;
        }
    });

    // Save and apply the whitelist and blacklist when the save button is clicked
    saveButton.addEventListener('click', () => {
        const whitelist = whitelistInput.value.split(",").map(item => item.trim());
        const blacklist = blacklistInput.value.split(",").map(item => item.trim());
        const effect = document.querySelector('input[name="effect"]:checked').value;

        // Collect selected quick filters
        const quickFilters = [];
        if (appliedFilter.checked) quickFilters.push("Applied");
        if (viewedFilter.checked) quickFilters.push("Viewed");
        if (savedFilter.checked) quickFilters.push("Saved");
        if (promotedFilter.checked) quickFilters.push("Promoted");

        chrome.storage.sync.set({ whitelist, blacklist, effect, quickFilters }, () => {
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
});
