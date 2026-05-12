import "./styles.css";
import { actOneBattleFor, actOneClearUnlock } from "./data/actOne";
import { starterDeck, rewardCardPool } from "./data/cards";
import { enemies } from "./data/enemies";
import { travelEvents } from "./data/travelEvents";
import { playCardSound, playSound } from "./audio";
import type {
  Card,
  CardCategory,
  CardRarity,
  Enemy,
  EnemyIntent,
  GameState,
  RangeBand,
  CombatCue,
  TravelChoiceEffect,
  TravelEvent
} from "./game/types";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("App root was not found.");
}

const app = appRoot;
const rewardSlots: CardRarity[][] = [["common"], ["common", "uncommon"], ["common", "uncommon", "rare"]];

let cardInstanceId = 0;
let state = newGame();
let combatCueTimer: number | null = null;
let introCueTimer: number | null = null;

function newGame(): GameState {
  cardInstanceId = 0;
  return createBattle({
    runDeck: starterDeck.map(cloneCard),
    battleNumber: 1,
    playerHp: 42,
    ninjo: 1,
    spiritBoost: 0,
    log: ["NIN-JOEはARAKURE ISLANDへ踏み込んだ。全てはSHOGUNの罠だった。"]
  });
}

function createBattle(options: {
  runDeck: Card[];
  battleNumber: number;
  playerHp: number;
  ninjo: number;
  spiritBoost: number;
  log: string[];
}): GameState {
  const enemy = enemies[options.battleNumber - 1] ?? enemies[0];
  const enemyPattern = pickEnemyPattern(enemy);
  const deck = shuffle([...options.runDeck]);
  const maxSpirit = 3 + options.spiritBoost;
  const initialState: GameState = {
    playerHp: options.playerHp,
    playerMaxHp: 42,
    playerBlock: 0,
    ninjo: options.ninjo,
    spirit: maxSpirit,
    maxSpirit,
    nextBattleSpiritBoost: 0,
    battleNumber: options.battleNumber,
    enemyName: enemy.name,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.hp,
    enemyBlock: 0,
    enemyPattern,
    enemyIntent: pickEnemyIntent(enemyPattern, 1),
    range: "mid",
    runDeck: options.runDeck,
    drawPile: deck,
    hand: [],
    discardPile: [],
    exhausted: [],
    rewardOptions: [],
    travelEvent: null,
    travelText: "",
    travelResolved: false,
    travelMessage: "",
    turn: 1,
    lastPlayedCost: null,
    comboCount: 0,
    combatCue: null,
    introCue: true,
    log: options.log,
    status: "playing"
  };

  drawCards(initialState, 5);
  return initialState;
}

