// types/variant-attributes.interface.ts
export interface InvariantAttributes {
  color?: string;
  size?: string;
  material?: string;
  weight?: string;
  dimensions?: {
    height: number;
    width: number;
    length: number;
  };
}
