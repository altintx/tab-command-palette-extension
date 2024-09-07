import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CmdShiftPAction } from '../types/command-shift-p-action';
import { Command } from "cmdk";
import { getActions, lunrIndex } from '../actions';
import { ActionRow } from './ActionRow';

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
  const index = useMemo(() => lunrIndex(allActions, "id", ["title", "description"]), [allActions]);
  const [search, setSearch] = useState<string>('');

  const actions = useMemo(() => {
    return index.search(search).map(({ ref }) => allActions.find(action => action.id === ref)!);
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