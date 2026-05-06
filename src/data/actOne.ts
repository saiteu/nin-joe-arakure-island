export type ActOneBattle = {
  battleNumber: number;
  spot: string;
  routeNote: string;
  travelTexts: string[];
};

export const actOneBattles: ActOneBattle[] = [
  {
    battleNumber: 1,
    spot: "荒くれ浜の鳥居",
    routeNote: "島の入口。基本の攻防を覚える場所。",
    travelTexts: [
      "潮風の奥に、折れた鳥居が沈んで見える。NIN-JOEは濡れた砂を蹴り、竹林へ向かう。",
      "倒れた荒くれ者の足跡が、島の内側へ続いている。黒帯が風に鳴った。"
    ]
  },
  {
    battleNumber: 2,
    spot: "まぶし竹林",
    routeNote: "忍びの奇襲と投擲を見せる場所。",
    travelTexts: [
      "竹林の奥で風が鳴る。影が消え、次の石段だけが月明かりに残った。",
      "NIN-JOEは竹の葉を払う。遠くで、重い拳が岩を叩く音がした。"
    ]
  },
  {
    battleNumber: 3,
    spot: "妖拳の石段",
    routeNote: "敵ブロックと大振りを越える山場。",
    travelTexts: [
      "妖気の残る石段を登る。頂には、赤い番長旗が夜風に揺れている。",
      "石段に刻まれた拳跡が、関所へ続いている。NIN-JOEは息を整えた。"
    ]
  },
  {
    battleNumber: 4,
    spot: "鬼番長の関所",
    routeNote: "Act1ボス前の中ボス地点。",
    travelTexts: [
      "関所の門が背後で崩れた。黒い紙片が舞い、城門への道を指している。",
      "赤い番長旗が燃え落ちる。炎の向こうに、SHOGUNの城門が口を開けた。"
    ]
  },
  {
    battleNumber: 5,
    spot: "黒紙の城門",
    routeNote: "SHOGUNの影が待つAct1締め地点。",
    travelTexts: []
  }
];

export const actOneClearUnlock = {
  label: "次の道",
  destination: "城門への石段",
  description: "SHOGUNの本丸へ続く道が開いた。"
};

export function actOneBattleFor(battleNumber: number): ActOneBattle {
  return actOneBattles.find((battle) => battle.battleNumber === battleNumber) ?? actOneBattles[0];
}
