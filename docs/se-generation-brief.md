# 生成SE依頼リスト v0.1

生成SEを用意するための発注メモ。音源を作る場合は、まず `優先度A` の6音だけでよい。すべて `public/assets/audio/se/` に配置する。

## 共通条件

- 形式: まずは `.mp3`
- 音量: 小さめ。あとで実装側で調整するため、音割れしないこと
- 余白: 冒頭と末尾に長い無音を入れない
- 方向: 和風すぎる効果音素材集ではなく、B級カラテ活劇の短い操作音
- 避けるもの: ボイス、掛け声、メロディが長い音、既存作品に似た必殺技音、耳に刺さる高音
- 生成したら `docs/asset-credits.md` の生成AI素材ログに、生成日、サービス、プラン、プロンプト要約を記録する

生成サービスが英語プロンプトに強いことが多いので、プロンプトは英語中心で書く。

## 優先度A: まず欲しい6音

| ファイル名 | 秒数 | 用途 | 方向 | 生成プロンプト |
| --- | ---: | --- | --- | --- |
| `card_select.mp3` | 0.10〜0.20 | カード押下、軽いUI選択 | 木札/紙札を小さく選ぶ音。軽く乾いた音 | `short dry wooden card tap, small paper talisman click, subtle UI select sound, retro martial arts game, no voice, no music, 0.15 seconds` |
| `melee_hit.mp3` | 0.15〜0.35 | 突き、正拳、返し突き | 素早い拳のヒット。痛すぎず、軽すぎない | `short karate punch impact, cloth snap and body hit, dry and punchy, retro arcade martial arts, no gore, no voice, no music, 0.25 seconds` |
| `guard.mp3` | 0.20〜0.50 | 受け、ガード系 | 木/布/腕で受ける防御音。硬すぎない | `short defensive block sound, wooden staff meets forearm guard, cloth rustle, controlled impact, retro martial arts game, no voice, no music, 0.35 seconds` |
| `throw.mp3` | 0.20〜0.40 | 投石、手裏剣、瓦投げ | 小さな投擲の風切り。軽い飛び道具 | `short thrown stone or shuriken whoosh, small projectile cuts through air, subtle impact tail, retro ninja martial arts game, no voice, no music, 0.3 seconds` |
| `breath.mp3` | 0.40〜0.80 | 黙想、丹田呼吸、腹式呼吸 | 短い集中/呼吸。回復音だが派手にしない | `short focused breathing energy sound, calm inhale with subtle inner power pulse, martial arts meditation, no voice, no melody, no music, 0.6 seconds` |
| `combo.mp3` | 0.50〜0.90 | コンボ成立 | 気合が上がる短い成功音。金属/気の上昇 | `short combo success sound, rising martial energy, subtle golden chime with punchy accent, retro action card game, no voice, no music loop, 0.7 seconds` |

## 優先度B: 次に欲しい6音

| ファイル名 | 秒数 | 用途 | 方向 | 生成プロンプト |
| --- | ---: | --- | --- | --- |
| `kick_heavy.mp3` | 0.25〜0.45 | 回し蹴り、踵落とし、重め攻撃 | 低めの蹴りヒット。強いが長くしない | `short heavy karate kick impact, low thump with cloth snap, strong but clean, retro martial arts game, no voice, no music, 0.35 seconds` |
| `block_break.mp3` | 0.20〜0.50 | 投擲の敵ブロック崩し | 乾いた割れ音。瓦や木札が砕ける | `short dry crack break sound, ceramic roof tile or wooden guard shattering lightly, satisfying block break, no voice, no music, 0.35 seconds` |
| `knockback.mp3` | 0.30〜0.60 | ノックバック | 押し戻し、風圧、後退感 | `short knockback impact, enemy pushed backward with air pressure whoosh, martial arts action, no voice, no music, 0.45 seconds` |
| `enemy_attack.mp3` | 0.20〜0.45 | 敵攻撃命中 | 少し低めの打撃/斬撃。NIN-JOE側被弾 | `short enemy attack hit, blunt strike with slight blade-like edge, tense but not bloody, retro samurai action, no voice, no music, 0.35 seconds` |
| `reward.mp3` | 0.30〜0.70 | 報酬取得 | 札を受け取る、少し嬉しい音 | `short reward pickup sound, paper card flourish with small warm chime, subtle achievement, retro card game, no voice, no music loop, 0.5 seconds` |
| `event.mp3` | 0.50〜1.00 | 道中イベント発生/選択 | 鈴、紙片、少し不穏な間 | `short mysterious travel event sound, small bell, paper flutter, tense Japanese folklore mood, no voice, no music loop, 0.8 seconds` |

## 優先度C: 後でよい3音

| ファイル名 | 秒数 | 用途 | 方向 | 生成プロンプト |
| --- | ---: | --- | --- | --- |
| `travel.mp3` | 0.80〜1.50 | 移動開始/次戦へ | 風、足音、短い道中感 | `short travel transition sound, coastal wind and quick footstep on dirt path, subtle paper flutter, retro martial arts adventure, no voice, no music loop, 1.2 seconds` |
| `act_clear.mp3` | 1.50〜3.00 | Act1 Clear | 短い勝利ジングル。SHOGUNの影が崩れる余韻 | `short act clear victory sting, dramatic but restrained, taiko-like hit and warm chime, shadow paper dissolves, no voice, 2 seconds` |
| `defeat.mp3` | 1.00〜2.00 | 敗北 | 無限地獄へ戻される、暗い短音 | `short defeat sting, dark paper flutter and low drum hit, loop reset feeling, retro martial arts drama, no voice, no melody, 1.5 seconds` |

## 納品時の希望

最小セット:

```txt
card_select.mp3
melee_hit.mp3
guard.mp3
throw.mp3
breath.mp3
combo.mp3
```

できれば追加:

```txt
kick_heavy.mp3
block_break.mp3
knockback.mp3
enemy_attack.mp3
reward.mp3
event.mp3
```

後でよい:

```txt
travel.mp3
act_clear.mp3
defeat.mp3
```

## 調整メモ

- 最初は各音1案ずつでよい
- 使ってみて耳に刺さる音だけ差し替える
- `card_select` は最も頻繁に鳴るので、かなり小さく短くする
- `combo` は気持ちよさ担当。ただし連続使用でうるさくならない音量にする
- `breath` はゲームを緩く感じさせないよう、癒しすぎない
- `block_break` は投擲の価値を伝える重要音なので、成功感を少し強めにする
