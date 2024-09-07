export type Page = {
  content: string;
  title: string;
  url: string;
};

export type PageHistory = {
  opened: Date;
  closed?: Date;
}