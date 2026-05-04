import "./styles.css";
import { starterDeck, rewardCardPool } from "./data/cards";
import { enemies } from "./data/enemies";
import { travelEvents, travelTexts } from "./data/travelEvents";
import type {
  Card,
  CardCategory,
  CardRarity,
  Enemy,
  EnemyIntent,
  GameState,
  RangeBand,
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

function newGame(): GameState {
  cardInstanceId = 0;
  return createBattle({
    runDeck: starterDeck.map(cloneCard),
    battleNumber: 1,
    playerHp: 42,
    ninjo: 1,
    log: ["NIN-JOEはARAKURE ISLANDへ踏み込んだ。全てはSHOGUNの罠だった。"]
  });
}

function createBattle(options: { runDeck: Card[]; battleNumber: number; playerHp: number; ninjo: number; log: string[] }): GameState {
  const enemy = enemies[options.battleNumber - 1] ?? enemies[0];
  const deck = shuffle([...options.runDeck]);
  const initialState: GameState = {
    playerHp: options.playerHp,
    playerMaxHp: 42,
    playerBlock: 0,
    ninjo: options.ninjo,
    spirit: 3,
    maxSpirit: 3,
    battleNumber: options.battleNumber,
    enemyName: enemy.name,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.hp,
    enemyBlock: 0,
    enemyIntent: pickEnemyIntent(enemy, 1),
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

function pickEnemyIntent(enemy: Enemy, turn: number): EnemyIntent {
  return enemy.pattern[(turn - 1) % enemy.pattern.length];
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

  const cardIndex = state.hand.findIndex((card) => card.id === cardId);
  const card = state.hand[cardIndex];
  if (!card || card.cost > state.spirit) {
    return;
  }

  const isCombo = state.lastPlayedCost !== null && card.cost === state.lastPlayedCost + 1;
  state.spirit -= card.cost;
  state.comboCount = isCombo ? state.comboCount + 1 : 1;
  state.lastPlayedCost = card.cost;

  const comboPrefix = isCombo ? `コンボ${state.comboCount}。` : "";

  if (card.damage) {
    if (!card.ranged) {
      state.range = "close";
    }
    const baseDamage = isCombo && card.comboDamage ? card.comboDamage : card.damage;
    const damage = Math.max(0, baseDamage - state.enemyBlock);
    state.enemyBlock = Math.max(0, state.enemyBlock - baseDamage);
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    const attackVerb = card.ranged ? "投げつけ" : "踏み込み";
    state.log.unshift(`${comboPrefix}${card.name}を${attackVerb}、${damage}ダメージを与えた。`);

    if (card.blockBreak) {
      const brokenBlock = Math.min(state.enemyBlock, card.blockBreak);
      state.enemyBlock -= brokenBlock;
      if (brokenBlock > 0) {
        state.log.unshift(`${card.name}で敵のブロックを${brokenBlock}崩した。`);
      }
    }

    if (card.knockback) {
      knockBackEnemy();
    }
  }

  if (card.block) {
    const block = isCombo && card.comboBlock ? card.comboBlock : card.block;
    state.playerBlock += block;
    state.log.unshift(`${comboPrefix}${card.name}でブロックを${block}得た。`);
  }

  if (card.spiritGain) {
    const spiritGain = isCombo && card.comboSpiritGain ? card.comboSpiritGain : card.spiritGain;
    state.spirit = Math.min(state.maxSpirit, state.spirit + spiritGain);
    state.log.unshift(`${comboPrefix}${card.name}で胆力を${spiritGain}回復した。`);
  }

  state.hand.splice(cardIndex, 1);
  state.discardPile.push(card);

  if (state.enemyHp <= 0) {
    if (state.battleNumber >= enemies.length) {
      state.status = "won";
      state.log.unshift("勝利。NIN-JOEは荒くれの包囲を突破した。");
    } else {
      state.status = "reward";
      state.rewardOptions = rollRewardCards();
      state.log.unshift("勝利。報酬カードを1枚選べる。");
    }
  }

  render();
}

function endTurn(): void {
  if (state.status !== "playing") {
    return;
  }

  state.discardPile.push(...state.hand);
  state.hand = [];

  if (state.enemyIntent.damage > 0) {
    if (state.range === "close" || state.enemyIntent.ranged) {
      const incomingDamage = Math.max(0, state.enemyIntent.damage - state.playerBlock);
      state.playerBlock = Math.max(0, state.playerBlock - state.enemyIntent.damage);
      state.playerHp = Math.max(0, state.playerHp - incomingDamage);
      state.log.unshift(`敵の${state.enemyIntent.label}。${incomingDamage}ダメージを受けた。`);
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
    render();
    return;
  }

  state.turn += 1;
  state.spirit = state.maxSpirit;
  state.playerBlock = 0;
  state.lastPlayedCost = null;
  state.comboCount = 0;
  state.enemyIntent = pickEnemyIntent(currentEnemy(), state.turn);
  drawCards(state, 5);
  state.log.unshift(`ターン${state.turn}開始。`);
  render();
}

function resetGame(): void {
  state = newGame();
  render();
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

  state.runDeck = nextDeck;
  state.rewardOptions = [];
  state.travelText = pickTravelText();
  state.travelEvent = rollTravelEvent();
  state.travelResolved = state.travelEvent === null;
  state.travelMessage = state.travelEvent ? "道中で何かが起きた。" : "道中は静かだった。NIN-JOEは歩を止めない。";
  state.status = "travel";
  state.log.unshift(rewardLog);
  render();
}

function proceedFromTravel(): void {
  if (state.status !== "travel" || !state.travelResolved) {
    return;
  }

  const nextBattleNumber = state.battleNumber + 1;
  const travelLog = state.travelMessage;
  state = createBattle({
    runDeck: state.runDeck,
    battleNumber: nextBattleNumber,
    playerHp: state.playerHp,
    ninjo: state.ninjo,
    log: [travelLog, `戦闘${nextBattleNumber}開始。`]
  });
  render();
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

  return `${label}。NIN-JOEは先へ進んだ。`;
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

function pickTravelText(): string {
  return shuffle(travelTexts)[0] ?? "NIN-JOEは次の戦場へ向かう。";
}

function clampNinjo(value: number): number {
  return Math.max(0, Math.min(5, value));
}

function isTravelChoiceDisabled(effect: TravelChoiceEffect): boolean {
  return effect.type === "hpForNinjo" && state.playerHp <= effect.hpCost;
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

function render(): void {
  const resultClass = state.status === "won" ? "is-won" : state.status === "lost" ? "is-lost" : "";

  app.innerHTML = `
    <main class="shell ${resultClass}">
      <section class="topbar" aria-label="Run status">
        <div>
          <p class="eyebrow">Prototype Run</p>
          <h1>NIN-JOE: ARAKURE ISLAND</h1>
        </div>
        <button class="ghost-button" data-action="reset">New Run</button>
      </section>

      <section class="battlefield" aria-label="Battlefield">
        <article class="combatant player">
          <div class="combatant-header">
            <span>NIN-JOE</span>
            <strong>${state.playerHp}/${state.playerMaxHp}</strong>
          </div>
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
        </div>

        <article class="combatant enemy">
          <div class="combatant-header">
            <span>${state.enemyName}</span>
            <strong>${state.enemyHp}/${state.enemyMaxHp}</strong>
          </div>
          <div class="meter enemy-meter"><span style="width: ${hpPercent(state.enemyHp, state.enemyMaxHp)}"></span></div>
          <div class="stat-row">
            <span>Block ${state.enemyBlock}</span>
            <span>${currentEnemy().role}</span>
          </div>
          <div class="stat-row">
            <span>Intent</span>
            <span>${intentLabel(state.enemyIntent)}</span>
          </div>
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

function renderCard(card: Card): string {
  const disabled = card.cost > state.spirit ? "disabled" : "";
  const isComboNext = card.cost === nextComboCost() && card.cost <= state.spirit;
  const comboClass = isComboNext ? " combo-next" : "";
  return `
    <button class="card ${card.type}${comboClass}" data-card-id="${card.id}" ${disabled}>
      <span class="cost">${card.cost}</span>
      ${isComboNext ? `<span class="combo-next-label">Combo Next</span>` : ""}
      <strong>${card.name}</strong>
      <small>${card.description}</small>
    </button>
  `;
}

function intentLabel(intent: EnemyIntent): string {
  if (intent.damage > 0) {
    return `${intent.label}: ${intent.damage} dmg${intent.ranged ? " ranged" : ""}`;
  }

  const parts = [`${intent.label}: ${intent.block ? "block" : "wait"}`];
  if (intent.advances) {
    parts.push("advance");
  }
  return parts.join(" + ");
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

  const title = state.status === "won" ? "Victory" : "Defeat";
  const message =
    state.status === "won"
      ? "荒くれの包囲を突破した。だがSHOGUNの地獄はまだ終わらない。"
      : "NIN-JOEは始まりへ戻された。SHOGUNの無限地獄が笑っている。";

  return `
    <aside class="result-panel" aria-live="polite">
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="primary-button" data-action="reset">New Run</button>
    </aside>
  `;
}

function renderTravelPanel(): string {
  const progressText = `戦闘 ${state.battleNumber} / ${enemies.length} を突破`;
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
      <strong>${card.name}</strong>
      <small>${card.description}</small>
    </button>
  `;
}

render();
