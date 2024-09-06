export type CmdShiftPAction = {
  id: string;
  icon: 'tab' | 'bookmark' | 'system';
  title: string;
  description: string;
  action: () => void;
  onHighlight?: (searchText: string) => void;
};
