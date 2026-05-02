import type { Card } from "../game/types";

export const starterDeck: Card[] = [
  { id: "thrust-1", name: "突き", cost: 0, type: "attack", category: "melee", rarity: "starter", description: "敵に3ダメージ。コンボ中なら5ダメージ。", damage: 3, comboDamage: 5 },
  { id: "strike-1", name: "正拳", cost: 1, type: "attack", category: "melee", rarity: "starter", description: "敵に6ダメージ。コンボ中なら8ダメージ。", damage: 6, comboDamage: 8 },
  { id: "strike-2", name: "正拳", cost: 1, type: "attack", category: "melee", rarity: "starter", description: "敵に6ダメージ。コンボ中なら8ダメージ。", damage: 6, comboDamage: 8 },
  { id: "guard-1", name: "受け", cost: 1, type: "block", category: "guard", rarity: "starter", description: "ブロックを5得る。コンボ中なら7。", block: 5, comboBlock: 7 },
  { id: "guard-2", name: "受け", cost: 1, type: "block", category: "guard", rarity: "starter", description: "ブロックを5得る。コンボ中なら7。", block: 5, comboBlock: 7 },
  { id: "roundhouse-1", name: "回し蹴り", cost: 2, type: "attack", category: "knockback", rarity: "starter", description: "敵に12ダメージ。コンボ中なら16ダメージ。ノックバック。", damage: 12, comboDamage: 16, knockback: true },
  { id: "meditate-1", name: "黙想", cost: 0, type: "skill", category: "guard", rarity: "starter", description: "ブロックを3得る。", block: 3 }
];

export const rewardCardPool: Card[] = [
  { id: "heel-drop", name: "踵落とし", cost: 2, type: "attack", category: "knockback", rarity: "common", description: "敵に10ダメージ。コンボ中なら15ダメージ。ノックバック。", damage: 10, comboDamage: 15, knockback: true },
  { id: "stone-throw", name: "投石", cost: 0, type: "attack", category: "ranged", rarity: "common", description: "敵に2ダメージ。間合いを変えない。", damage: 2, ranged: true },
  { id: "shuriken", name: "手裏剣", cost: 1, type: "attack", category: "ranged", rarity: "common", description: "敵に4ダメージ。コンボ中なら6ダメージ。間合いを変えない。", damage: 4, comboDamage: 6, ranged: true },
  { id: "tanden-breath", name: "丹田呼吸", cost: 0, type: "skill", category: "spirit", rarity: "uncommon", description: "胆力を1回復。コンボ中なら2回復。", spiritGain: 1, comboSpiritGain: 2 },
  { id: "zanshin", name: "残心", cost: 1, type: "block", category: "combo", rarity: "common", description: "ブロックを4得る。コンボ中なら6。", block: 4, comboBlock: 6 },
  { id: "tears-strike", name: "涙の正拳", cost: 2, type: "attack", category: "melee", rarity: "uncommon", description: "敵に8ダメージ。コンボ中なら13ダメージ。", damage: 8, comboDamage: 13 },
  { id: "mercy-guard", name: "仁義の受け", cost: 1, type: "block", category: "guard", rarity: "common", description: "ブロックを6得る。コンボ中なら8。", block: 6, comboBlock: 8 },
  { id: "tile-throw", name: "瓦投げ", cost: 1, type: "attack", category: "ranged", rarity: "common", description: "敵に3ダメージ。コンボ中なら5ダメージ。間合いを変えない。", damage: 3, comboDamage: 5, ranged: true },
  { id: "shoulder-check", name: "鉄肩", cost: 1, type: "attack", category: "knockback", rarity: "uncommon", description: "敵に5ダメージ。コンボ中なら7ダメージ。ノックバック。", damage: 5, comboDamage: 7, knockback: true },
  { id: "lower-guard", name: "下段払い", cost: 0, type: "block", category: "guard", rarity: "common", description: "ブロックを2得る。コンボ中なら4。", block: 2, comboBlock: 4 },
  { id: "masters-lesson", name: "師匠の教え", cost: 2, type: "skill", category: "combo", rarity: "rare", description: "ブロックを6得て、胆力を1回復。コンボ中なら胆力を2回復。", block: 6, spiritGain: 1, comboSpiritGain: 2 }
];
