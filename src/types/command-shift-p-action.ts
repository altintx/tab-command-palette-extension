import { IconBaseProps, IconType } from "react-icons";

export type CmdShiftPAction = {
  id: string;
  icon: 'tab' | 'bookmark' | 'system' | IconType;
  title: string;
  description: string;
  action: () => void;
  managementActions: [IconType, IconBaseProps, (action: CmdShiftPAction) => void][];
  onHighlight?: (searchText: string) => void;
};
