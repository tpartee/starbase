
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
  stores: Stores = new Stores;

  constructor() {}

}

export class Stores {
  public comp_structure: number = 0;
  public comp_basic: number = 0;
  public comp_inter: number = 0;
  public comp_adv: number = 0;
  public mat_basic: number = 0;
  public mat_inter: number = 0;
  public mat_adv: number = 0;
  public mat_rare: number = 0;
  public mat_synth: number = 0;
  public mat_exotic: number = 0;
  public mat_crystal: number = 0;
  public mat_bio: number = 0;
  public mat_waste: number = 0;
  public mat_biowaste: number = 0;

  public totalUsed(): number {
    return Math.ceil( this.comp_structure )
         + Math.ceil( this.comp_adv )
         + Math.ceil( this.comp_basic )
         + Math.ceil( this.comp_inter )
         + Math.ceil( this.comp_adv )
         + Math.ceil( this.mat_basic )
         + Math.ceil( this.mat_inter )
         + Math.ceil( this.mat_adv )
         + Math.ceil( this.mat_rare )
         + Math.ceil( this.mat_synth )
         + Math.ceil( this.mat_exotic )
         + Math.ceil( this.mat_crystal )
         + Math.ceil( this.mat_bio )
         + Math.ceil( this.mat_waste )
         + Math.ceil( this.mat_biowaste );
  }
}
