import type { TiersEnum } from "@enums/tiers.enum";

export interface IPassive {
  name: string;
  tier: TiersEnum;
  description: string;
}
