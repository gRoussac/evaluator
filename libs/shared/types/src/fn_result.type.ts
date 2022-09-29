export type Fn = {
  sha256: string;
  property: string;
  default: boolean;
};

export type Fonctions = {
  [key: string]: Fn[];
};