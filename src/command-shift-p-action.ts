export type CmdShiftPAction = {
  type: 'tab' | 'bookmark' | 'system';
  title: string;
  description: string;
  action: () => void;
};
