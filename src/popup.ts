import { getTabs, getBookmarks } from './actions';
import { CmdShiftPAction } from './command-shift-p-action';
import './styles.css';

document.addEventListener('DOMContentLoaded', async function() {
    const searchBox = document.getElementById('searchBox') as HTMLInputElement;
    const actionsList = document.getElementById('actions-list') as HTMLDivElement;
    let actions: CmdShiftPAction[] = [];
    if(!searchBox || !actionsList) return;

    const tabs = await getTabs();
    const bookmarks = await getBookmarks();

    tabs.filter(tab => !!tab.id).forEach(tab => {
        const title = `Switch to tab: ${tab.title}`
        actions.push({
            title,
            description: title,
            type: "tab",
            action: function() {
                chrome.tabs.update(tab.id!, {active: true});
            }
        });
    });

    bookmarks.forEach(bookmark => {
        const title = `Open bookmark: ${bookmark.title}`;
        actions.push({
            type: 'bookmark',
            title,
            description: title,
            action: function() {
                chrome.tabs.create({ url: bookmark.url });
            }
        });
    });

    // Add action for opening a new tab
    actions.push({
        type: 'system',
        title: 'Open new tab',
        description: "Creates a new tab to the configured homepage",
        action: function() {
            chrome.tabs.create({});
        }
    });

    // Add action for closing the current tab
    actions.push({
        type: 'system',
        title: 'Close current tab',
        description: "Closes the current tab",
        action: function() {
            chrome.tabs.query({active: true, currentWindow: true}, function([tab]) {
                if(tab.id)
                    chrome.tabs.remove(tab.id);
            });
        }
    });

    actions.push({
        type: 'system',
        title: 'Close palette',
        description: "Close the palette without doing anything",
        action: function() {
            window.close();
        }
    });

    actions.push({
        type: 'system',
        title: 'Open browser shortcut keys',
        description: "The browser defaults to control+P being print. Open the browser's shortcuts page to change this",
        action: function() {
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
        }
    })

    // Render actions based on the current search query
    searchBox.addEventListener('input', function() {
        if(!searchBox) return;
        const queryPhrase = searchBox.value.toLowerCase();
        
        if(queryPhrase.length) {
            const query = queryPhrase.split(" ");
            const filteredActions = actions.filter(action =>
                query.every(query => 
                    action.title.toLowerCase().includes(query))
            );
            renderActions(filteredActions, query);

        } else {
            return renderActions(actions, []);
        }
    });

    // Render the list of actions
    function renderActions(actionItems: CmdShiftPAction[], queryTerms: string[]) {
        actionsList.innerHTML = '';
        actionItems.forEach(function(action) {
            const actionElement = document.createElement('div');
            actionElement.innerHTML = highlightMatch(action.title, queryTerms)
            actionElement.className = 'action-item';
            actionElement.addEventListener('click', function() {
                action.action();
                window.close(); // Close the popup after action
            });
            actionsList.appendChild(actionElement);
        });
    }

     // Function to bold the matching part of the title
     function highlightMatch(title: string, queryTerms: string[]) {
        if (!queryTerms) return title;
        let titleResult = title;
        for(const term of queryTerms) {
            titleResult = titleResult.replace(new RegExp(term, 'gi'), '<strong>$&</strong>');
        }
        return titleResult;
    }

    // Focus the search box when the popup opens
    searchBox.focus();

    // show all actions when the popup opens
    renderActions(actions, []);

    // Detect if the user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.add('light-theme');
    }
    
});