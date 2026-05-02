import type { Card } from "../game/types";

export const starterDeck: Card[] = [
  { id: "thrust-1", name: "突き", cost: 0, type: "attack", description: "敵に3ダメージ。コンボ中なら5ダメージ。", damage: 3, comboDamage: 5 },
  { id: "strike-1", name: "正拳", cost: 1, type: "attack", description: "敵に6ダメージ。コンボ中なら8ダメージ。", damage: 6, comboDamage: 8 },
  { id: "strike-2", name: "正拳", cost: 1, type: "attack", description: "敵に6ダメージ。コンボ中なら8ダメージ。", damage: 6, comboDamage: 8 },
  { id: "guard-1", name: "受け", cost: 1, type: "block", description: "ブロックを5得る。コンボ中なら7。", block: 5, comboBlock: 7 },
  { id: "guard-2", name: "受け", cost: 1, type: "block", description: "ブロックを5得る。コンボ中なら7。", block: 5, comboBlock: 7 },
  { id: "roundhouse-1", name: "回し蹴り", cost: 2, type: "attack", description: "敵に12ダメージ。コンボ中なら16ダメージ。ノックバック。", damage: 12, comboDamage: 16, knockback: true },
  { id: "meditate-1", name: "黙想", cost: 0, type: "skill", description: "ブロックを3得る。", block: 3 }
];

export const rewardCardPool: Card[] = [
  { id: "heel-drop", name: "踵落とし", cost: 2, type: "attack", description: "敵に10ダメージ。コンボ中なら15ダメージ。ノックバック。", damage: 10, comboDamage: 15, knockback: true },
  { id: "stone-throw", name: "投石", cost: 0, type: "attack", description: "敵に2ダメージ。間合いを変えない。", damage: 2, ranged: true },
  { id: "shuriken", name: "手裏剣", cost: 1, type: "attack", description: "敵に4ダメージ。コンボ中なら6ダメージ。間合いを変えない。", damage: 4, comboDamage: 6, ranged: true },
  { id: "tanden-breath", name: "丹田呼吸", cost: 0, type: "skill", description: "胆力を1回復。コンボ中なら2回復。", spiritGain: 1, comboSpiritGain: 2 },
  { id: "zanshin", name: "残心", cost: 1, type: "block", description: "ブロックを4得る。コンボ中なら6。", block: 4, comboBlock: 6 },
  { id: "tears-strike", name: "涙の正拳", cost: 2, type: "attack", description: "敵に8ダメージ。コンボ中なら13ダメージ。", damage: 8, comboDamage: 13 },
  { id: "mercy-guard", name: "仁義の受け", cost: 1, type: "block", description: "ブロックを6得る。コンボ中なら8。", block: 6, comboBlock: 8 }
];
