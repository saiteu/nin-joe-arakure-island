import type { Enemy } from "../game/types";

export const enemies: Enemy[] = [
  {
    name: "ARAKURE SAMURAI",
    hp: 56,
    role: "基本敵",
    pattern: [
      { label: "竹刀打ち", damage: 7 },
      { label: "見得を切る", damage: 0, block: 6, advances: true },
      { label: "荒武者斬り", damage: 11 },
      { label: "竹刀打ち", damage: 7 }
    ],
    patternVariants: [
      [
        { label: "竹刀打ち", damage: 7 },
        { label: "荒武者斬り", damage: 10 },
        { label: "見得を切る", damage: 0, block: 6, advances: true },
        { label: "竹刀打ち", damage: 7 }
      ]
    ]
  },
  {
    name: "NINJA MABUSHI",
    hp: 46,
    role: "高速接近と投擲",
    pattern: [
      { label: "煙走り", damage: 0, advances: true },
      { label: "苦無投げ", damage: 5, ranged: true },
      { label: "二連斬り", damage: 9 },
      { label: "煙走り", damage: 0, advances: true }
    ],
    patternVariants: [
      [
        { label: "苦無牽制", damage: 4, ranged: true },
        { label: "煙走り", damage: 0, advances: true },
        { label: "二連斬り", damage: 9 },
        { label: "苦無投げ", damage: 5, ranged: true }
      ]
    ]
  },
  {
    name: "YOKAI KOBUSHI",
    hp: 64,
    role: "防御と大振り",
    pattern: [
      { label: "妖気溜め", damage: 0, block: 8, advances: true },
      { label: "岩拳", damage: 10 },
      { label: "甲羅構え", damage: 0, block: 10 },
      { label: "鬼拳落とし", damage: 14 }
    ],
    patternVariants: [
      [
        { label: "甲羅構え", damage: 0, block: 8 },
        { label: "妖気溜め", damage: 0, block: 6, advances: true },
        { label: "岩拳", damage: 10 },
        { label: "鬼拳落とし", damage: 14 }
      ]
    ]
  },
  {
    name: "ONI BANCHOU",
    hp: 74,
    role: "中ボス: 大技予告",
    pattern: [
      { label: "番長睨み", damage: 0, block: 8, advances: true },
      { label: "鬼張り手", damage: 11 },
      { label: "地獄の肩慣らし", damage: 0, block: 6 },
      { label: "赤鬼ラリアット", damage: 16 }
    ]
  },
  {
    name: "SHOGUNの影",
    hp: 92,
    role: "ボス: 遠近混合",
    pattern: [
      { label: "影手裏剣", damage: 6, ranged: true },
      { label: "将軍結界", damage: 0, block: 14, advances: true },
      { label: "無限斬り", damage: 12 },
      { label: "影寄せ", damage: 0, advances: true },
      { label: "地獄一閃", damage: 17 }
    ]
  }
];
