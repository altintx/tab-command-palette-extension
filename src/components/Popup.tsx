import React, { useState, useEffect, useRef } from 'react';
import { CmdShiftPAction } from '../command-shift-p-action';
import { getBookmarks, getTabs } from '../actions';
import { Command } from "cmdk";

const Popup: React.FC = () => {
  const [actions, setActions] = useState<CmdShiftPAction[]>([]);
  const searchBox = useRef<HTMLInputElement | null>(null);

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
      newActions.push({
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

      newActions.push({
        type: 'system',
        title: 'Close palette',
        description: "Close the palette without doing anything",
        action: function () {
          window.close();
        }
      });

      newActions.push({
        type: 'system',
        title: 'Open browser shortcut keys',
        description: "The browser defaults to control+P being print. Open the browser's shortcuts page to change this",
        action: function () {
          chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
        }
      })


      setActions(newActions);
      searchBox.current?.focus();
    }
    immediate();
  }, []);

  return (
    <Command
      label="Command Menu"
      loop
    >
    <Command.Input ref={searchBox} style={{
      width: "100%",
      border: "0"
    }} />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>
      {actions.map((action,ix) => (
        <Command.Item 
          key={action.title}
          onSelect={action.action}
          className='action-item'
          value={`${action.title}-${ix}`}
        >
          {action.title}
        </Command.Item>
      ))}      
    </Command.List>
  </Command>
  );
};

export default Popup;