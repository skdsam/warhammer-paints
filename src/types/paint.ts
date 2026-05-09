export type PaintBrand = 'Citadel' | 'Vallejo' | 'Army Painter' | 'ProAcryl' | 'AK Interactive';

export type PaintType = string;

export interface Paint {
  id: string;
  name: string;
  brand: PaintBrand;
  type: PaintType;
  hex: string;
  image?: string;
  description?: string;
  complementary?: string[]; // IDs of complementary paints
  triad?: {
    base?: string;
    shade?: string;
    highlight?: string;
  };
}

export interface UserPaint {
  paintId: string;
  owned: boolean;
  wishlist: boolean;
  quantity: number;
  notes?: string;
}

export interface RecipeStep {
  paintId: string;
  technique: string; // e.g., 'Basecoat', 'Glaze', 'Drybrush'
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  modelName?: string;
  steps: RecipeStep[];
  imageUrl?: string;
  author: string;
}
