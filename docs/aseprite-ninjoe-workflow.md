# Aseprite NIN-JOEスプライト制作手順 v0.1

NIN-JOEの戦闘アニメーションをAsepriteで作るための手順。Asepriteに慣れていない前提で、まず `idle`, `attack_light`, `guard` の3種類を品質基準として作る。

## 目的

- ChatGPT/Grok/Stable Diffusionはキャラ案と方向確認に使う
- 実装用スプライトはAsepriteで手付け/手直しする
- 背景ノイズ、フレーム位置ズレ、キャラ形状ブレをなくす
- 生成や手直しは高解像度でもよい。ゲーム画面ではCSS側で表示サイズを調整する

## 共通仕様

| 項目 | 指定 |
| --- | --- |
| 1フレーム | 当面は素材ごとに固定。例: `idle` は345x432px |
| 背景 | 完全透過 |
| 見た目 | 8bit風、最大16色程度 |
| 拡大表示 | ゲーム側で `image-rendering: pixelated` |
| 足位置 | 全フレームで同じ地面ラインに固定 |
| 書き出し | 横並びスプライトシートPNG |
| 保存元 | `.aseprite` 形式で必ず残す |

64x64pxは初期MVPの仮基準だったが、生成AIが小サイズ出力を安定して守れないため、固定ルールから外す。
制作は高解像度で行い、実装時にフレーム幅/高さとCSSスケールを合わせる。

## 作業フォルダ

生成元/参照画像:

- `assets-source/generated/ninjoe/ninjoe_idle_generated_transparent.png`
- `assets-source/generated/ninjoe/ninjoe_idle_reference_frame1.png`

作業ファイル:

- `assets-source/aseprite/ninjoe/ninjoe_idle.aseprite`
- `assets-source/aseprite/ninjoe/ninjoe_attack_light.aseprite`
- `assets-source/aseprite/ninjoe/ninjoe_guard.aseprite`

ゲーム用書き出し:

- `public/assets/images/ninjoe/ninjoe_idle.png`
- `public/assets/images/ninjoe/ninjoe_attack_light.png`
- `public/assets/images/ninjoe/ninjoe_guard.png`

`assets-source` はゲームから直接読み込まない制作元フォルダとして扱う。
`public/assets/images/ninjoe/` には、実際にゲームで読み込む完成PNGだけを置く。

## 初回設定

1. Asepriteを開く
2. `File > New`
3. Width `64`, Height `64`
4. Color Modeは最初は `RGBA` でよい
5. Backgroundは透明にする
6. `File > Save As` で `.aseprite` として保存する

迷ったら、最初はRGBAで作って問題ない。最終的に見た目の色数を絞ればよい。

## 生成スプライトシートからAseprite化する

生成AIから横並びのスプライトシートが出た場合は、Asepriteの `Import Sprite Sheet` を使う。

1. 生成画像を `assets-source/generated/ninjoe/` に置く
2. Asepriteで画像を開く
3. `File > Import Sprite Sheet` を選ぶ
4. `Type` は等間隔なら `Rows` または `Columns` を選ぶ
5. フレーム数、フレーム幅、フレーム高さを指定する
6. 取り込み後、足位置、輪郭ノイズ、背景抜きを確認する
7. `.aseprite` として `assets-source/aseprite/ninjoe/` に保存する
8. 完成PNGとして `public/assets/images/ninjoe/` に書き出す

現行の `idle` は5フレーム、1フレーム345x432px、横並び1725x432pxで運用する。
ゲーム側ではCSSの `width`, `height`, `background-position`, `scale` をこの値に合わせる。

## 既存PNGから下絵を作る

小さな仮素材を下絵にして、清書用の `.aseprite` を作る場合の手順。
これは初期64px素材向けの旧手順。現在の基本ルートは、上のImport Sprite Sheet手順を使う。

### 1. 仮素材を開く

1. Asepriteを開く
2. `File > Open`
3. `public/assets/images/ninjoe/ninjoe_idle.png` を開く
4. 256x64の横長画像として開ければOK

このPNGは4フレーム横並びだが、背景抜きと位置合わせは仮なので、完成品としては使わない。

### 2. 1フレーム目を選ぶ

1. 左側の選択ツールを選ぶ
2. 上部または左下のツール設定で、選択範囲を `64x64` にする
3. 左端の1フレーム目を囲む
   - x=0〜63
   - y=0〜63
4. `Edit > Copy` でコピーする

範囲指定が難しければ、まず大きめに選択してコピーし、新規64x64側で位置を調整してもよい。

### 3. 清書用の新規ファイルを作る

1. `File > New`
2. Width `64`, Height `64`
3. Color Mode `RGBA`
4. Backgroundは透明
5. `Edit > Paste` で貼り付ける
6. Move Toolで、足の裏が y=57 付近に来るよう調整する
7. `File > Save As`
8. `assets-source/aseprite/ninjoe/ninjoe_idle.aseprite` として保存する

この時点では下絵が荒くてもよい。ここから清書していく。

### 4. レイヤーを整理する

1. 貼り付けたレイヤー名を `rough` にする
2. `rough` の不透明度を下げる。30〜50%程度
3. 新規レイヤー `body` を作る
4. `body` レイヤーにNIN-JOEを清書する
5. 必要なら `guide` レイヤーを作り、地面ラインと中心線を描く

`rough` は下絵なので、書き出し前に非表示にする。

### 5. 清書で直すポイント

- 背景ノイズを描き写さない
- 輪郭を黒または濃い色で整理する
- 白道着、黒帯、素手の拳が読めるようにする
- 顔は細かく描きすぎず、目と眉の記号で人間味を出す
- 足の裏の高さを固定する
- 色数を増やしすぎない
- 迷ったら、遠目で見て「白道着の空手家」に見えるかを優先する

