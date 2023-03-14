export interface ModalInfo {
  title: string;
  visible: boolean;
}

export interface OptionType {
  key?: string;
  value?: number;
  label?: string;
  children?: OptionType[];
}
