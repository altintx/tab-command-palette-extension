// the cmdk <Command> import wants React imported
import React, { FC } from "react";
import { CmdShiftPAction } from "../types/command-shift-p-action";
import { Command } from "cmdk";
import { GoBookmark, GoProjectSymlink, GoTools } from "react-icons/go";

export const ActionRow: FC<{
  action: CmdShiftPAction,
  uniqueId: string,
  search: string,
}> = ({ action, search, uniqueId }) => {
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
  {action.icon === 'bookmark' && <GoBookmark />}
  {action.icon === "tab" && <GoProjectSymlink />}
  {action.icon === "system" && <GoTools />}
  {" "}{action.title}
</Command.Item>
}