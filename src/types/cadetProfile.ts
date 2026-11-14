export type SpecializationId =
  | 'lunar-explorer'
  | 'mars-pioneer'
  | 'space-station-specialist'
  | 'cosmic-scientist';

export type AgeGroup = 'Under 10' | '10–13' | '14–16' | '17+';

export type SpaceDestination =
  | 'Moon'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'International Space Station';

export type AvatarId =
  | 'orbit-helmet'
  | 'lunar-rover'
  | 'star-commander'
  | 'nebula-explorer'
  | 'saturn-pilot'
  | 'nova-bot';

export interface CadetProfile {
  version: number;
  cadetId: string;
  firstName: string;
  fullName?: string;
  callsign: string;
  specialization: SpecializationId;
  avatarId?: AvatarId;
  ageGroup?: AgeGroup;
  favoriteDestination?: SpaceDestination;
  createdAt: string;
  updatedAt: string;
}

export interface CadetRegistrationInput {
  firstName: string;
  fullName?: string;
  callsign: string;
  specialization: SpecializationId;
  avatarId?: AvatarId;
  ageGroup?: AgeGroup;
  favoriteDestination?: SpaceDestination;
}
