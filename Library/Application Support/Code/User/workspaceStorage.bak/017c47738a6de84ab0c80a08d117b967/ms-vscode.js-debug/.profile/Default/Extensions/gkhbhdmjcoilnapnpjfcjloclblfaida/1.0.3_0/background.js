chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    const baseUrl = 'https://pzip.to/'; // migrated from https://go-links.tools.personio-internal.de/v1/
    const url = baseUrl + (text && text.startsWith('edit ')
        ? 'edit/' + text.replace(/^edit /, '')
        : text);
    switch (disposition) {
        case "currentTab":
            chrome.tabs.update({url});
            break;
        case "newForegroundTab":
            chrome.tabs.create({url});
            break;
        case "newBackgroundTab":
            chrome.tabs.create({url, active: false});
            break;
    }
});

