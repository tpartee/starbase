
export class GameValues {
  day: number = 0;
  trade_creds: number = 0;
  union_creds: number = 0;
  life_support_total: number = 0;
  life_support_used: number = 0;
  power_total: number = 0;
  power_used: number = 0;
  compute_total: number = 0;
  compute_used: number = 0;
  hab_cramped_total: number = 0;
  hab_basic_total: number = 0;
  hab_luxury_total: number = 0;
  hab_all_total: number = 0;
  hab_cramped_avail: number = 0;
  hab_basic_avail: number = 0;
  hab_luxury_avail: number = 0;
  hab_all_avail: number = 0;
  staff_command_total: number = 0;
  staff_security_total: number = 0;
  staff_engineer_total: number = 0;
  staff_medic_total: number = 0;
  staff_worker_total: number = 0;
  staff_total: number = 0;
  staff_command_avail: number = 0;
  staff_security_avail: number = 0;
  staff_engineer_avail: number = 0;
  staff_medic_avail: number = 0;
  staff_worker_avail: number = 0;
  storage_total: number = 0;
  storage_used: number = 0;
  stores: IStores = {
    mat_basic: 0,
    mat_inter: 0,
    mat_adv: 0,
    mat_rare: 0,
    mat_synth: 0,
    mat_exotic: 0,
    mat_crystal: 0,
    mat_waste: 0,
    mat_bio: 0,
    mat_biowaste: 0,
    comp_structure: 0,
    comp_basic: 0,
    comp_inter: 0,
    comp_adv: 0
  };

  constructor() {}

}

export interface IStores {
  comp_structure: number;
  comp_basic: number;
  comp_inter: number;
  comp_adv: number;
  mat_basic: number;
  mat_inter: number;
  mat_adv: number;
  mat_rare: number;
  mat_synth: number;
  mat_exotic: number;
  mat_crystal: number;
  mat_bio: number;
  mat_waste: number;
  mat_biowaste: number;
}
