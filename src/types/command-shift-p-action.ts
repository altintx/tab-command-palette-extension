export type CmdShiftPAction = {
  title: string;
  description: string;
  onHighlight?: (searchText: string) => void;
  url?: string;
};
