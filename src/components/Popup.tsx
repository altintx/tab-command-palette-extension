import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CmdShiftPAction } from '../types/command-shift-p-action';
import { Command } from "cmdk";
import { GoBookmark, GoTools, GoProjectSymlink  } from "react-icons/go";
import { getActions, lunrIndex } from '../actions';

const Popup: React.FC = () => {
  const [allActions, setAllActions] = useState<CmdShiftPAction[]>([]);
  const searchBox = useRef<HTMLInputElement | null>(null);

  const closePopup = useCallback(() => window.close(), []);

  useEffect(() => {
    (async () => {
      const currentActions = await getActions({ closePopup });
      setAllActions(currentActions);
      searchBox.current?.focus();
    }).call(null);
  }, []);
  // const index = useMemo(() => lunrIndex(allActions, "id", ["title", "description"]), [allActions]);
  const [search, setSearch] = useState<string>('');

  // const actions = useMemo(() => {
  //   return index.search(search).map(({ ref }) => allActions.find(action => action.id === ref)!);
  // }, [index, search]);

  return (
    <Command
      label="Command Menu"
      loop
    >
    <Command.Input ref={searchBox} className="searchBox" value={search} onValueChange={setSearch} />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>
      {allActions.map((action,ix) => (
        <Command.Item 
          key={action.title}
          onSelect={action.action}
          className='action-item'
          value={`${action.title}-${ix}`}
        >
          {action.icon === 'bookmark' && <GoBookmark />}
          {action.icon === "tab" && <GoProjectSymlink />}
          {action.icon === "system" && <GoTools />}
          {" "}{action.title}
        </Command.Item>
      ))}      
    </Command.List>
  </Command>
  );
};

export default Popup;