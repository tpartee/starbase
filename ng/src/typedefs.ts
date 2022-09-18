
// Represents a module on the game board
export interface IBoardModule {
  id: number;
  type: string;   // This maps to IModuleDefinition.name
  left: number;
  top: number;
  level: number;
  isBuilt: boolean;
  buildDaysLeft: number;
  rotation: number;
  imgVariant: number;
  isActive: boolean;
  assigned_command: number;
  assigned_security: number;
  assigned_engineer: number;
  assigned_medic: number;
  assigned_worker: number;
  traversalConnections: Array<number>;
  neighbors: Array<number>;
}

export type TileLookup = {
  [index: string]: number;
}

export type TraversalLookup = {
  [index: string]: Array<string>;
}

// Represents the base definition of each module
export interface IModuleDefinition {
  name: string;
  display: string;
  desc: string;
  width: number;
  height: number;
  type: string;
  buildable: boolean;
  passthrough: boolean;
  doorway: boolean;
  exterior: boolean;
  image_urls: Array<string>;
  connections: Array<string>;
  construction: IConstructions;
  consumers: IConsumers;
  producers: IProducers;
}

export type ModuleLookup = {
  [index: string]: IModuleDefinition;
}

// Represents various construction costs for modules
export interface IConstructions {
  days: number;

  comp_structure?: number;
  comp_basic?: number;
  comp_inter?: number;
  comp_adv?: number;
  mat_basic?: number;
  mat_inter?: number;
  mat_adv?: number;
  mat_rare?: number;
  mat_synth?: number;
  mat_exotic?: number;
  mat_crystal?: number;
  mat_bio?: number;
}

// Represents various consumption types for modules
export interface IConsumers {
  power?: number;
  'power-standby'?: number;
  'power-active'?: number;
  compute?: number;

  comp_structure?: number;
  comp_basic?: number;
  comp_inter?: number;
  comp_adv?: number;
  mat_basic?: number;
  mat_inter?: number;
  mat_adv?: number;
  mat_rare?: number;
  mat_synth?: number;
  mat_exotic?: number;
  mat_crystal?: number;
  mat_bio?: number;
  mat_waste?: number;
  mat_biowaste?: number;

  staff_engineer?: number;
  staff_engineer_min?: number;
  staff_engineer_max?: number;
  staff_medic?: number;
  staff_medic_min?: number;
  staff_medic_max?: number;
  staff_security?: number;
  staff_security_min?: number;
  staff_security_max?: number;
  staff_worker?: number;
  staff_worker_min?: number;
  staff_worker_max?: number;
}

// Represents various production values for modules
export interface IProducers {
  power?: number;
  compute?: number;
  hab_cramped?: number;
  hab_basic?: number;
  hab_luxury?: number;
  prisoners?: number;
  life_support?: number;
  storage?: number;

  comp_structure?: number;
  comp_basic?: number;
  comp_inter?: number;
  comp_adv?: number;
  mat_basic?: number;
  mat_inter?: number;
  mat_adv?: number;
  mat_rare?: number;
  mat_synth?: number;
  mat_exotic?: number;
  mat_crystal?: number;
  mat_bio?: number;
  mat_waste?: number;
  mat_biowaste?: number;
}

export interface ICursor {
  left: number;
  top: number;
  isShown: boolean;
}
