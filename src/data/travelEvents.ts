import type { TravelEvent } from "../game/types";

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
  },
  {
    id: "masters-vision",
    title: "師匠の幻影",
    body: "霧の中に、亡き師匠の影が立つ。言葉はない。ただ一度だけ、型の乱れを正す掌が伸びた。",
    weight: 2,
    tags: ["upgrade", "ninjo"],
    choices: [
      {
        id: "review-kata",
        label: "型を見直す",
        effectLabel: "カード1枚を鍛える",
        effect: { type: "upgradeCard" }
      },
      {
        id: "bow-to-master",
        label: "深く礼をする",
        effectLabel: "人情 +1",
        effect: { type: "ninjo", amount: 1 }
      },
      {
        id: "leave-vision",
        label: "幻を振り切る",
        effectLabel: "何も起きない",
        effect: { type: "none" }
      }
    ]
  },
  {
    id: "ascetic-steps",
    title: "荒行の石段",
    body: "苔むした石段が、夜の山腹へ続いている。一段ごとに膝が軋むが、登り切れば腹の底に火が灯る。",
    weight: 2,
    tags: ["risk", "spirit"],
    choices: [
      {
        id: "climb-steps",
        label: "石段を駆け上がる",
        effectLabel: "HP -4 / 次の戦闘だけ胆力 +1",
        effect: { type: "hpForNextBattleSpirit", hpCost: 4, spiritBoost: 1 }
      },
      {
        id: "steady-breath",
        label: "息を整える",
        effectLabel: "人情 +1",
        effect: { type: "ninjo", amount: 1 }
      },
      {
        id: "avoid-steps",
        label: "迂回する",
        effectLabel: "何も起きない",
        effect: { type: "none" }
      }
    ]
  }
];
