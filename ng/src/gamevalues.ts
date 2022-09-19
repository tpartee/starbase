
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
  stores: Stores = new Stores(null);

  constructor() {}

}

export class Stores {
  public props: Array<string> = ['comp_structure','comp_basic','comp_inter','comp_adv','mat_basic','mat_inter','mat_adv','mat_rare','mat_synth','mat_exotic','mat_crystal','mat_bio','mat_waste','mat_biowaste'];
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

  constructor(oldStore: Stores | null) {
    if (null == oldStore) return;
    this.comp_structure = oldStore.comp_structure;
    this.comp_basic = oldStore.comp_basic;
    this.comp_inter = oldStore.comp_inter;
    this.comp_adv = oldStore.comp_adv;
    this.mat_basic = oldStore.mat_basic;
    this.mat_inter = oldStore.mat_inter;
    this.mat_adv = oldStore.mat_adv;
    this.mat_rare = oldStore.mat_rare;
    this.mat_synth = oldStore.mat_synth;
    this.mat_exotic = oldStore.mat_exotic;
    this.mat_crystal = oldStore.mat_crystal;
    this.mat_bio = oldStore.mat_bio;
    this.mat_waste = oldStore.mat_waste;
    this.mat_biowaste = oldStore.mat_biowaste;
  }

  public getProp(propName: string): number {
    if ('comp_structure' == propName) return this.comp_structure;
    if ('comp_basic' == propName) return this.comp_basic;
    if ('comp_inter' == propName) return this.comp_inter;
    if ('comp_adv' == propName) return this.comp_adv;
    if ('mat_basic' == propName) return this.mat_basic;
    if ('mat_inter' == propName) return this.mat_inter;
    if ('mat_adv' == propName) return this.mat_adv;
    if ('mat_rare' == propName) return this.mat_rare;
    if ('mat_synth' == propName) return this.mat_synth;
    if ('mat_exotic' == propName) return this.mat_exotic;
    if ('mat_crystal' == propName) return this.mat_crystal;
    if ('mat_bio' == propName) return this.mat_bio;
    if ('mat_waste' == propName) return this.mat_waste;
    if ('mat_biowaste' == propName) return this.mat_biowaste;
    return 0;
  }

  public setProp(propName: string, val: number) {
    switch (propName) {
      case 'comp_structure': this.comp_structure = val; return;
      case 'comp_basic': this.comp_basic = val; return;
      case 'comp_inter': this.comp_inter = val; return;
      case 'comp_adv': this.comp_adv = val; return;
      case 'mat_basic': this.mat_basic = val; return;
      case 'mat_inter': this.mat_inter = val; return;
      case 'mat_adv': this.mat_adv = val; return;
      case 'mat_rare': this.mat_rare = val; return;
      case 'mat_synth': this.mat_synth = val; return;
      case 'mat_exotic': this.mat_exotic = val; return;
      case 'mat_crystal': this.mat_crystal = val; return;
      case 'mat_bio': this.mat_bio = val; return;
      case 'mat_waste': this.mat_waste = val; return;
      case 'mat_biowaste': this.mat_biowaste = val; return;
    }
  }

  public addProp(propName: string, val: number) {
    switch (propName) {
      case 'comp_structure': this.comp_structure += val; return;
      case 'comp_basic': this.comp_basic += val; return;
      case 'comp_inter': this.comp_inter += val; return;
      case 'comp_adv': this.comp_adv += val; return;
      case 'mat_basic': this.mat_basic += val; return;
      case 'mat_inter': this.mat_inter += val; return;
      case 'mat_adv': this.mat_adv += val; return;
      case 'mat_rare': this.mat_rare += val; return;
      case 'mat_synth': this.mat_synth += val; return;
      case 'mat_exotic': this.mat_exotic += val; return;
      case 'mat_crystal': this.mat_crystal += val; return;
      case 'mat_bio': this.mat_bio += val; return;
      case 'mat_waste': this.mat_waste += val; return;
      case 'mat_biowaste': this.mat_biowaste += val; return;
    }
  }

  public subProp(propName: string, val: number) {
    switch (propName) {
      case 'comp_structure': this.comp_structure -= val; return;
      case 'comp_basic': this.comp_basic -= val; return;
      case 'comp_inter': this.comp_inter -= val; return;
      case 'comp_adv': this.comp_adv -= val; return;
      case 'mat_basic': this.mat_basic -= val; return;
      case 'mat_inter': this.mat_inter -= val; return;
      case 'mat_adv': this.mat_adv -= val; return;
      case 'mat_rare': this.mat_rare -= val; return;
      case 'mat_synth': this.mat_synth -= val; return;
      case 'mat_exotic': this.mat_exotic -= val; return;
      case 'mat_crystal': this.mat_crystal -= val; return;
      case 'mat_bio': this.mat_bio -= val; return;
      case 'mat_waste': this.mat_waste -= val; return;
      case 'mat_biowaste': this.mat_biowaste -= val; return;
    }
  }

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
