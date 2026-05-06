export type CardType = "attack" | "block" | "skill";
export type CardCategory = "melee" | "guard" | "knockback" | "ranged" | "spirit" | "combo" | "special";
export type CardRarity = "starter" | "common" | "uncommon" | "rare";
export type RangeBand = "far" | "mid" | "close";
export type CombatCueKind = "melee" | "ranged" | "knockback" | "block" | "spirit";

export type CombatCue = {
  kind: CombatCueKind;
  label: string;
  detail: string;
  combo: boolean;
};

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
  blockBreak?: number;
  block?: number;
  comboBlock?: number;
  spiritGain?: number;
  comboSpiritGain?: number;
  ranged?: boolean;
  knockback?: boolean;
  wild?: boolean;
  upgraded?: boolean;
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
  patternVariants?: EnemyIntent[][];
};

export type TravelChoiceEffect =
  | { type: "heal"; base: number; ninjoMultiplier: number }
  | { type: "ninjo"; amount: number }
  | { type: "hpForNinjo"; hpCost: number; ninjoGain: number }
  | { type: "upgradeCard" }
  | { type: "hpForNextBattleSpirit"; hpCost: number; spiritBoost: number }
  | { type: "none" };

export type TravelEventChoice = {
  id: string;
  label: string;
  effectLabel: string;
  effect: TravelChoiceEffect;
};

export type TravelEvent = {
  id: string;
  title: string;
  body: string;
  weight: number;
  tags: string[];
  choices: TravelEventChoice[];
};

export type GameState = {
  playerHp: number;
  playerMaxHp: number;
  playerBlock: number;
  ninjo: number;
  spirit: number;
  maxSpirit: number;
  nextBattleSpiritBoost: number;
  battleNumber: number;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyBlock: number;
  enemyPattern: EnemyIntent[];
  enemyIntent: EnemyIntent;
  range: RangeBand;
  runDeck: Card[];
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  exhausted: Card[];
  rewardOptions: Card[];
  travelEvent: TravelEvent | null;
  travelText: string;
  travelResolved: boolean;
  travelMessage: string;
  turn: number;
  lastPlayedCost: number | null;
  comboCount: number;
  combatCue: CombatCue | null;
  log: string[];
  status: "playing" | "reward" | "travel" | "won" | "lost";
};
