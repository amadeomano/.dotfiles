# Go Links: Chrome extension

This Chrome extension makes it nicer to use [Go Links](https://gitlab.personio-internal.de/lf/go-links) in your browser.
Please see its readme for more details.

### How to use

Install from [the Chrome extension store](https://chrome.google.com/webstore/detail/go-links/gkhbhdmjcoilnapnpjfcjloclblfaida?hl=en-GB).
It *should* be visible only to people who are logged in to Chrome with a Personio email address.

### Testing locally

Point Chrome at `chrome://extensions`.
Click `Load unpacked`.
Select this directory and click `OK`.

### Building

`zip -r -FS ../go-links-chrome.zip * --exclude '*.git*'`

### Publishing

Edit [here in the Chrome extension store](https://chrome.google.com/webstore/devconsole/72c49f3a-afda-4443-a8ed-cc046bc0387e/gkhbhdmjcoilnapnpjfcjloclblfaida/edit/package).