### 6. `idle` の4フレームを作る

1. Frame 1を完成させる
2. TimelineでFrame 1を複製してFrame 2を作る
3. Frame 2では肩、帯、拳を1px下げる
4. Frame 1を複製してFrame 3に置く
5. Frame 4では肩、帯、拳を1px上げる
6. Playで確認する

足の裏、顔の向き、体の横位置は動かさない。動かすのは呼吸に関係する部分だけ。

### 7. 途中保存

作業中でもこまめに保存する。

```txt
assets-source/aseprite/ninjoe/ninjoe_idle.aseprite
```

この `.aseprite` が制作元。ゲームでは直接使わず、PNGへ書き出してから使う。

## レイヤー構成

最低限この3レイヤーに分ける。

| レイヤー | 用途 |
| --- | --- |
| `guide` | 地面ライン、中心線、フレーム枠の目安 |
| `body` | NIN-JOE本体 |
| `effects` | 攻撃線、受けの衝撃、投擲軌跡など |

`guide` は書き出し前に非表示にする。

## ガイドの作り方

`guide` レイヤーに薄い色で描く。

- 地面ライン: y=57 付近
- 体の中心: x=32 付近
- 頭の上限: y=6 付近
- 足の左右幅: x=12〜52 付近

足の裏は全フレームで同じy座標に置く。これがズレると、ゲーム上でふわふわしたり横滑りして見える。

## `idle` の作り方

目的: 左右に動かさず、空手の構えで上下に呼吸する。

推奨4フレーム:

| Frame | 内容 |
| --- | --- |
| 1 | 基本構え |
| 2 | 肩、帯、拳を1px下げる。膝を少し沈める |
| 3 | Frame 1に戻る |
| 4 | 肩、帯、拳を1px上げる。息を戻す |

注意:

- 足の位置は動かさない
- 頭を大きく動かさない
- 拳と帯の上下だけで呼吸を見せる
- 横移動は入れない
- 4フレームで物足りない場合も、まずはこの小さな動きで確認する

## `attack_light` の作り方

目的: 突き/正拳として読める短い攻撃。コンボの1段目/2段目にも使う。

推奨5フレーム:

| Frame | 内容 |
| --- | --- |
| 1 | 基本構え |
| 2 | 拳を少し引く。腰を沈める |
| 3 | 前足を踏み込み、拳を前へ出す |
| 4 | 打撃最大。拳、肩、腰のラインを一番伸ばす |
| 5 | 構えに戻る途中 |

注意:

- 足の接地感を残す
- 打撃最大フレームだけはシルエットを大きく変える
- ヒット感はゲーム側のSE/エフェクトも使うので、絵だけを派手にしすぎない

## `guard` の作り方

目的: 受け、防御、ガードゲージ消費が読める硬い構え。

推奨4フレーム:

| Frame | 内容 |
| --- | --- |
| 1 | 基本構え |
| 2 | 両腕を上げて受けに入る |
| 3 | 衝撃。腕を少し押される。足は踏ん張る |
| 4 | 構えに戻る |

注意:

- 足腰を崩しすぎない
- 受けている腕の位置を大きめに見せる
- `effects` レイヤーに短い衝撃線を足してもよい

## Asepriteで使う機能

最低限これだけ覚えればよい。

| 機能 | 使い所 |
| --- | --- |
| Timeline | フレームとレイヤーを管理する |
| Duplicate Frame | 前フレームを複製して差分を作る |
| Onion Skin | 前後フレームを見ながら位置ズレを確認する |
| Move Tool | 体の一部を1px単位で動かす |
| Pencil | ドットを足す/消す |
| Eraser | 背景ノイズを消す |
| Preview/Play | アニメーション確認 |
| Export Sprite Sheet | 横並びPNGを書き出す |

オニオンスキンは、前後フレームの位置合わせに使う。足、頭、拳が意図せずズレていないかを見る。

## 書き出し設定

`File > Export Sprite Sheet` を使う。

共通:

- Sheet Type: `Horizontal`
- Constraints: 1 row
- Sprite: visible layers only
- Output: PNG
- `guide` レイヤーは非表示

期待サイズ:

| モーション | フレーム数 | 書き出しサイズ |
| --- | ---: | --- |
| `idle` | 5 | 1725x432 |
| `attack_light` | 5 | モーション作成時に確定 |
| `guard` | 4 | モーション作成時に確定 |

## CLIで書き出す場合

AsepriteのCLIが使える場合は、次の形で書き出せる。

```sh
aseprite -b assets-source/aseprite/ninjoe/ninjoe_idle.aseprite --sheet public/assets/images/ninjoe/ninjoe_idle.png --sheet-type horizontal
```

自前ビルドで実行ファイル名や場所が違う場合は、`aseprite` の部分を実際のパスに置き換える。

## ゲーム側で確認すること

書き出したら、Codex側で以下を見る。

- PNGサイズが仕様通りか
- 透明背景になっているか
- 足位置が揃っているか
- 画面内で白道着、黒帯、拳が読めるか
- スマホ幅でも潰れないか
- カード使用時のSE/エフェクトと噛み合うか

## 最初のゴール

まずは完璧な全モーションではなく、この3つを完成基準にする。

1. `idle`: 上下呼吸で空手の構えに見える
2. `attack_light`: 正拳突きとして読める
3. `guard`: 受けとして読める

この3つが気持ちよく見えれば、残りの `walk`, `attack_heavy`, `throw`, `breath`, `hit`, `evade` へ広げる。
