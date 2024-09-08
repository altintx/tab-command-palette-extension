# tab-command-palette-extension
This is an extension that will try to guide you into using existing tabs instead of opening duplicates, and finding old or abandoned tabs with useful content. There are two parts to this extension:

First, there is a server ("background script"). It runs in the background, maintaing a list of every open tab and its contents. It also maintains a history of tabs that have closed. 

Second, there is a script that will be added to every tab you open ("content script") that will contact the server when a page loads and also contacts the server when a page is left. It has one additional responsibility, to highlight content on the page.

This extension can be used from the Omnibox location bar by typing `> `. Once open, you can search and open URLs by title, URL or page contents. Searching is powered by the [Lunr.js](https://github.com/olivernn/lunr.js) search engine. Especially when opening by search, the extension will attempt to highlight matches on the page.

# Downloading
Download the newest release from the [repository at Github](https://github.com/altintx/tab-command-palette-extension/releases).  
Extract the ZIP file.
In browser, open to chrome://extension
Press "Load Unpacked"
Browse to the folder you extracted to.

# Building
If you want to contribute to the development of this project, read on.
```
git clone https://github.com/altintx/tab-command-palette-extension.git
cd tab-command-palette-extension
npm install
npm run build
```

# Installing Built Extension
open chrome://extensions
Enable developer mode
Press "Load Unpacked Extension"
You'll be prompted for the folder. If you don't know where it is, try `tab-command-palette-extension` under your home directory.

# Using

(If you're on a Mac use `Command` not `Control`.)

Press `Control`+`L`, then type `> `.

This developer's muscle memory won't stop pressing `Control`+`Shift`+`P` so there's a naggy message to hit `Control`+`L` instead.
