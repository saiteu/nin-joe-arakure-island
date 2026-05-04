import type { TravelEvent } from "../game/types";

export const travelTexts = [
  "遠くにSHOGUNの城影が見える。NIN-JOEは拳を握り、ぬかるんだ道を進む。",
  "竹林の奥で風が鳴る。黒帯が揺れ、次の戦場の気配が近づく。",
  "荒くれ島の山道は静かすぎる。静けさの奥で、誰かが助けを待っている。"
];

export const travelEvents: TravelEvent[] = [
  {
    id: "old-teahouse",
    title: "茶屋の老婆",
    body: "荒れた峠の茶屋で、老婆がNIN-JOEを見つける。湯気の立つ握り飯が、竹皮の上に置かれている。",
    weight: 3,
    tags: ["heal", "ninjo"],
    choices: [
      {
        id: "take-rice-ball",
        label: "握り飯を受け取る",
        effectLabel: "HPを 6 + 人情 x 2 回復",
        effect: { type: "heal", base: 6, ninjoMultiplier: 2 }
      },
      {
        id: "chop-firewood",
        label: "茶屋の薪割りを手伝う",
        effectLabel: "人情 +1",
        effect: { type: "ninjo", amount: 1 }
      },
      {
        id: "hurry-on",
        label: "急いで先へ進む",
        effectLabel: "何も起きない",
        effect: { type: "none" }
      }
    ]
  },
  {
    id: "fallen-arakure",
    title: "倒れた荒くれ者",
    body: "さっきまで敵だった荒くれ者が道端で倒れている。SHOGUNに捨て駒にされたらしい。",
    weight: 2,
    tags: ["ninjo", "risk"],
    choices: [
      {
        id: "share-water",
        label: "水を分ける",
        effectLabel: "人情 +1",
        effect: { type: "ninjo", amount: 1 }
      },
      {
        id: "treat-wounds",
        label: "手当てする",
        effectLabel: "HP -3 / 人情 +2",
        effect: { type: "hpForNinjo", hpCost: 3, ninjoGain: 2 }
      },
      {
        id: "walk-away",
        label: "見逃して進む",
        effectLabel: "何も起きない",
        effect: { type: "none" }
      }
    ]
  }
];
