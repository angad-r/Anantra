import { beforeEach, describe, expect, it } from 'vitest';
import { TRAINING_MODULES } from '../data/modules';
import {
  createBlankTrainingState,
  createSampleTrainingState,
} from '../data/traineeSeed';
import {
  computeModuleUnlocks,
  getModuleCompletion,
  getOverallTrainingStats,
  getRankForXp,
} from '../utils/progress';
import {
  STORAGE_KEY,
  clearTrainingState,
  loadTrainingState,
  saveTrainingState,
} from '../utils/storage';

describe('progress utilities', () => {
  it('computes module completion accurately and ignores unknown task ids', () => {
    const academy = TRAINING_MODULES[0];
    const partial = getModuleCompletion(academy, {
      completedTaskIds: [academy.tasks[0].id, 'nonexistent-task'],
    });

    expect(partial.completedCount).toBe(1);
    expect(partial.totalCount).toBe(academy.tasks.length);
    expect(partial.status).toBe('in-progress');
    expect(partial.earnedXp).toBe(academy.tasks[0].xpReward);

    const complete = getModuleCompletion(academy, {
      completedTaskIds: academy.tasks.map((t) => t.id),
    });
    expect(complete.percentage).toBe(100);
    expect(complete.status).toBe('completed');
  });

  it('computes astronaut ranks cleanly across XP boundaries', () => {
    expect(getRankForXp(0).currentRank.title).toBe('Starlight Cadet');
    expect(getRankForXp(170).currentRank.title).toBe('Orbital Apprentice');
    expect(getRankForXp(900).nextRank).toBeNull();
  });

  it('computes real skills, achievements, analytics, and zero fake data from blank vs completed states', () => {
    const blank = createBlankTrainingState();
    const blankStats = getOverallTrainingStats(TRAINING_MODULES, blank);
    expect(blankStats.totalXp).toBe(0);
    expect(blankStats.overallPercentage).toBe(0);
    expect(blankStats.earnedPatches).toHaveLength(0);
    expect(blankStats.analytics.totalSimAttempts).toBe(0);
    expect(blankStats.analytics.averageBestScorePercent).toBeNull();
    expect(blankStats.analytics.earnedAchievementsCount).toBe(0);
    expect(blankStats.skillScores).toHaveLength(5);
    expect(blankStats.skillScores.every((s) => s.percentage === 0)).toBe(true);

    const sample = createSampleTrainingState();
    const sampleStats = getOverallTrainingStats(TRAINING_MODULES, sample);
    expect(sampleStats.totalXp).toBeGreaterThan(0);
    expect(sampleStats.inProgressModulesCount).toBe(2);
    expect(sampleStats.analytics.academyLessonsStudied).toBe(3);

    // Academy scholar achievement unlocks at >= 7/10 mastery score
    const scholarState = createBlankTrainingState();
    scholarState.academyBestQuizScore = 7;
    const scholarStats = getOverallTrainingStats(TRAINING_MODULES, scholarState);
    expect(
      scholarStats.achievements.find((a) => a.id === 'ach-academy-scholar')
        ?.earned,
    ).toBe(true);
  });

  it('enforces sequential module prerequisites when guidedProgression is enabled and unlocks all when off', () => {
    const state = createBlankTrainingState();
    const summaries = Object.fromEntries(
      TRAINING_MODULES.map((m) => [
        m.id,
        getModuleCompletion(m, state.progressByModule[m.id]),
      ]),
    ) as Parameters<typeof computeModuleUnlocks>[0];

    state.guidedProgression = false;
    const openUnlocks = computeModuleUnlocks(summaries, state);
    expect(openUnlocks['spacewalk-training'].unlocked).toBe(true);
    expect(openUnlocks['emergency-training'].unlocked).toBe(true);

    state.guidedProgression = true;
    const lockedUnlocks = computeModuleUnlocks(summaries, state);
    expect(lockedUnlocks.academy.unlocked).toBe(true);
    expect(lockedUnlocks['ai-mentor'].unlocked).toBe(true);
    expect(lockedUnlocks['mission-control'].unlocked).toBe(false);
    expect(lockedUnlocks['spacewalk-training'].unlocked).toBe(false);
    expect(lockedUnlocks['emergency-training'].unlocked).toBe(false);
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => {
    clearTrainingState();
  });

  it('saves and reloads valid training state', () => {
    const sample = createSampleTrainingState();
    expect(saveTrainingState(sample)).toBe(true);

    const loaded = loadTrainingState();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.state?.profile.callsign).toBe('NOVA-07');
      expect(loaded.state?.version).toBe(2);
    }
  });

  it('normalizes legacy v1 training state cleanly with empty telemetry arrays', () => {
    const v1Sample = createSampleTrainingState();
    const legacyJson = JSON.stringify({
      version: 1,
      profile: v1Sample.profile,
      progressByModule: v1Sample.progressByModule,
      updatedAt: v1Sample.updatedAt,
    });
    window.localStorage.setItem(STORAGE_KEY, legacyJson);

    const loaded = loadTrainingState();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.state?.version).toBe(2);
      expect(loaded.state?.guidedProgression).toBe(false);
      expect(loaded.state?.activityHistory).toEqual([]);
      expect(loaded.state?.moduleRecords).toEqual({});
    }
  });

  it('returns an error result when localStorage contains corrupted JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-valid-json');
    const loaded = loadTrainingState();
    expect(loaded.ok).toBe(false);
  });

  it('returns an error result when localStorage schema is invalid', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 'bad' }));
    const loaded = loadTrainingState();
    expect(loaded.ok).toBe(false);
  });
});
