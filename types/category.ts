export type Category = {
  _id: string;
  title?: string;
  slug?: string;
  showInWorkFilter?: boolean;
  showInTalentFilter?: boolean;
  showOnLanding?: boolean;
  order?: number;
};
