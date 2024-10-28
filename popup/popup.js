document.addEventListener('DOMContentLoaded', () => {
    const whitelistInput = document.getElementById('whitelist');
    const blacklistInput = document.getElementById('blacklist');
    const saveButton = document.getElementById('save');

    // Load saved whitelist and blacklist from storage
    chrome.storage.sync.get(["whitelist", "blacklist"], (data) => {
        whitelistInput.value = data.whitelist ? data.whitelist.join(", ") : "";
        blacklistInput.value = data.blacklist ? data.blacklist.join(", ") : "";
    });

    // Save and apply the whitelist and blacklist when the save button is clicked
    saveButton.addEventListener('click', () => {
        const whitelist = whitelistInput.value.split(',').map(item => item.trim()).filter(Boolean);
        const blacklist = blacklistInput.value.split(',').map(item => item.trim()).filter(Boolean);

        chrome.storage.sync.set({ whitelist, blacklist }, () => {
            // Send a message to the content script to apply the new filter
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "applyFilter" });
            });
        });
    });
});
