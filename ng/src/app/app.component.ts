import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IBoardModule, ICursor, IModuleDefinition, ModuleLookup, TileLookup } from 'src/typedefs';
import { GameValues } from 'src/gamevalues';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'starbase';
  areModulesLoaded: boolean = false;
  isMapLoaded: boolean = false;
  isFullyLoaded: boolean = false;
  isShowingGameboard: boolean = false;
  cursor: ICursor = { left: 0, top: 0, isShown: false };
  moduleList: Array<IModuleDefinition> = [];   // Module Definition List (from modules.json)
  moduleLookup: ModuleLookup = {};             // Fast look-up for ModuleDefinitions by name
  boardModules: Array<IBoardModule> = [];      // Modules on the game board, even if not built yet
  displayModules: Array<IBoardModule> = [];    // Modules VISIBLE on the game board's current level
  currentLevel: number = 0;                    // Which level or "vertical slice" of the base is being viewed right now
  tileLookup: TileLookup = {};                 // Fast look-up for mouse position over tile
  gameValues: GameValues = new GameValues();   // Stores game state values, including storage numbers
  selectedTool: string = '';                   // The currently selected 'paint' tool
  buildQueue: Array<number> = [];              // Current order of building defined by user using Build tool
  mapT: number = -30;
  mapL: number = -30;
  mapB: number =  30;
  mapR: number =  30;

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.LoadModules();
    this.LoadMap();
  }



  // Internal Methods

  LoadModules() {
    this.http.get<Array<IModuleDefinition>>('assets/json/modules.json').subscribe({
      next: (value) => {
        console.log('LoadModules(): received data');
        this.moduleList = value;
        this.moduleList.forEach(mod => this.moduleLookup[mod.name] = mod);
        this.areModulesLoaded = true;
        this.CheckLoadComplete();
      },
      error: (err) => { console.log('LoadModules(): error: ',err) },
      complete: () => { console.log('LoadModules(): complete') }
    });
  }

  LoadMap() {
    // Corridors (in a + shape)
    this.addModule('passage_corridor',  0,  0, 0, 1, true);
    this.addModule('passage_corridor',  0, -2, 0, 1, true);
    this.addModule('passage_corridor',  0, -1, 0, 1, true);
    this.addModule('passage_corridor',  0,  1, 0, 1, true);
    this.addModule('passage_corridor',  0,  2, 0, 1, true);
    this.addModule('passage_corridor', -2,  0, 0, 1, true);
    this.addModule('passage_corridor', -1,  0, 0, 1, true);
    this.addModule('passage_corridor',  1,  0, 0, 1, true);
    this.addModule('passage_corridor',  2,  0, 0, 1, true);
    // Modules
    this.addModule('quarters_cramped_small',          0, 0, 0, 1, true);
    this.addModule('command_cramped',                 0, 0, 0, 1, true);
    this.addModule('reactor_crystal_tiny',            0, 0, 0, 1, true);
    this.addModule('compute_core_tiny',               0, 0, 0, 1, true);
    this.addModule('storage_tiny',                    0, 0, 0, 1, true);
    this.addModule('fabrication_structure_tiny',      0, 0, 0, 1, true);
    this.addModule('fabrication_basic_tiny',          0, 0, 0, 1, true);
    this.addModule('recycle_bio_tiny',                0, 0, 0, 1, true);
    this.addModule('airlock_tiny',                    0, 0, 0, 1, true);
    this.addModule('life_support_tiny',               0, 0, 0, 1, true);
    this.addModule('sensors_rudimentary',             0, 0, 0, 1, true);
    this.addModule('entertainment_mess_hall_cramped', 0, 0, 0, 1, true);
    // Weapons, Shields, Docks
    this.addModule('dock_small',           0, 0, 0, 2, true);
    this.addModule('dock_small',           0, 0, 0, 4, true);
    this.addModule('shield_emitter_small', 0, 0, 0, 1, true);
    this.addModule('shield_emitter_small', 0, 0, 0, 3, true);
    this.addModule('phasor_light',         0, 0, 0, 1, true);
    this.addModule('phasor_light',         0, 0, 0, 3, true);

    this.RefreshUIFromBoard();

    // Set initial game values:
    this.gameValues.day = 1;
    //   storage: 100 basic mats, 50 inter mats, 15 crystals, 35 bio mats, 50 struct comps, 10 basic comps, 10 inter comps
    this.gameValues.stores.mat_basic      = 100;
    this.gameValues.stores.mat_inter      = 50;
    this.gameValues.stores.mat_crystal    = 15;
    this.gameValues.stores.mat_bio        = 35;
    this.gameValues.stores.comp_structure = 50;
    this.gameValues.stores.comp_basic     = 10;
    this.gameValues.stores.comp_inter     = 10;
    //   staff: 1 command, 1 medic, 2 security, 4 engineer
    this.gameValues.staff_command_total  = this.gameValues.staff_command_avail  = 1;
    this.gameValues.staff_security_total = this.gameValues.staff_security_avail = 2;
    this.gameValues.staff_medic_total    = this.gameValues.staff_medic_avail    = 1;
    this.gameValues.staff_engineer_total = this.gameValues.staff_engineer_avail = 4;
    //   50 trade creds, 20 union creds
    this.gameValues.trade_creds = 50;
    this.gameValues.union_creds = 20;

    this.isMapLoaded = true;
    this.CheckLoadComplete();
  }

  CheckLoadComplete() {
    if (this.areModulesLoaded && this.isMapLoaded) {
      this.isFullyLoaded = true;
      this.isShowingGameboard = true;
      console.log('All Loading Completed!');
    }
  }

  RefreshUIFromBoard() {   // Refresh UI values based on current game board
    const gv = this.gameValues;
    gv.power_total = 0;
    gv.power_used = 0;
    gv.compute_total = 0;
    gv.compute_used = 0;
    gv.life_support_total = 0;
    this.boardModules.forEach(module => {
      const def = this.moduleLookup[module.type];
      if (module.isActive  && def.producers.power)            gv.power_total += def.producers.power;
      if (module.isActive  && def.consumers.power)            gv.power_used  += def.consumers.power;
      if (!module.isActive && def.consumers['power-standby']) gv.power_used  += def.consumers['power-standby'];
      if (module.isActive  && def.producers.compute)          gv.compute_total += def.producers.compute;
      if (module.isActive  && def.consumers.compute)          gv.compute_used  += def.consumers.compute;
      if (module.isActive  && def.producers.life_support)     gv.life_support_total += def.producers.life_support;
    });
    gv.life_support_used = gv.staff_total * 0.03;
  }



  // KEYBOARD EVENTS
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Useful event props: { altKey: false, charCode: 0, key: "ArrowUp", ctrlKey: false, keyCode: 38, metaKey: false, repeat: true, shiftKey: false, type: "keydown", code: "ArrowUp" }
    console.log(event);
  }

  // MOUSE EVENTS
  @HostListener('document:mousemove', ['$event']) // Was document:mousemove
  onMouseMove(e: MouseEvent) {
    if (!this.isShowingGameboard) return;
    //console.log(e);
    const blockX = Math.floor(e.pageX / 32) + this.mapL;
    const blockY = Math.floor(e.pageY / 32) + this.mapT;
    if (this.cursor.left != blockX || this.cursor.top != blockY) {
      console.log("Cursor block changed to",blockX,",",blockY);
      this.cursor = { left: blockX, top: blockY, isShown: (blockX<=this.mapR && blockY<=this.mapB) ? true : false };
    }
  }



  // USER EVENTS

  // Changes the currently selected tool which is triggered when user left-clicks
  changeTool(type: string) {
    if ('build'  == type) { this.selectedTool = 'build';  return; }
    if ('delete' == type) { this.selectedTool = 'delete'; return; }
    if (Object.keys(this.moduleList).includes(type)) { this.selectedTool = type; return; }
    this.selectedTool = '';
  }

  boardClick() {
  }

  addModule(type: string, left: number, top: number, level: number, rotation: number, isBuilt = false): boolean {

    return true;
  }

  delModule() {
  }

  advanceDay() {
    // Check for events
    // Consume then Produce
    // Advance the Build Queue
  }

}