function cloneCard(card: Card): Card {
  cardInstanceId += 1;
  return {
    ...card,
    id: `${card.id}-${cardInstanceId}`
  };
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function pickEnemyPattern(enemy: Enemy): EnemyIntent[] {
  const patterns = [enemy.pattern, ...(enemy.patternVariants ?? [])];
  return shuffle(patterns)[0] ?? enemy.pattern;
}

function pickEnemyIntent(pattern: EnemyIntent[], turn: number): EnemyIntent {
  return pattern[(turn - 1) % pattern.length];
}

function drawCards(target: GameState, amount: number): void {
  for (let count = 0; count < amount; count += 1) {
    if (target.drawPile.length === 0) {
      if (target.discardPile.length === 0) {
        return;
      }
      target.drawPile = shuffle(target.discardPile);
      target.discardPile = [];
      target.log.unshift("捨て札を山札に戻してシャッフルした。");
    }

    const card = target.drawPile.shift();
    if (card) {
      target.hand.push(card);
    }
  }
}

function playCard(cardId: string): void {
  if (state.status !== "playing") {
    return;
  }

  clearIntroCue();

  const cardIndex = state.hand.findIndex((card) => card.id === cardId);
  const card = state.hand[cardIndex];
  if (!card || card.cost > state.spirit) {
    return;
  }

  playSound("card_select");

  const isCombo = state.lastPlayedCost !== null && card.cost === state.lastPlayedCost + 1;
  state.spirit -= card.cost;
  state.comboCount = isCombo ? state.comboCount + 1 : 1;
  state.lastPlayedCost = card.cost;

  const comboPrefix = isCombo ? `コンボ${state.comboCount}。` : "";
  let dealtDamage = 0;
  let gainedBlock = 0;
  let gainedSpirit = 0;
  let brokenBlock = 0;
  let knockedBack = false;

  if (card.damage) {
    if (!card.ranged) {
      state.range = "close";
    }
    const baseDamage = isCombo && card.comboDamage ? card.comboDamage : card.damage;
    const damage = Math.max(0, baseDamage - state.enemyBlock);
    state.enemyBlock = Math.max(0, state.enemyBlock - baseDamage);
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    dealtDamage = damage;
    const attackVerb = card.ranged ? "投げつけ" : "踏み込み";
    state.log.unshift(`${comboPrefix}${card.name}を${attackVerb}、${damage}ダメージを与えた。`);

    if (card.blockBreak) {
      brokenBlock = Math.min(state.enemyBlock, card.blockBreak);
      state.enemyBlock -= brokenBlock;
      if (brokenBlock > 0) {
        state.log.unshift(`${card.name}で敵のブロックを${brokenBlock}崩した。`);
      }
    }

    if (card.knockback) {
      knockedBack = true;
      knockBackEnemy();
    }
  }

  if (card.block) {
    const block = isCombo && card.comboBlock ? card.comboBlock : card.block;
    state.playerBlock += block;
    gainedBlock = block;
    state.log.unshift(`${comboPrefix}${card.name}でブロックを${block}得た。`);
  }

  if (card.spiritGain) {
    const spiritGain = isCombo && card.comboSpiritGain ? card.comboSpiritGain : card.spiritGain;
    state.spirit = Math.min(state.maxSpirit, state.spirit + spiritGain);
    gainedSpirit = spiritGain;
    state.log.unshift(`${comboPrefix}${card.name}で胆力を${spiritGain}回復した。`);
  }

  state.combatCue = createCombatCue({
    card,
    isCombo,
    dealtDamage,
    gainedBlock,
    gainedSpirit,
    brokenBlock,
    knockedBack
  });
  scheduleCombatCueClear();
  playCardSound(card, { isCombo, brokenBlock });

  state.hand.splice(cardIndex, 1);
  state.discardPile.push(card);

  if (state.enemyHp <= 0) {
    if (state.battleNumber >= enemies.length) {
      state.status = "won";
      state.log.unshift("勝利。NIN-JOEは荒くれの包囲を突破した。");
      playSound("act_clear");
    } else {
      state.status = "reward";
      state.rewardOptions = rollRewardCards();
      state.log.unshift("勝利。報酬カードを1枚選べる。");
      playSound("reward");
    }
  }

  render();
}

function endTurn(): void {
  if (state.status !== "playing") {
    return;
  }

  clearIntroCue();

  state.discardPile.push(...state.hand);
  state.hand = [];

  if (state.enemyIntent.damage > 0) {
    if (state.range === "close" || state.enemyIntent.ranged) {
      const incomingDamage = Math.max(0, state.enemyIntent.damage - state.playerBlock);
      state.playerBlock = Math.max(0, state.playerBlock - state.enemyIntent.damage);
      state.playerHp = Math.max(0, state.playerHp - incomingDamage);
      state.log.unshift(`敵の${state.enemyIntent.label}。${incomingDamage}ダメージを受けた。`);
      playSound("enemy_attack");
    } else {
      state.log.unshift(`敵の${state.enemyIntent.label}は${rangeLabel(state.range)}で空を切った。`);
      advanceEnemy();
    }
  } else {
    const block = state.enemyIntent.block ?? 0;
    if (block > 0) {
      state.enemyBlock += block;
      state.log.unshift(`敵は${state.enemyIntent.label}、守りを${block}固めた。`);
    } else {
      state.log.unshift(`敵は${state.enemyIntent.label}で間合いを測った。`);
    }
    if (state.enemyIntent.advances) {
      advanceEnemy();
    }
  }

  if (state.playerHp <= 0) {
    state.status = "lost";
    state.log.unshift("敗北。デッキと敵行動の調整が必要だ。");
    playSound("defeat");
    render();
    return;
  }

  state.turn += 1;
  state.spirit = state.maxSpirit;
  state.playerBlock = 0;
  state.lastPlayedCost = null;
  state.comboCount = 0;
  clearCombatCueTimer();
  state.combatCue = null;
  state.enemyIntent = pickEnemyIntent(state.enemyPattern, state.turn);
  drawCards(state, 5);
  state.log.unshift(`ターン${state.turn}開始。`);
  render();
}

function resetGame(): void {
  clearCombatCueTimer();
  clearIntroCueTimer();
  playSound("card_select");
  state = newGame();
  render();
  scheduleIntroCueClear();
}

function scheduleCombatCueClear(): void {
  clearCombatCueTimer();
  combatCueTimer = window.setTimeout(() => {
    combatCueTimer = null;
    if (state.status !== "playing" || !state.combatCue) {
      return;
    }
    state.combatCue = null;
    render();
  }, 560);
}

function clearCombatCueTimer(): void {
  if (combatCueTimer === null) {
    return;
  }
  window.clearTimeout(combatCueTimer);
  combatCueTimer = null;
}

function scheduleIntroCueClear(): void {
  clearIntroCueTimer();
  introCueTimer = window.setTimeout(() => {
    introCueTimer = null;
    if (state.status !== "playing" || !state.introCue) {
      return;
    }
    state.introCue = false;
    render();
  }, 900);
}

function clearIntroCue(): void {
  clearIntroCueTimer();
  state.introCue = false;
}

function clearIntroCueTimer(): void {
  if (introCueTimer === null) {
    return;
  }
  window.clearTimeout(introCueTimer);
  introCueTimer = null;
}

function rollRewardCards(): Card[] {
  const selected: Card[] = [];

  rewardSlots.forEach((rarities) => {
    const candidate = pickRewardCard(rarities, selected);
    if (candidate) {
      selected.push(candidate);
    }
  });

  if (selected.length < 3) {
    const fallbackCards = shuffle(rewardCardPool).filter((card) => !selected.some((selectedCard) => selectedCard.id === card.id));
    selected.push(...fallbackCards.slice(0, 3 - selected.length));
  }

  return reduceRewardCategoryClump(selected).map(cloneCard);
}

function pickRewardCard(rarities: CardRarity[], selected: Card[]): Card | null {
  const candidates = rewardCardPool.filter(
    (card) => rarities.includes(card.rarity) && !selected.some((selectedCard) => selectedCard.id === card.id)
  );
  return shuffle(candidates)[0] ?? null;
}

function reduceRewardCategoryClump(selected: Card[]): Card[] {
  if (selected.length < 3 || new Set(selected.map((card) => card.category)).size > 1) {
    return selected;
  }

  const replacement = pickReplacementRewardCard(selected, selected[0].category);
  if (!replacement) {
    return selected;
  }

  return [...selected.slice(0, 2), replacement];
}

function pickReplacementRewardCard(selected: Card[], blockedCategory: CardCategory): Card | null {
  const selectedIds = new Set(selected.map((card) => card.id));
  const candidates = rewardCardPool.filter((card) => card.category !== blockedCategory && !selectedIds.has(card.id));
  return shuffle(candidates)[0] ?? null;
}

function chooseReward(cardId: string | null): void {
  if (state.status !== "reward") {
    return;
  }

  const selectedCard = state.rewardOptions.find((card) => card.id === cardId);
  const nextDeck = selectedCard ? [...state.runDeck, selectedCard] : [...state.runDeck];
  const rewardLog = selectedCard ? `${selectedCard.name}をデッキに加えた。` : "報酬を受け取らず先へ進んだ。";
  playSound(selectedCard ? "reward" : "card_select");

  state.runDeck = nextDeck;
  state.rewardOptions = [];
  state.travelText = pickTravelText(state.battleNumber);
  state.travelEvent = rollTravelEvent();
  state.travelResolved = state.travelEvent === null;
  state.travelMessage = state.travelEvent ? "道中で何かが起きた。" : "道中は静かだった。NIN-JOEは歩を止めない。";
  state.status = "travel";
  state.log.unshift(rewardLog);
  playSound(state.travelEvent ? "event" : "travel");
  render();
}

function proceedFromTravel(): void {
  if (state.status !== "travel" || !state.travelResolved) {
    return;
  }

  const nextBattleNumber = state.battleNumber + 1;
  const travelLog = state.travelMessage;
  const spiritBoost = state.nextBattleSpiritBoost;
  playSound("travel");
  state = createBattle({
    runDeck: state.runDeck,
    battleNumber: nextBattleNumber,
    playerHp: state.playerHp,
    ninjo: state.ninjo,
    spiritBoost,
    log: [
      travelLog,
      spiritBoost > 0 ? `荒行の余熱。次の戦闘だけ胆力が${3 + spiritBoost}になった。` : `戦闘${nextBattleNumber}開始。`
    ]
  });
  render();
  scheduleIntroCueClear();
}

function chooseTravelOption(choiceId: string): void {
  if (state.status !== "travel" || !state.travelEvent || state.travelResolved) {
    return;
  }

  const choice = state.travelEvent.choices.find((eventChoice) => eventChoice.id === choiceId);
  if (!choice || isTravelChoiceDisabled(choice.effect)) {
    return;
  }

  state.travelMessage = applyTravelEffect(choice.effect, choice.label);
  state.travelResolved = true;
  state.log.unshift(state.travelMessage);
  playSound("event");
  render();
}

function applyTravelEffect(effect: TravelChoiceEffect, label: string): string {
  if (effect.type === "heal") {
    const healAmount = effect.base + state.ninjo * effect.ninjoMultiplier;
    const previousHp = state.playerHp;
    state.playerHp = Math.min(state.playerMaxHp, state.playerHp + healAmount);
    return `${label}。HPを${state.playerHp - previousHp}回復した。`;
  }

  if (effect.type === "ninjo") {
    const previousNinjo = state.ninjo;
    state.ninjo = clampNinjo(state.ninjo + effect.amount);
    return `${label}。人情が${state.ninjo - previousNinjo}上がった。`;
  }

  if (effect.type === "hpForNinjo") {
    state.playerHp = Math.max(1, state.playerHp - effect.hpCost);
    const previousNinjo = state.ninjo;
    state.ninjo = clampNinjo(state.ninjo + effect.ninjoGain);
    return `${label}。HPを${effect.hpCost}失い、人情が${state.ninjo - previousNinjo}上がった。`;
  }

  if (effect.type === "upgradeCard") {
    const upgradedCard = upgradeRandomCard();
    if (!upgradedCard) {
      return `${label}。師匠の幻は静かに消えた。鍛えられるカードはなかった。`;
    }
    return `${label}。${upgradedCard.name}を鍛えた。`;
  }

  if (effect.type === "hpForNextBattleSpirit") {
    state.playerHp = Math.max(1, state.playerHp - effect.hpCost);
    state.nextBattleSpiritBoost = Math.max(state.nextBattleSpiritBoost, effect.spiritBoost);
    return `${label}。HPを${effect.hpCost}失い、次の戦闘だけ胆力が${3 + state.nextBattleSpiritBoost}になる。`;
  }

  return `${label}。NIN-JOEは先へ進んだ。`;
}

function upgradeRandomCard(): Card | null {
  const upgradeableCards = state.runDeck.filter((card) => isUpgradeableCard(card));
  const card = shuffle(upgradeableCards)[0];
  if (!card) {
    return null;
  }

  card.upgraded = true;
  card.name = `${card.name}+`;

  if (card.damage) {
    card.damage += 2;
    if (card.comboDamage) {
      card.comboDamage += 2;
    }
  }

  if (card.block) {
    card.block += 2;
    if (card.comboBlock) {
      card.comboBlock += 2;
    }
  }

  card.description = upgradedDescription(card);
  return card;
}

function isUpgradeableCard(card: Card): boolean {
  return !card.upgraded && (Boolean(card.damage) || Boolean(card.block));
}

function upgradedDescription(card: Card): string {
  const parts: string[] = [];
  if (card.blockBreak) {
    parts.push(`敵ブロックを${card.blockBreak}崩す`);
  }
  if (card.damage) {
    const rangeNote = card.ranged ? "間合いを変えない" : "";
    const damageText = card.comboDamage
      ? `敵に${card.damage}ダメージ。コンボ中なら${card.comboDamage}ダメージ`
      : `敵に${card.damage}ダメージ`;
    parts.push(damageText);
    if (card.knockback) {
      parts.push("ノックバック");
    }
    if (rangeNote) {
      parts.push(rangeNote);
    }
  }
  if (card.block) {
    const blockText = card.comboBlock ? `ブロックを${card.block}得る。コンボ中なら${card.comboBlock}` : `ブロックを${card.block}得る`;
    parts.push(blockText);
  }
  if (card.spiritGain) {
    const spiritText = card.comboSpiritGain ? `胆力を${card.spiritGain}回復。コンボ中なら${card.comboSpiritGain}回復` : `胆力を${card.spiritGain}回復`;
    parts.push(spiritText);
  }
  return `${parts.join("。")}。`;
}

function rollTravelEvent(): TravelEvent | null {
  if (Math.random() > travelEventChance()) {
    return null;
  }

  const weightedEvents = travelEvents.flatMap((event) => Array.from({ length: eventWeight(event) }, () => event));
  return shuffle(weightedEvents)[0] ?? null;
}

function travelEventChance(): number {
  const hpRatio = state.playerHp / state.playerMaxHp;
  if (hpRatio < 0.25) {
    return 0.55;
  }
  if (hpRatio < 0.5) {
    return 0.4;
  }
  return 0.25;
}

function eventWeight(event: TravelEvent): number {
  if (event.tags.includes("heal") && state.playerHp / state.playerMaxHp < 0.5) {
    return event.weight + 2;
  }
  if (event.tags.includes("risk") && state.playerHp <= 6) {
    return Math.max(1, event.weight - 1);
  }
  return event.weight;
}

function pickTravelText(completedBattleNumber: number): string {
  const travelTexts = actOneBattleFor(completedBattleNumber).travelTexts;
  return shuffle(travelTexts)[0] ?? "NIN-JOEは次の戦場へ向かう。";
}

function clampNinjo(value: number): number {
  return Math.max(0, Math.min(5, value));
}

function isTravelChoiceDisabled(effect: TravelChoiceEffect): boolean {
  return (effect.type === "hpForNinjo" || effect.type === "hpForNextBattleSpirit") && state.playerHp <= effect.hpCost;
}

function hpPercent(current: number, max: number): string {
  return `${Math.max(0, Math.min(100, (current / max) * 100))}%`;
}

function currentEnemy(): Enemy {
  return enemies[state.battleNumber - 1] ?? enemies[0];
}

function nextComboCost(): number | null {
  if (state.lastPlayedCost === null || state.lastPlayedCost >= 5) {
    return null;
  }
  return state.lastPlayedCost + 1;
}

function rangeLabel(range: RangeBand): string {
  const labels: Record<RangeBand, string> = {
    far: "遠",
    mid: "中",
    close: "近"
  };
  return labels[range];
}

function rangeClass(range: RangeBand): string {
  return `range-${range}`;
}

function spotClass(battleNumber: number): string {
  return `spot-${battleNumber}`;
}

function enemyClassName(name: string): string {
  return name
    .toLowerCase()
    .replace(/の/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stepCloser(range: RangeBand): RangeBand {
  if (range === "far") {
    return "mid";
  }
  if (range === "mid") {
    return "close";
  }
  return "close";
}

function stepFarther(range: RangeBand): RangeBand {
  if (range === "close") {
    return "mid";
  }
  if (range === "mid") {
    return "far";
  }
  return "far";
}

function advanceEnemy(): void {
  const previousRange = state.range;
  state.range = stepCloser(state.range);
  if (state.range !== previousRange) {
    state.log.unshift(`敵が間合いを詰め、${rangeLabel(state.range)}になった。`);
  }
}

function knockBackEnemy(): void {
  const previousRange = state.range;
  state.range = stepFarther(state.range);
  if (state.range !== previousRange) {
    state.log.unshift(`ノックバック。敵との間合いが${rangeLabel(state.range)}へ離れた。`);
  }
}

function comboLabel(): string {
  const nextCost = nextComboCost();
  if (state.comboCount > 1) {
    return nextCost === null ? `Combo ${state.comboCount}` : `Combo ${state.comboCount} / Next ${nextCost}`;
  }
  if (nextCost !== null) {
    return `Next ${nextCost}`;
  }
  return "No Combo";
}

function createCombatCue(options: {
  card: Card;
  isCombo: boolean;
  dealtDamage: number;
  gainedBlock: number;
  gainedSpirit: number;
  brokenBlock: number;
  knockedBack: boolean;
}): CombatCue {
  const kind = combatCueKind(options.card, options.knockedBack);
  const detailParts: string[] = [];

  if (options.dealtDamage > 0) {
    detailParts.push(`${options.dealtDamage} dmg`);
  }
  if (options.gainedBlock > 0) {
    detailParts.push(`Block +${options.gainedBlock}`);
  }
  if (options.gainedSpirit > 0) {
    detailParts.push(`胆力 +${options.gainedSpirit}`);
  }
  if (options.brokenBlock > 0) {
    detailParts.push(`崩し ${options.brokenBlock}`);
  }
  if (options.knockedBack) {
    detailParts.push("ノックバック");
  }

  return {
    kind,
    label: options.isCombo ? `Combo ${state.comboCount}: ${options.card.name}` : options.card.name,
    detail: detailParts.join(" / ") || "構え",
    combo: options.isCombo
  };
}

function combatCueKind(card: Card, knockedBack: boolean): CombatCue["kind"] {
  if (knockedBack) {
    return "knockback";
  }
  if (card.ranged) {
    return "ranged";
  }
  if (card.damage) {
    return "melee";
  }
  if (card.spiritGain) {
    return "spirit";
  }
  return "block";
}

function combatCueClass(cue: CombatCue | null): string {
  if (!cue) {
    return "";
  }
  return `cue-${cue.kind}${cue.combo ? " cue-combo" : ""}`;
}

function render(): void {
  const resultClass = state.status === "won" ? "is-won" : state.status === "lost" ? "is-lost" : "";
  const currentActBattle = actOneBattleFor(state.battleNumber);

  app.innerHTML = `
    <main class="shell ${resultClass}">
      <section class="topbar" aria-label="Run status">
        <div>
          <p class="eyebrow">Act 1 / ${currentActBattle.spot}</p>
          <h1>NIN-JOE: ARAKURE ISLAND</h1>
        </div>
        <button class="ghost-button" data-action="reset">New Run</button>
      </section>

      <section class="battlefield ${spotClass(state.battleNumber)} ${rangeClass(state.range)} ${combatCueClass(state.combatCue)}" aria-label="Battlefield">
        <article class="combatant player">
          <div class="combatant-header">
            <span>NIN-JOE</span>
            <strong>${state.playerHp}/${state.playerMaxHp}</strong>
          </div>
          ${renderFighterFigure("player", "NIN-JOE", "人情黒帯")}
          <div class="meter"><span style="width: ${hpPercent(state.playerHp, state.playerMaxHp)}"></span></div>
          <div class="stat-row">
            <span>Block ${state.playerBlock}</span>
            <span>胆力 ${state.spirit}/${state.maxSpirit}</span>
            <span>人情 ${state.ninjo}</span>
          </div>
        </article>

        <div class="versus">
          <span>Battle ${state.battleNumber}/${enemies.length}<br>Turn ${state.turn}</span>
          <strong class="range-pill">間合い ${rangeLabel(state.range)}</strong>
          ${renderCombatCue()}
        </div>

        <article class="combatant enemy">
          <div class="combatant-header">
            <span>${state.enemyName}</span>
            <strong>${state.enemyHp}/${state.enemyMaxHp}</strong>
          </div>
          ${renderFighterFigure("enemy", state.enemyName, currentEnemy().role)}
          <div class="meter enemy-meter"><span style="width: ${hpPercent(state.enemyHp, state.enemyMaxHp)}"></span></div>
          <div class="stat-row">
            <span>Block ${state.enemyBlock}</span>
            <span>${currentEnemy().role}</span>
          </div>
          <div class="stat-row route-note">
            <span>Spot</span>
            <span>${currentActBattle.routeNote}</span>
          </div>
          ${renderEnemyIntent(state.enemyIntent)}
        </article>
      </section>

      <section class="hand-area" aria-label="Hand">
        <div class="section-heading">
          <h2>Hand <span class="combo-status">${comboLabel()}</span></h2>
          <button class="primary-button" data-action="end-turn">End Turn</button>
        </div>
        <div class="hand">
          ${state.hand.map(renderCard).join("")}
        </div>
      </section>

      <section class="lower-panels">
        <article>
          <h2>Piles</h2>
          <div class="pile-grid">
            <span>Draw <strong>${state.drawPile.length}</strong></span>
            <span>Discard <strong>${state.discardPile.length}</strong></span>
            <span>Exhaust <strong>${state.exhausted.length}</strong></span>
          </div>
        </article>
        <article>
          <h2>Log</h2>
          <ol class="log">
            ${state.log.slice(0, 5).map((entry) => `<li>${entry}</li>`).join("")}
          </ol>
        </article>
      </section>

      ${state.status !== "playing" ? renderOverlay() : ""}
    </main>
  `;

  app.querySelectorAll<HTMLButtonElement>("[data-card-id]").forEach((button) => {
    button.addEventListener("click", () => playCard(button.dataset.cardId ?? ""));
  });

  app.querySelector<HTMLButtonElement>("[data-action='end-turn']")?.addEventListener("click", endTurn);
  app.querySelector<HTMLButtonElement>("[data-action='reset']")?.addEventListener("click", resetGame);
  app.querySelector<HTMLButtonElement>("[data-action='skip-reward']")?.addEventListener("click", () => chooseReward(null));
  app.querySelectorAll<HTMLButtonElement>("[data-reward-id]").forEach((button) => {
    button.addEventListener("click", () => chooseReward(button.dataset.rewardId ?? null));
  });
  app.querySelector<HTMLButtonElement>("[data-action='continue-travel']")?.addEventListener("click", proceedFromTravel);
  app.querySelectorAll<HTMLButtonElement>("[data-travel-choice-id]").forEach((button) => {
    button.addEventListener("click", () => chooseTravelOption(button.dataset.travelChoiceId ?? ""));
  });
}

function renderCombatCue(): string {
  if (!state.combatCue) {
    return "";
  }

  return `
    <div class="combat-cue ${state.combatCue.combo ? "is-combo" : ""}" aria-live="polite">
      <strong>${state.combatCue.label}</strong>
      <small>${state.combatCue.detail}</small>
    </div>
  `;
}

function renderFighterFigure(side: "player" | "enemy", name: string, label: string): string {
  const figureClass = side === "enemy" ? `fighter enemy-figure ${enemyClassName(name)}` : "fighter player-figure";
  const playerSpriteClass = playerSpriteClassForCue(state.combatCue);
  const stageContent =
    side === "player"
      ? `
        <span class="fighter-shadow"></span>
        <span class="fighter-sprite ${playerSpriteClass}"></span>
      `
      : `
        <span class="fighter-shadow"></span>
        <span class="fighter-body"></span>
        <span class="fighter-head"></span>
        <span class="fighter-belt"></span>
        <span class="fighter-arm arm-front"></span>
        <span class="fighter-arm arm-back"></span>
      `;

  return `
    <div class="${figureClass}" aria-label="${name}">
      <div class="fighter-stage">
        ${stageContent}
      </div>
      <div class="fighter-caption">
        <strong>${name}</strong>
        <small>${label}</small>
      </div>
    </div>
  `;
}

function playerSpriteClassForCue(cue: CombatCue | null): string {
  if (state.introCue && !cue) {
    return "ninjoe-intro-bow";
  }
  if (cue?.kind === "block") {
    return "ninjoe-guard";
  }
  if (cue?.kind === "melee") {
    return "ninjoe-attack-light";
  }
  return "ninjoe-idle";
}

function renderCard(card: Card): string {
  const disabled = card.cost > state.spirit ? "disabled" : "";
  const isComboNext = card.cost === nextComboCost() && card.cost <= state.spirit;
  const comboClass = isComboNext ? " combo-next" : "";
  return `
    <button class="card ${card.type}${comboClass}" data-card-id="${card.id}" ${disabled}>
      <span class="cost">${card.cost}</span>
      ${isComboNext ? `<span class="combo-next-label">Combo Next</span>` : ""}
      ${renderCardTags(card)}
      <strong>${card.name}</strong>
      <small>${card.description}</small>
    </button>
  `;
}

function renderCardTags(card: Card): string {
  return `
    <span class="card-tags">
      <span class="card-tag category-${card.category}">${categoryLabel(card.category)}</span>
      <span class="card-tag rarity-${card.rarity}">${card.rarity}</span>
    </span>
  `;
}

function categoryLabel(category: CardCategory): string {
  const labels: Record<CardCategory, string> = {
    melee: "近接",
    guard: "受け",
    knockback: "ノックバック",
    ranged: "投擲",
    spirit: "呼吸",
    combo: "コンボ",
    special: "人情"
  };
  return labels[category];
}

function intentLabel(intent: EnemyIntent): string {
  if (intent.damage > 0) {
    const attackType = intent.ranged ? "遠距離攻撃" : intent.damage >= 14 ? "大技" : "攻撃";
    return `${attackType} ${intent.damage}`;
  }

  const parts = [intent.block ? `防御 ${intent.block}` : "様子見"];
  if (intent.advances) {
    parts.push("接近");
  }
  return parts.join(" + ");
}

function intentKind(intent: EnemyIntent): string {
  if (intent.damage > 0) {
    if (intent.ranged) {
      return "ranged";
    }
    if (intent.damage >= 14) {
      return "heavy";
    }
    return "attack";
  }
  if (intent.block && intent.advances) {
    return "guard-advance";
  }
  if (intent.block) {
    return "guard";
  }
  if (intent.advances) {
    return "advance";
  }
  return "wait";
}

function intentTypeLabel(intent: EnemyIntent): string {
  const labels: Record<string, string> = {
    attack: "攻撃",
    ranged: "遠距離",
    heavy: "大技",
    "guard-advance": "防御接近",
    guard: "防御",
    advance: "接近",
    wait: "待機"
  };
  return labels[intentKind(intent)];
}

function renderEnemyIntent(intent: EnemyIntent): string {
  return `
    <div class="intent-card intent-${intentKind(intent)}">
      <span class="intent-type">${intentTypeLabel(intent)}</span>
      <strong>${intentLabel(intent)}</strong>
      <small>${intent.label}</small>
    </div>
  `;
}

function renderOverlay(): string {
  if (state.status === "reward") {
    return `
      <aside class="reward-panel" aria-live="polite">
        <h2>Choose Reward</h2>
        <div class="reward-grid">
          ${state.rewardOptions.map(renderRewardCard).join("")}
        </div>
        <button class="ghost-button" data-action="skip-reward">Skip</button>
      </aside>
    `;
  }

  if (state.status === "travel") {
    return renderTravelPanel();
  }

  const title = state.status === "won" ? "Act 1 Clear" : "Defeat";
  const message =
    state.status === "won"
      ? "SHOGUNの影は黒い紙片となって崩れた。城門の奥で、本物のSHOGUNが笑っている。"
      : "NIN-JOEは始まりへ戻された。SHOGUNの無限地獄が笑っている。";

  return `
    <aside class="result-panel" aria-live="polite">
      <h2>${title}</h2>
      <p>${message}</p>
      ${
        state.status === "won"
          ? `
            <div class="result-unlock">
              <span>${actOneClearUnlock.label}</span>
              <strong>${actOneClearUnlock.destination}</strong>
              <small>${actOneClearUnlock.description}</small>
            </div>
          `
          : ""
      }
      <button class="primary-button" data-action="reset">New Run</button>
    </aside>
  `;
}

function renderTravelPanel(): string {
  const progressText = `戦闘 ${state.battleNumber} / ${enemies.length} を突破`;
  const nextActBattle = actOneBattleFor(state.battleNumber + 1);
  const eventMarkup =
    state.travelEvent && !state.travelResolved
      ? `
        <div class="travel-event">
          <p class="eyebrow">道中イベント</p>
          <h2>${state.travelEvent.title}</h2>
          <p>${state.travelEvent.body}</p>
          <div class="travel-choice-grid">
            ${state.travelEvent.choices.map(renderTravelChoice).join("")}
          </div>
        </div>
      `
      : `
        <div class="travel-event is-resolved">
          <p>${state.travelMessage}</p>
          <button class="primary-button" data-action="continue-travel">次の戦闘へ</button>
        </div>
      `;

  return `
    <aside class="travel-panel" aria-live="polite">
      <p class="eyebrow">Travel</p>
      <h2>次のスポットへ移動中...</h2>
      <p class="travel-destination">目的地: <strong>${nextActBattle.spot}</strong></p>
      <p>${state.travelText}</p>
      <div class="travel-stats">
        <span>${progressText}</span>
        <span>HP ${state.playerHp}/${state.playerMaxHp}</span>
        <span>人情 ${state.ninjo}</span>
      </div>
      ${eventMarkup}
    </aside>
  `;
}

function renderTravelChoice(choice: TravelEvent["choices"][number]): string {
  const disabled = isTravelChoiceDisabled(choice.effect) ? "disabled" : "";
  const disabledNote = disabled ? `<small>HPが足りない</small>` : `<small>${choice.effectLabel}</small>`;
  return `
    <button class="travel-choice" data-travel-choice-id="${choice.id}" ${disabled}>
      <strong>${choice.label}</strong>
      ${disabledNote}
    </button>
  `;
}

function renderRewardCard(card: Card): string {
  return `
    <button class="card reward-card ${card.type}" data-reward-id="${card.id}">
      <span class="cost">${card.cost}</span>
      ${renderCardTags(card)}
      <strong>${card.name}</strong>
      <small>${card.description}</small>
    </button>
  `;
}

render();
scheduleIntroCueClear();
