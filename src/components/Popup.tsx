import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CmdShiftPAction } from '../types/command-shift-p-action';
import { Command } from "cmdk";
import { getActions, lunrActionsIndex } from '../actions';
import { ActionRow } from './ActionRow';

const Popup: React.FC = () => {
  const [allActions, setAllActions] = useState<CmdShiftPAction[]>([]);
  const searchBox = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>('');

  const closePopup = useCallback(() => window.close(), []);

  useEffect(() => {
    (async () => {
      const currentActions = await getActions({ search, closePopup });
      setAllActions(currentActions);
      searchBox.current?.focus();
    }).call(null);
  }, [search, closePopup]);
  const index = useMemo(() => lunrActionsIndex(allActions), [allActions]);

  const actions = useMemo(() => {
    const matches = index.search(search);
    const results = matches.map(({ ref }) => allActions.find(action => action.id === ref)!);
    return results;
  }, [index, search]);

  return (
    <Command
      label="Command Menu"
      loop
      shouldFilter={false}
    >
    <Command.Input ref={searchBox} className="searchBox" value={search} onValueChange={setSearch} />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>
      {actions.map(action => <ActionRow
        key={action.id}
        action={action}
        search={search}
        uniqueId={action.id}
      />)}      
    </Command.List>
  </Command>
  );
};

export default Popup;