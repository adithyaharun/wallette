export type UserFile = {
  id: number;
  tags?: string[]; // Array of tag names
  hash: string; // Unique hash for the file
  createdAt: Date; // ISO date string
};
