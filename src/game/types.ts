export type CardType = "attack" | "block" | "skill";
export type CardCategory = "melee" | "guard" | "knockback" | "ranged" | "spirit" | "combo" | "special";
export type CardRarity = "starter" | "common" | "uncommon" | "rare";
export type RangeBand = "far" | "mid" | "close";

export type Card = {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  category: CardCategory;
  rarity: CardRarity;
  description: string;
  damage?: number;
  comboDamage?: number;
  block?: number;
  comboBlock?: number;
  spiritGain?: number;
  comboSpiritGain?: number;
  ranged?: boolean;
  knockback?: boolean;
  wild?: boolean;
};

export type EnemyIntent = {
  label: string;
  damage: number;
  block?: number;
  advances?: boolean;
  ranged?: boolean;
};

export type Enemy = {
  name: string;
  hp: number;
  role: string;
  pattern: EnemyIntent[];
};

export type GameState = {
  playerHp: number;
  playerMaxHp: number;
  playerBlock: number;
  spirit: number;
  maxSpirit: number;
  battleNumber: number;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyBlock: number;
  enemyIntent: EnemyIntent;
  range: RangeBand;
  runDeck: Card[];
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  exhausted: Card[];
  rewardOptions: Card[];
  turn: number;
  lastPlayedCost: number | null;
  comboCount: number;
  log: string[];
  status: "playing" | "reward" | "won" | "lost";
};
