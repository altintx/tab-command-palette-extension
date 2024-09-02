import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CmdShiftPAction } from '../command-shift-p-action';
import { getBookmarks, getTabs } from '../actions';

const Popup: React.FC = () => {
  const [actions, setActions] = useState<CmdShiftPAction[]>([]);
  const searchBox = useRef<HTMLInputElement | null>(null);
  const actionList = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const immediate = async () => {
      const tabs = await getTabs();
      const bookmarks = await getBookmarks();

      const newActions: CmdShiftPAction[] = [];

      tabs.filter(tab => !!tab.id).forEach(tab => {
        const title = `Switch to tab: ${tab.title}`;
        newActions.push({
          title,
          description: title,
          type: "tab",
          action: function () {
            chrome.tabs.update(tab.id!, { active: true });
          }
        });
      });
      bookmarks.forEach(bookmark => {
        const title = `Open bookmark: ${bookmark.title}`;
        newActions.push({
          type: 'bookmark',
          title,
          description: title,
          action: function () {
            chrome.tabs.create({ url: bookmark.url });
          }
        });
      });

      // Add action for opening a new tab
      actions.push({
        type: 'system',
        title: 'Open new tab',
        description: "Creates a new tab to the configured homepage",
        action: function () {
          chrome.tabs.create({});
        }
      });

      // Add action for closing the current tab
      actions.push({
        type: 'system',
        title: 'Close current tab',
        description: "Closes the current tab",
        action: function () {
          chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
            if (tab.id)
              chrome.tabs.remove(tab.id);
          });
        }
      });

      actions.push({
        type: 'system',
        title: 'Close palette',
        description: "Close the palette without doing anything",
        action: function () {
          window.close();
        }
      });

      actions.push({
        type: 'system',
        title: 'Open browser shortcut keys',
        description: "The browser defaults to control+P being print. Open the browser's shortcuts page to change this",
        action: function () {
          chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
        }
      })


      setActions(newActions);
    }
    immediate();
  }, []);

  const queryTerms = useMemo(() => search.split(' ').filter(term => term.length > 0), [search]);
  const applicableActions = useMemo(() => {
    return actions.filter(action => {
      const title = action.title.toLowerCase();
      const description = action.description.toLowerCase();

      return queryTerms.every(term => title.includes(term) || description.includes(term));
    }).map(action => {
      // generate a resultText that highlights the search terms in the title
      const resultText = action.title.split(' ').map(word => {
        if (queryTerms.some(term => word.toLowerCase().includes(term))) {
          return <strong>{word}</strong>;
        } else {
          return word;
        }
      });
      return {
        ...action,
        foo: "bar",
        display: resultText
      }
    })
  }, [actions, queryTerms]);

  return (
    <div>
      <input
        id="searchBox"
        type="text"
        placeholder="Search actions..."
        ref={searchBox}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div ref={actionList} id="actions-list">
        {applicableActions.map((action, index) => (
          <div className="action-item" key={index} onClick={action.action}>
            {action.display.map((word) => <>{word}{" "}</>)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popup;