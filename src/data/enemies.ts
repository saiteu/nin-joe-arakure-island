import type { Enemy } from "../game/types";

export const enemies: Enemy[] = [
  {
    name: "ARAKURE SAMURAI",
    hp: 48,
    role: "基本敵",
    pattern: [
      { label: "竹刀打ち", damage: 7 },
      { label: "見得を切る", damage: 0, block: 6, advances: true },
      { label: "荒武者斬り", damage: 11 },
      { label: "竹刀打ち", damage: 7 }
    ]
  },
  {
    name: "NINJA MABUSHI",
    hp: 38,
    role: "高速接近",
    pattern: [
      { label: "煙走り", damage: 0, advances: true },
      { label: "苦無突き", damage: 6 },
      { label: "二連斬り", damage: 9 },
      { label: "煙走り", damage: 0, advances: true }
    ]
  },
  {
    name: "YOKAI KOBUSHI",
    hp: 54,
    role: "防御と大振り",
    pattern: [
      { label: "妖気溜め", damage: 0, block: 8, advances: true },
      { label: "岩拳", damage: 10 },
      { label: "甲羅構え", damage: 0, block: 12 },
      { label: "鬼拳落とし", damage: 14 }
    ]
  }
];
