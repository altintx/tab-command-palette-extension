// the cmdk <Command> import wants React imported
import React, { FC, useCallback, useMemo, useState } from "react";
import { CmdShiftPAction } from "../types/command-shift-p-action";
import { Command } from "cmdk";
import { GoBookmark, GoProjectSymlink, GoTools } from "react-icons/go";

export const ActionRow: FC<{
  action: CmdShiftPAction,
  uniqueId: string,
  search: string,
}> = ({ action, search, uniqueId }) => {
  const managementActions = useMemo(() => action.managementActions, [action.managementActions]);
  const [showIcon, setShowIcon] = useState<'default' | 'management'>('default');
  const showManagement = useCallback(() => managementActions.length && setShowIcon('management'), [managementActions]);
  const showDefault = useCallback(() => setShowIcon('default'), []);
  const defaultAction = useMemo(() => 
    action.icon === 'bookmark' ? <GoBookmark onMouseOver={showManagement} />
    : action.icon === 'tab' ? <GoProjectSymlink onMouseOver={showManagement} /> 
    : action.icon === 'system' ? <GoTools onMouseOver={showManagement} />
    : React.createElement(action.icon, { onMouseOver: showManagement }),
    [action.icon, showManagement]);
  const managementIcons = useMemo(() => (<div
    style={{display:"inline-block"}}
    onMouseOut={showDefault}>
    {managementActions.map(([icon, props, ma]) => React.createElement(icon, {
      ...props,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        ma(action);
      }
    }))}
  </div>), [])
  return <Command.Item 
  key={action.title}
  onSelect={() => {
    action.action();
    if(action.onHighlight) {
      action.onHighlight(search);
    }
  }}
  className='action-item'
  value={uniqueId}
>
  {showIcon === "default"? defaultAction : managementIcons}
  {" "}{action.title}
</Command.Item>
}