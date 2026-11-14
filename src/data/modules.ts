import {
  Bot,
  Compass,
  GraduationCap,
  Orbit,
  Radio,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { academyData } from '../features/academy/academyData';
import { aiMentorData } from '../features/ai-mentor/aiMentorData';
import { emergencyData } from '../features/emergency-training/emergencyData';
import { missionControlData } from '../features/mission-control/missionControlData';
import { spacewalkData } from '../features/spacewalk-training/spacewalkData';
import { zeroGravityLabData } from '../features/zero-gravity-lab/zeroGravityData';
import type { FeatureModuleData, ModuleId } from '../types/training';

export interface RegisteredModule extends FeatureModuleData {
  icon: LucideIcon;
}

export const TRAINING_MODULES: RegisteredModule[] = [
  { ...academyData, icon: GraduationCap },
  { ...missionControlData, icon: Radio },
  { ...zeroGravityLabData, icon: Orbit },
  { ...spacewalkData, icon: Compass },
  { ...emergencyData, icon: ShieldAlert },
  { ...aiMentorData, icon: Bot },
];

export const MODULE_BY_ID: Record<ModuleId, RegisteredModule> =
  TRAINING_MODULES.reduce(
    (acc, mod) => {
      acc[mod.id] = mod;
      return acc;
    },
    {} as Record<ModuleId, RegisteredModule>,
  );

export function getModuleById(id: ModuleId): RegisteredModule {
  return MODULE_BY_ID[id];
}
