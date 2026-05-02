import "./styles.css";
import { starterDeck, rewardCardPool } from "./data/cards";
import { enemies } from "./data/enemies";
import type { Card, Enemy, EnemyIntent, GameState, RangeBand } from "./game/types";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("App root was not found.");
}

const app = appRoot;

let cardInstanceId = 0;
let state = newGame();

function newGame(): GameState {
  cardInstanceId = 0;
  return createBattle({
    runDeck: starterDeck.map(cloneCard),
    battleNumber: 1,
    playerHp: 42,
    log: ["NIN-JOEはARAKURE ISLANDへ踏み込んだ。全てはSHOGUNの罠だった。"]
  });
}

function createBattle(options: { runDeck: Card[]; battleNumber: number; playerHp: number; log: string[] }): GameState {
  const enemy = enemies[options.battleNumber - 1] ?? enemies[0];
  const deck = shuffle([...options.runDeck]);
  const initialState: GameState = {
    playerHp: options.playerHp,
    playerMaxHp: 42,
    playerBlock: 0,
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
    if (state.range === "close") {
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
  return shuffle(rewardCardPool).slice(0, 3).map(cloneCard);
}

function chooseReward(cardId: string | null): void {
  if (state.status !== "reward") {
    return;
  }

  const selectedCard = state.rewardOptions.find((card) => card.id === cardId);
  const nextDeck = selectedCard ? [...state.runDeck, selectedCard] : [...state.runDeck];
  const rewardLog = selectedCard ? `${selectedCard.name}をデッキに加えた。` : "報酬を受け取らず先へ進んだ。";

  state = createBattle({
    runDeck: nextDeck,
    battleNumber: state.battleNumber + 1,
    playerHp: state.playerHp,
    log: [rewardLog, `戦闘${state.battleNumber + 1}開始。`]
  });
  render();
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
          </div>
        </article>

        <div class="versus">
          <span>Battle ${state.battleNumber}<br>Turn ${state.turn}</span>
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
    return `${intent.label}: ${intent.damage} dmg`;
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
