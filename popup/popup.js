document.addEventListener('DOMContentLoaded', () => {
    const whitelistInput = document.getElementById('whitelist');
    const blacklistInput = document.getElementById('blacklist');
    const saveButton = document.getElementById('saveButton');

    // Load saved whitelist and blacklist from storage
    chrome.storage.sync.get(["whitelist", "blacklist", "effect"], (data) => {
        whitelistInput.value = data.whitelist ? data.whitelist.join(", ") : "";
        blacklistInput.value = data.blacklist ? data.blacklist.join(", ") : "";
        
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
        const whitelist = document.getElementById("whitelist").value.split(",").map(item => item.trim());
        const blacklist = document.getElementById("blacklist").value.split(",").map(item => item.trim());
        const effect = document.querySelector('input[name="effect"]:checked').value;

        chrome.storage.sync.set({ whitelist, blacklist, effect }, () => {
            // Send message to the active tab to apply filter
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "applyFilter" });
            });
        });
    });
});
