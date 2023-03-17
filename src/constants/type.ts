export interface ModalInfo {
  title: string;
  visible: boolean;
}

export interface OptionType {
  key?: number;
  label?: string;
  value?: number;
  title?: string;
  children?: OptionType[];
}
