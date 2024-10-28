// background.js

// When the extension is first installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");
    // Set default whitelist and blacklist values if not already set
    chrome.storage.sync.get(["whitelist", "blacklist"], (data) => {
        if (!data.whitelist) chrome.storage.sync.set({ whitelist: [] });
        if (!data.blacklist) chrome.storage.sync.set({ blacklist: [] });
    });
});

// Listener to handle messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "get_whitelist_blacklist") {
        // Retrieve whitelist and blacklist data
        chrome.storage.sync.get(["whitelist", "blacklist"], (data) => {
            sendResponse({ whitelist: data.whitelist, blacklist: data.blacklist });
        });
        return true; // Keep the message channel open for asynchronous response
    } else if (request.message === "update_whitelist_blacklist") {
        // Update whitelist and blacklist data based on user input
        chrome.storage.sync.set({
            whitelist: request.whitelist,
            blacklist: request.blacklist
        }, () => {
            sendResponse({ status: "success" });
        });
        return true;
    }
});
