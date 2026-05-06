import type { Card } from "./game/types";

export type SoundId =
  | "card_select"
  | "melee_hit"
  | "kick_heavy"
  | "guard"
  | "throw"
  | "block_break"
  | "breath"
  | "combo"
  | "enemy_attack"
  | "knockback"
  | "reward"
  | "travel"
  | "event"
  | "act_clear"
  | "defeat";

const soundFiles: Record<SoundId, string> = {
  card_select: "/assets/audio/se/card_select.mp3",
  melee_hit: "/assets/audio/se/melee_hit.mp3",
  kick_heavy: "/assets/audio/se/kick_heavy.mp3",
  guard: "/assets/audio/se/guard.mp3",
  throw: "/assets/audio/se/throw.mp3",
  block_break: "/assets/audio/se/block_break.mp3",
  breath: "/assets/audio/se/breath.mp3",
  combo: "/assets/audio/se/combo.mp3",
  enemy_attack: "/assets/audio/se/enemy_attack.mp3",
  knockback: "/assets/audio/se/knockback.mp3",
  reward: "/assets/audio/se/reward.mp3",
  travel: "/assets/audio/se/travel.mp3",
  event: "/assets/audio/se/event.mp3",
  act_clear: "/assets/audio/se/act_clear.mp3",
  defeat: "/assets/audio/se/defeat.mp3"
};

const unavailableSounds = new Set<SoundId>();

export function playSound(soundId: SoundId): void {
  if (unavailableSounds.has(soundId)) {
    return;
  }

  const src = soundFiles[soundId];
  const audio = new Audio(src);
  audio.volume = 0.45;
  audio.addEventListener("error", () => unavailableSounds.add(soundId), { once: true });
  void audio.play().catch(() => {
    unavailableSounds.add(soundId);
  });
}

export function playCardSound(card: Card, options: { isCombo: boolean; brokenBlock: number }): void {
  if (options.isCombo) {
    playSound("combo");
    return;
  }

  if (options.brokenBlock > 0) {
    playSound("block_break");
    return;
  }

  if (card.knockback) {
    playSound("knockback");
    return;
  }

  if (card.ranged) {
    playSound("throw");
    return;
  }

  if (card.spiritGain) {
    playSound("breath");
    return;
  }

  if (card.block) {
    playSound("guard");
    return;
  }

  if (card.cost >= 2) {
    playSound("kick_heavy");
    return;
  }

  playSound("melee_hit");
}
