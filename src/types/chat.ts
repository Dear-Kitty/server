export interface Content {
  type: string;
  text?: {
    value: string;
    annotations: any[];
  };
}
