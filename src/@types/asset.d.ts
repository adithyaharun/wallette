export type Asset = {
  id: number;
  name: string;
  description?: string;
  icon?: Blob;
  categoryId: number | null;
  balance: number;
};

export type AssetBalance = {
  id: number;
  assetId: number;
  date: Date; // ISO date string
  balance: number;
};

export type AssetCategory = {
  id: number;
  name: string;
  description?: string;
  icon?: Blob;
};
