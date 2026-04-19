export type InfoItem = {
  key: string;
  label: string;
  count?: number;
};
export type InfoPicker = {
  placeholder?: string;
  list: InfoItem[];
  selected: string;
  onSelect: (key: string) => void;
};
