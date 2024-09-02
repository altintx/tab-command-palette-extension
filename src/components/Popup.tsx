import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CmdShiftPAction } from '../command-shift-p-action';
import { getBookmarks, getTabs } from '../chrome-apis';
import { Command } from "cmdk";
import { GoBookmark, GoTools, GoProjectSymlink  } from "react-icons/go";
import { getActions } from '../actions';

const Popup: React.FC = () => {
  const [actions, setActions] = useState<CmdShiftPAction[]>([]);
  const searchBox = useRef<HTMLInputElement | null>(null);

  const closePopup = useCallback(() => window.close(), []);

  useEffect(() => {
    (async () => {
      setActions(await getActions({ closePopup }));
      searchBox.current?.focus();
    }).call(null);
  }, []);

  return (
    <Command
      label="Command Menu"
      loop
    >
    <Command.Input ref={searchBox} className="searchBox" />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>
      {actions.map((action,ix) => (
        <Command.Item 
          key={action.title}
          onSelect={action.action}
          className='action-item'
          value={`${action.title}-${ix}`}
        >
          {action.type === 'bookmark' && <GoBookmark />}
          {action.type === "tab" && <GoProjectSymlink />}
          {action.type === "system" && <GoTools />}
          {" "}{action.title}
        </Command.Item>
      ))}      
    </Command.List>
  </Command>
  );
};

export default Popup;