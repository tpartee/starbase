import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IBoardModule, IConsumers, ICursor, IModuleDefinition, IProducers, ModuleLookup, TileLookup, TraversalLookup } from 'src/typedefs';
import { GameValues, Stores } from 'src/gamevalues';
import { ObjectUnsubscribedError } from 'rxjs';

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
  cursor: ICursor = { left: 0, top: 0, isShown: false, desW: 1, desH: 1 };
  moduleList: Array<IModuleDefinition> = [];          // Module Definition List (from modules.json)
  moduleLookup: ModuleLookup = {};                    // Fast look-up for ModuleDefinitions by name
  boardModules: Array<IBoardModule> = [];             // Modules on the game board, even if not built yet
  displayModules: Array<IBoardModule> = [];           // Modules VISIBLE on the game board's current level
  currentLevel: number = 0;                           // Which level or "vertical slice" of the base is being viewed right now
  tileLookupLevel: TileLookup = {};                   // Fast look-up for mouse position over tile on current level
  tileLookupGlobal: TileLookup = {};                  // Fast look-up for arbitrary x/y/z position
  traversalLookup: TraversalLookup = {};              // Stores point-to-point traversal paths
  gameValues: GameValues = new GameValues();          // Stores game state values, including storage numbers
  selectedTool: string | null = null;                 // The currently selected 'paint' tool
  currentRotation: number = 1;                        // The rotation of the current tool
  selectedModule: number = -1;                        // The module currently selected to interact with
  selectedModuleDef: IModuleDefinition | null = null; // The module currently selected to interact with' definition
  selectedModuleError: string = '';                   // If there was an action error while interacting with a module, display it here
  buildQueue: Array<number> = [];                     // Current order of building defined by user using Build tool
  generalError: string | null = null;                 // Holds a generic error string to display at the bottom center of screen
  mapT: number = -20;
  mapL: number = -20;
  mapB: number =  20;
  mapR: number =  20;

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.LoadModules();
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
        this.LoadMap();   // Loading the map relies upon the module definitions being loaded first!
      },
      error: (err) => { console.log('LoadModules(): error: ',err) },
      complete: () => { console.log('LoadModules(): complete') }
    });
  }

  LoadMap() {
    // Corridors (in a + shape)
    this.addModule('passage_corridor',  0,  0, 0, 1, true, true);
    this.addModule('passage_corridor',  0, -1, 0, 1, true, true);
    this.addModule('passage_corridor',  0, -2, 0, 1, true, true);
    this.addModule('passage_corridor',  0,  1, 0, 1, true, true);
    this.addModule('passage_corridor',  0,  2, 0, 1, true, true);
    this.addModule('passage_corridor', -1,  0, 0, 1, true, true);
    this.addModule('passage_corridor', -2,  0, 0, 1, true, true);
    this.addModule('passage_corridor',  1,  0, 0, 1, true, true);
    this.addModule('passage_corridor',  2,  0, 0, 1, true, true);
    // Modules
    this.addModule('quarters_cramped_small',           2,  1, 0, 1, true, true);
    this.addModule('command_cramped',                  1, -1, 0, 1, true);
    this.addModule('reactor_crystal_tiny',            -1, -1, 0, 1, true, true);
    this.addModule('compute_core_tiny',               -1,  1, 0, 1, true, true);
    this.addModule('storage_tiny',                    -1, -2, 0, 1, true, true);
    this.addModule('fabrication_structure_tiny',      -2,  1, 0, 1, true);
    this.addModule('fabrication_basic_tiny',          -1,  2, 0, 1, true);
    this.addModule('recycle_bio_tiny',                 1,  2, 0, 1, true, true);
    this.addModule('airlock_tiny',                    -2, -1, 0, 1, true);
    this.addModule('life_support_tiny',                1,  1, 0, 1, true, true);
    this.addModule('sensors_rudimentary',              2, -1, 0, 1, true, true);
    this.addModule('entertainment_mess_hall_cramped',  1, -2, 0, 1, true, true);
    // Weapons, Shields, Docks
    this.addModule('dock_small',            3,  0, 0, 2, true, true);
    this.addModule('dock_small',           -3,  0, 0, 4, true, true);
    this.addModule('shield_emitter_small',  1, -3, 0, 1, true, true);
    this.addModule('shield_emitter_small', -1,  3, 0, 3, true, true);
    this.addModule('phasor_light',         -1, -3, 0, 1, true, true);
    this.addModule('phasor_light',          1,  3, 0, 3, true, true);

    this.SetDisplayLevel();

    // Set initial game values:
    const gv = this.gameValues;
    gv.day = 1;
    //   storage: 100 basic mats, 50 inter mats, 15 crystals, 35 bio mats, 50 struct comps, 10 basic comps, 10 inter comps
    gv.stores.mat_basic      = 100;
    gv.stores.mat_inter      = 50;
    gv.stores.mat_crystal    = 15;
    gv.stores.mat_bio        = 35;
    gv.stores.comp_structure = 50;
    gv.stores.comp_basic     = 10;
    gv.stores.comp_inter     = 10;
    //   staff: 1 command, 1 medic, 2 security, 4 engineer
    gv.staff_command_total  = gv.staff_command_avail  = 1;
    gv.staff_security_total = gv.staff_security_avail = 2;
    gv.staff_medic_total    = gv.staff_medic_avail    = 1;
    gv.staff_engineer_total = gv.staff_engineer_avail = 4;
    gv.staff_total = gv.staff_command_total + gv.staff_security_total + gv.staff_medic_total + gv.staff_engineer_total + gv.staff_worker_total;
    //   50 trade creds, 20 union creds
    gv.trade_creds = 50;
    gv.union_creds = 20;

    this.RefreshUIFromBoard();

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
    gv.storage_total = 0;
    gv.hab_all_total = 0;
    this.boardModules.forEach(module => {
      const def = this.moduleLookup[module.type];
      if (module.isActive  && def.producers.power)            gv.power_total += def.producers.power;
      if (                    def.consumers.power)            gv.power_used  += def.consumers.power;
      if (module.isActive  && def.consumers['power-active'])  gv.power_used  += def.consumers['power-active'];
      if (!module.isActive && def.consumers['power-standby']) gv.power_used  += def.consumers['power-standby'];
      if (module.isActive  && def.producers.compute)          gv.compute_total += def.producers.compute;
      if (module.isActive  && def.consumers.compute)          gv.compute_used  += def.consumers.compute;
      if (module.isActive  && def.producers.life_support)     gv.life_support_total += def.producers.life_support;
      if (module.isActive  && def.producers.storage)          gv.storage_total += def.producers.storage;
      if (module.isActive  && def.producers.hab_cramped)      gv.hab_all_total += def.producers.hab_cramped;
      if (module.isActive  && def.producers.hab_basic)        gv.hab_all_total += def.producers.hab_basic;
      if (module.isActive  && def.producers.hab_luxury)       gv.hab_all_total += def.producers.hab_luxury;
    });
    gv.life_support_used = gv.staff_total * 0.03;
    gv.storage_used = gv.stores.totalUsed();
    gv.hab_all_avail = gv.hab_all_total - gv.staff_total;
  }

  SetDisplayLevel() {   // Filters down to only the modules to be displayed on the current level
    this.displayModules = this.boardModules.filter(mod => mod.level == this.currentLevel);
    this.tileLookupLevel = {};   // Reset and rebuild the tile lookup
    this.displayModules.forEach(mod => {
      const def = this.moduleLookup[mod.type];
      const desW = (def.width == def.height) ? def.width : (mod.rotation % 2) ? def.width : def.height;
      const desH = (def.width == def.height) ? def.width : (mod.rotation % 2) ? def.height : def.width;
      for(let x=0; x<desW; x++) {
        for(let y=0; y<desH; y++) {
          this.tileLookupLevel[(mod.left + x) +','+ (mod.top + y)] = mod.id;
        }
      }
    });
  }



  // KEYBOARD EVENTS
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Useful event props: { altKey: false, charCode: 0, key: "ArrowUp", ctrlKey: false, keyCode: 38, metaKey: false, repeat: true, shiftKey: false, type: "keydown", code: "ArrowUp" }
    console.log(event);
    if (![null,'delete','build'].includes(this.selectedTool) && event.code === 'KeyR') {
      this.currentRotation = (this.currentRotation > 3) ? 1 : this.currentRotation++;
      const def = this.moduleLookup[this.selectedTool ?? ''];
      this.cursor.desW = (def.width == def.height) ? def.width : (this.currentRotation % 2) ? def.width : def.height;
      this.cursor.desH = (def.width == def.height) ? def.width : (this.currentRotation % 2) ? def.height : def.width;
    }
  }

  // MOUSE EVENTS
  @HostListener('document:mousemove', ['$event']) // Was document:mousemove
  onMouseMove(e: MouseEvent) {
    if (!this.isShowingGameboard) return;
    //console.log(e);
    const blockX = Math.floor(e.pageX / 32) + this.mapL;
    const blockY = Math.floor(e.pageY / 32) + this.mapT;
    if (this.cursor.left != blockX || this.cursor.top != blockY) {
      // console.log("Cursor block changed to",blockX,",",blockY);
      this.cursor.left    = blockX
      this.cursor.top     = blockY
      this.cursor.isShown = blockX<this.mapR && blockY<this.mapB;
    }
  }



  // USER EVENTS

  // Changes the currently selected tool which is triggered when user left-clicks
  changeTool(type: string | null) {
    this.generalError = null;
    this.cursor.desW = 1;
    this.cursor.desH = 1;
    this.currentRotation = 1;
    if ([null,''].includes(type)) { this.selectedTool = null; }
    else if ('build'  == type) { this.selectedTool = 'build'; }
    else if ('delete' == type) { this.selectedTool = 'delete'; }
    else if (Object.keys(this.moduleLookup).includes(type ?? '')) {
      this.selectedTool = type;
      this.cursor.desW = this.moduleLookup[type ?? ''].width;
      this.cursor.desH = this.moduleLookup[type ?? ''].height;
    } else {
      this.selectedTool = null;
    }
  }

  // The user clicked on the board, so take action based on which tool they've got selected right now
  boardClick() {
    this.generalError = null;
    if      ([null,''].includes(this.selectedTool)) this.selectModule(this.cursor.left, this.cursor.top);
    else if ('delete' == this.selectedTool) this.delModule(this.cursor.left, this.cursor.top);
    else if ('build' == this.selectedTool) this.queueBuild(this.cursor.left, this.cursor.top, this.currentLevel);
    else if (Object.keys(this.moduleLookup).includes(this.selectedTool ?? '')) {
      this.addModule(this.selectedTool ?? '', this.cursor.left, this.cursor.top, this.currentLevel, this.currentRotation);
    }
  }



  addModule(type: string, left: number, top: number, level: number, rotation: number, isBuilt = false, isActive = false): boolean {
    const def = this.moduleLookup[type];
    console.log('addModule() called: type =',type,', definition:',def);
    if (!def) { console.log('addModule(): type',type,'not found!'); return false; }

    // === First determine if this module can be placed where requested

    // Check the tile lookup for free spaces
    const desW = (def.width == def.height) ? def.width : (rotation % 2) ? def.width : def.height;
    const desH = (def.width == def.height) ? def.width : (rotation % 2) ? def.height : def.width;
    for(let x=0; x<desW; x++) {
      for(let y=0; y<desH; y++) {
        if (Object.keys(this.tileLookupLevel).includes((left + y) +','+ (top + x))) {  console.log('addModule(): that space is not available'); return false; }
      }
    }

    // Check for valid connections to other structures
    let conns: Array<number> = [];     // Traversal connections
    let ctids: Array<number> = [];     // Board tiles connected to
    let tempt: TraversalLookup = {};   // Temporary traversal lookup until we've confirmed we'd going to add this tile, at which point we'll merge into the global traversals
    if (def.connections.includes('all') || def.connections.includes('any')) {   // Connections of 'all' and 'any' type are greedy and try to connect to everything they can
      for (let x=0; x<desW; x++) {   // Check for connections along top
        const idx1 = (left+x)+','+(top)+','+this.currentLevel;
        const idx2 = (left+x)+','+(top-1)+','+this.currentLevel;
        const tid  = this.canTilesConnect(idx1, def, rotation, idx2);   // tid = Tile ID
        if (!tid) continue;
        if (Object.keys(tempt).includes(idx1)) tempt[idx1].push(idx2); else tempt[idx1] = [ idx2 ];
        if (Object.keys(tempt).includes(idx2)) tempt[idx2].push(idx1); else tempt[idx2] = [ idx1 ];
        ctids.push(tid); conns.push(x);
      }
      for (let y=0; y<desH; y++) {   // Check for connections along right
        const idx1 = (left+desW-1)+','+(top+y)+','+this.currentLevel;
        const idx2 = (left+desW)  +','+(top+y)+','+this.currentLevel;
        const tid  = this.canTilesConnect(idx1, def, rotation, idx2);
        if (!tid) continue;
        if (Object.keys(tempt).includes(idx1)) tempt[idx1].push(idx2); else tempt[idx1] = [ idx2 ];
        if (Object.keys(tempt).includes(idx2)) tempt[idx2].push(idx1); else tempt[idx2] = [ idx1 ];
        ctids.push(tid); conns.push(desW + y);
      }
      for (let x=desW-1; x>=0; x--) {   // Check for connections along bottom
        const idx1 = (left+x)+','+(top+desH-1)+','+this.currentLevel;
        const idx2 = (left+x)+','+(top+desH)+','+this.currentLevel;
        const tid  = this.canTilesConnect(idx1, def, rotation, idx2);
        // console.log('addModule(): all/any check bottom',idx1,'against',idx2,'result',tid);
        if (!tid) continue;
        if (Object.keys(tempt).includes(idx1)) tempt[idx1].push(idx2); else tempt[idx1] = [ idx2 ];
        if (Object.keys(tempt).includes(idx2)) tempt[idx2].push(idx1); else tempt[idx2] = [ idx1 ];
        ctids.push(tid); conns.push(desW + desH + desW - 1 - x);
      }
      for (let y=desH-1; y>=0; y--) {   // Check for connections along left
        const idx1 = (left)  +','+(top+y)+','+this.currentLevel;
        const idx2 = (left-1)+','+(top+y)+','+this.currentLevel;
        const tid  = this.canTilesConnect(idx1, def, rotation, idx2);
        // console.log('addModule(): all/any check left',idx1,'against',idx2,'result',tid);
        if (!tid) continue;
        if (Object.keys(tempt).includes(idx1)) tempt[idx1].push(idx2); else tempt[idx1] = [ idx2 ];
        if (Object.keys(tempt).includes(idx2)) tempt[idx2].push(idx1); else tempt[idx2] = [ idx1 ];
        ctids.push(tid); conns.push(desW + desH + desW + desH - 1 - y);
      }
    } else if (def.connections.includes('bottom')) {   // Bottom edge connections just check their bottom edge, obviously
      const idx1 = left+','+top+','+this.currentLevel;
      const idx2 = (1 == rotation) ? left+','+(top+1)+','+this.currentLevel
                 : (2 == rotation) ? (left-1)+','+top+','+this.currentLevel
                 : (3 == rotation) ? left+','+(top-1)+','+this.currentLevel
                 :                   (left+1)+','+top+','+this.currentLevel;
      const tid  = this.canTilesConnect(idx1, def, rotation, idx2);
      if (tid) {
        if (Object.keys(tempt).includes(idx1)) tempt[idx1].push(idx2); else tempt[idx1] = [ idx2 ];
        if (Object.keys(tempt).includes(idx2)) tempt[idx2].push(idx1); else tempt[idx2] = [ idx1 ];
        ctids.push(tid); conns.push(2);
      }
    }
    if (!isBuilt && conns.length < 1) {
      this.generalError = 'Could not find any points of connection for requested build!';
      return false;
    }

    // Work out tile variation and rotation for corridors
    let img_var = 0;
    // if ('passage_corridor' == type) {
    //   if        (1 == conns.length) {   // Dead-end
    //     img_var = 0; rotation = (conns.includes(0)) ? 2 : (conns.includes(1)) ? 3 : (conns.includes(2)) ? 0 : 1;
    //   } else if (2 == conns.length) {   // Pass-through and corner
    //     if ((conns.includes(1) && conns.includes(3)) || (conns.includes(0) && conns.includes(2))) {   // Straight Corridor
    //       img_var = 1;
    //       rotation = (conns.includes(1)) ? 1 : 2;
    //     } else {   // Corner Corridor
    //       if (conns.includes(0) && conns.includes(1)) { img_var = 2; rotation = 1; }
    //       if (conns.includes(1) && conns.includes(2)) { img_var = 2; rotation = 2; }
    //       if (conns.includes(2) && conns.includes(3)) { img_var = 2; rotation = 3; }
    //       if (conns.includes(3) && conns.includes(0)) { img_var = 2; rotation = 4; }
    //     }
    //   } else if (3 == conns.length) {   // Three-way
    //     img_var = 3;
    //   } else                        {   // Four-way
    //     img_var = 4;
    //   }
    // }

    // === Place the module and set any connections
    const id = this.boardModules.length;
    this.boardModules.push({
      'id': id,
      'type': type,
      'left': left,
      'top': top,
      'level': level,
      'desW': desW,
      'desH': desH,
      'isBuilt': isBuilt,
      buildDaysLeft: (isBuilt) ? 0 : def.construction.days,
      'isActive': isActive,
      'rotation': rotation,
      'imgVariant': img_var,
      assigned_command: 0,
      assigned_engineer: 0,
      assigned_medic: 0,
      assigned_security: 0,
      assigned_worker: 0,
      'traversalConnections': conns,
      neighbors: ctids,
    });

    // Update the global traversal connections lookup (needed to update corridor layouts)
    Object.keys(tempt).forEach(tkey => { if (Object.keys(this.traversalLookup).includes(tkey)) this.traversalLookup[tkey].push(...tempt[tkey]); else this.traversalLookup[tkey] = tempt[tkey]; });
    // Update corridors to show any added connections
    ctids.forEach(tid => { if ('passage_corridor' == this.boardModules[tid].type) this.updateCorridorDisplay(tid); });

    // === Update the tile look-up with the locations this module filled
    for(let x=0; x<desW; x++) {
      for(let y=0; y<desH; y++) {
        this.tileLookupLevel[ (left + y) +','+ (top + x)] = id;
        this.tileLookupGlobal[(left + y) +','+ (top + x) +','+ (level)] = id;
      }
    }

    // TODO: Expand the map if the new module pushed the edges out further

    this.SetDisplayLevel();   // Refresh the game board

    return true;
  }

  // Takes two coordinates and tests if a connection can be made between them, returns the boardModule ID of the second tile on success, null on failure
  canTilesConnect(tile1: string, def1: IModuleDefinition | null, rot1: number | null, tile2: string): number | null {
    if ((null == def1 || null == rot1) && !Object.keys(this.tileLookupGlobal).includes(tile1)) { console.log('canTilesConnect(',tile1,',',tile2,'): def or rot were null and no tile1 exists!'); return null; }
    if (null == def1) def1 = this.moduleLookup[this.boardModules[this.tileLookupGlobal[tile1]].type];
    if (null == rot1) rot1 = this.boardModules[this.tileLookupGlobal[tile1]].rotation;
    if (!Object.keys(this.tileLookupGlobal).includes(tile2)) { /* console.log('canTilesConnect(',tile1,',',tile2,'): could not find tile2 in global lookup!'); */ return null; }
    const mod2 = this.tileLookupGlobal[tile2];
    const def2 = this.moduleLookup[this.boardModules[mod2].type];
    const rot2 = this.boardModules[mod2].rotation;
    const xyz1 = tile1.split(',');
    const xyz2 = tile2.split(',');
    if (xyz1.length != 3 || xyz2.length != 3) { console.log('canTilesConnect(',tile1,',',tile2,'): incorrect number of X/Y/Z values!'); return null; }
    const diffX = ~~xyz1[0] - ~~xyz2[0];
    const diffY = ~~xyz1[1] - ~~xyz2[1];
    const diffZ = ~~xyz1[2] - ~~xyz2[2];
    if ((diffX && diffY) || (diffX && diffZ) || (diffY && diffZ) || diffX > 1 || diffX < -1 || diffY > 1 || diffY < -1 || diffZ > 1 || diffZ < -1 || (diffX == diffY && diffX == diffZ)) { console.log('canTilesConnect(',tile1,',',tile2,'): tiles are not adjacent!'); return null; }

    console.log('canTilesConnect(',tile1,',',tile2,'): passed basic validation checks');

    if (def1.connections.includes('all') && (def2.connections.includes('all') || def2.connections.includes('any'))) return mod2;
    if (def1.connections.includes('any') && def2.connections.includes('all')) return mod2;
    if (def1.connections.includes('engineering_station') && 'station_engineering' == def2.type) return mod2;
    if ((def1.connections.includes('bottom') || def1.connections.includes('bottom-any')) && (def2.connections.includes('all') || def2.connections.includes('any'))) {
      if ( 1 == diffY && 1 == rot1) return mod2;
      if (-1 == diffX && 2 == rot1) return mod2;
      if (-1 == diffY && 3 == rot1) return mod2;
      if ( 1 == diffX && 4 == rot1) return mod2;
    }
    if ((def1.connections.includes('all') || def1.connections.includes('any')) && (def2.connections.includes('bottom') || def2.connections.includes('bottom-any'))) {
      if ( 1 == diffY && 3 == rot1) return mod2;
      if (-1 == diffX && 4 == rot1) return mod2;
      if (-1 == diffY && 1 == rot1) return mod2;
      if ( 1 == diffX && 2 == rot1) return mod2;
    }
    if (def1.connections.includes('vertical') && (1 == rot1 || 3 == rot1) && diffY && (def2.connections.includes('all') || def2.connections.includes('any') || (def2.connections.includes('vertical') && (1 == rot2 || 3 == rot2)))) return mod2;
    if (def1.connections.includes('vertical') && (2 == rot1 || 4 == rot1) && diffX && (def2.connections.includes('all') || def2.connections.includes('any') || (def2.connections.includes('vertical') && (2 == rot2 || 4 == rot2)))) return mod2;

    console.log('canTilesConnect(',tile1,',',tile2,'): exhausted checks of',def1.connections,'against',def2.connections);
    return null;
  }

  // Updates corridor display based on new connections
  updateCorridorDisplay(tid: number) {
    const mod = this.boardModules[tid];
    const idx = mod.left+','+mod.top+','+mod.level;
    let conns: Array<number> = [];
    if (!Object.keys(this.traversalLookup).includes(idx)) return;
    this.traversalLookup[idx].forEach(conn => {
      const xyz = conn.split(',');
      if (~~xyz[0] < mod.left) conns.push(3);
      if (~~xyz[0] > mod.left) conns.push(1);
      if (~~xyz[1] < mod.top)  conns.push(0);
      if (~~xyz[1] > mod.top)  conns.push(2);
    });

    let img_var  = 0;
    let rotation = 1;
    //   if        (1 == conns.length) {   // Dead-end
    //     img_var = 0; rotation = (conns.includes(0)) ? 2 : (conns.includes(1)) ? 3 : (conns.includes(2)) ? 0 : 1;
    //   } else if (2 == conns.length) {   // Pass-through and corner
    //     if ((conns.includes(1) && conns.includes(3)) || (conns.includes(0) && conns.includes(2))) {   // Straight Corridor
    //       img_var = 1;
    //       rotation = (conns.includes(1)) ? 1 : 2;
    //     } else {   // Corner Corridor
    //       if (conns.includes(0) && conns.includes(1)) { img_var = 2; rotation = 1; }
    //       if (conns.includes(1) && conns.includes(2)) { img_var = 2; rotation = 2; }
    //       if (conns.includes(2) && conns.includes(3)) { img_var = 2; rotation = 3; }
    //       if (conns.includes(3) && conns.includes(0)) { img_var = 2; rotation = 4; }
    //     }
    //   } else if (3 == conns.length) {   // Three-way
    //     img_var = 3;
    //   } else                        {   // Four-way
    //     img_var = 4;
    //   }
    mod.imgVariant = img_var;
    mod.rotation   = rotation;
  }



  // Select a module on the board to interact with
  selectModule(locX: number, locY: number): boolean {
    const key = locX+','+locY;
    if (Object.keys(this.tileLookupLevel).includes(key)) {
      this.selectedModule = this.tileLookupLevel[key];
      this.selectedModuleDef = this.moduleLookup[this.boardModules[this.selectedModule].type];
      this.selectedModuleError = '';
      return true;
    } else {
      this.selectedModule = -1;
      this.selectedModuleError = '';
    }
    return false;
  }

  // Delete a module from the game board
  delModule(locX: number, locY: number): boolean {
    return true;
  }

  // Add a module to the construction queue
  queueBuild(locX: number, locY: number, locZ: number): boolean {
    const key = locX+','+locY+','+locZ;
    if (Object.keys(this.tileLookupGlobal).includes(key)) {
      const mod = this.boardModules[this.tileLookupGlobal[key]];
      if (mod.isBuilt) { this.generalError = 'That module is already finished building!'; return false; }
      if (this.buildQueue.includes(mod.id)) { this.generalError = 'That module is already in the build queue!'; return false; }
      if (16 <= this.buildQueue.length) { this.generalError = 'The build queue is full!'; return false; }
      // Make sure this module is adjacent to another built module or a module in the queue to be built
      let match = false;
      mod.neighbors.forEach(nmod => { if (this.boardModules[nmod].isBuilt || this.buildQueue.includes(nmod)) match = true; });
      if (!match) { this.generalError = 'That module cannot be built until it has a neighbor that is built or is in the queue!'; return false; }
      // Add it to the queue!
      this.buildQueue.push(mod.id);
    }
    return true;
  }

  // Toggle a boolean value on an object
  toggleModuleActive(mod: IBoardModule) {
    this.selectedModuleError = '';
    // If the module is active, we can always turn it off
    if (mod.isActive) { mod.isActive = false; this.RefreshUIFromBoard(); return; }
    // But if it's not active, we have to make sure things are available to turn it on
    const gv = this.gameValues;
    const def = this.moduleLookup[mod.type];
    // Check for available staffing
    if (def.consumers.staff_engineer) {
      if (gv.staff_engineer_avail >= def.consumers.staff_engineer) {
        if (def.consumers.staff_worker_min) {
          if (gv.staff_worker_avail >= def.consumers.staff_worker_min) {
            gv.staff_worker_avail -= def.consumers.staff_worker_min;
            mod.assigned_worker = def.consumers.staff_worker_min;
          } else {
            this.selectedModuleError = 'No workers available to enable this module!'; return;
          }
        }
        gv.staff_engineer_avail -= def.consumers.staff_engineer;
        mod.assigned_engineer = def.consumers.staff_engineer;
        mod.isActive = true;
      } else {
        this.selectedModuleError = 'No engineers available to enable this module!'; return;
      }
    } else if (def.consumers.staff_engineer_min) {
      if (gv.staff_engineer_avail >= def.consumers.staff_engineer_min) {
        gv.staff_engineer_avail -= def.consumers.staff_engineer_min;
        mod.assigned_engineer = def.consumers.staff_engineer_min;
        mod.isActive = true;
      } else {
        this.selectedModuleError = 'No engineers available to enable this module!'; return;
      }
    }
    if (def.consumers.staff_medic) {
      if (gv.staff_medic_avail >= def.consumers.staff_medic) {
        gv.staff_medic_avail -= def.consumers.staff_medic;
        mod.assigned_medic = def.consumers.staff_medic;
        mod.isActive = true;
      } else {
        this.selectedModuleError = 'No medics available to enable this module!'; return;
      }
    }
    if (def.consumers.staff_security) {
      if (gv.staff_security_avail >= def.consumers.staff_security) {
        gv.staff_security_avail -= def.consumers.staff_security;
        mod.assigned_security = def.consumers.staff_security;
        mod.isActive = true;
      } else {
        this.selectedModuleError = 'No security available to enable this module!'; return;
      }
    }
    if (def.consumers.staff_worker) {
      if (gv.staff_worker_avail >= def.consumers.staff_worker) {
        gv.staff_worker_avail -= def.consumers.staff_worker;
        mod.assigned_worker = def.consumers.staff_worker;
        mod.isActive = true;
      } else {
        this.selectedModuleError = 'No workers available to enable this module!'; return;
      }
    }
    this.RefreshUIFromBoard();
  }

  remStaff(modId: number, staffType: string) {
    this.selectedModuleError = '';
    const mod = this.boardModules[modId];
    const def = this.moduleLookup[mod.type];
    if ('worker' == staffType) {
      if (def.consumers.staff_worker_min && mod.assigned_worker > def.consumers.staff_worker_min) {
        mod.assigned_worker--;
        this.gameValues.staff_worker_avail++;
      } else {
        this.selectedModuleError = 'Module already has the minimum number of workers assigned!';
      }
    }
    if ('medic' == staffType) {
      if (def.consumers.staff_medic_min && mod.assigned_medic > def.consumers.staff_medic_min) {
        mod.assigned_medic--;
        this.gameValues.staff_medic_avail++;
      } else {
        this.selectedModuleError = 'Module already has the minimum number of medics assigned!';
      }
    }
    if ('engineer' == staffType) {
      if (def.consumers.staff_engineer_min && mod.assigned_engineer > def.consumers.staff_engineer_min) {
        mod.assigned_engineer--;
        this.gameValues.staff_engineer_avail++;
      } else {
        this.selectedModuleError = 'Module already has the minimum number of engineers assigned!';
      }
    }
    if ('security' == staffType) {
      if (def.consumers.staff_security_min && mod.assigned_security > def.consumers.staff_security_min) {
        mod.assigned_security--;
        this.gameValues.staff_security_avail++;
      } else {
        this.selectedModuleError = 'Module already has the minimum number of security assigned!';
      }
    }
  }

  addStaff(modId: number, staffType: string) {
    this.selectedModuleError = '';
    const mod = this.boardModules[modId];
    const def = this.moduleLookup[mod.type];
    if ('worker' == staffType) {
      if (this.gameValues.staff_worker_avail > 0) {
        if (def.consumers.staff_worker_max && mod.assigned_worker < def.consumers.staff_worker_max) {
          mod.assigned_worker++;
          this.gameValues.staff_worker_avail--;
        } else {
          this.selectedModuleError = 'This module already has the maximum number of assigned workers!';
        }
      } else {
        this.selectedModuleError = 'No workers available to add to staff for this module!';
      }
    }
    if ('medic' == staffType) {
      if (this.gameValues.staff_medic_avail > 0) {
        if (def.consumers.staff_medic_max && mod.assigned_medic < def.consumers.staff_medic_max) {
          mod.assigned_medic++;
          this.gameValues.staff_medic_avail--;
        } else {
          this.selectedModuleError = 'This module already has the maximum number of assigned medics!';
        }
      } else {
        this.selectedModuleError = 'No medics available to add to staff for this module!';
      }
    }
    if ('engineer' == staffType) {
      if (this.gameValues.staff_engineer_avail > 0) {
        if (def.consumers.staff_engineer_max && mod.assigned_engineer < def.consumers.staff_engineer_max) {
          mod.assigned_engineer++;
          this.gameValues.staff_engineer_avail--;
        } else {
          this.selectedModuleError = 'This module already has the maximum number of assigned engineers!';
        }
      } else {
        this.selectedModuleError = 'No engineers available to add to staff for this module!';
      }
    }
    if ('security' == staffType) {
      if (this.gameValues.staff_security_avail > 0) {
        if (def.consumers.staff_security_max && mod.assigned_security < def.consumers.staff_security_max) {
          mod.assigned_security++;
          this.gameValues.staff_security_avail--;
        } else {
          this.selectedModuleError = 'This module already has the maximum number of assigned security!';
        }
      } else {
        this.selectedModuleError = 'No security available to add to staff for this module!';
      }
    }
  }

  // Change the level in view to one level higher
  levelUp() {
    this.selectedModule = -1;
    this.currentLevel++;
    this.SetDisplayLevel();
  }

  // Change the level in view to one level lower
  levelDown() {
    this.selectedModule = -1;
    this.currentLevel--;
    this.SetDisplayLevel();
  }

  advanceDay() {
    // Check for events

    // Consume then Produce
    const store = this.gameValues.stores;
    let tempStore: Stores = new Stores(store);
    let conpro_changes: Stores = new Stores(null);
    this.boardModules.forEach(mod => {
      if (mod.isBuilt && mod.isActive) {
        const def = this.moduleLookup[mod.type];
        let supply = true;
        tempStore.props.forEach((key: string) => { if (def.consumers[key as keyof IConsumers] && tempStore.getProp(key) < (def.consumers[key as keyof IConsumers] ?? 0)) supply = false; });
        if (supply) {
          tempStore.props.forEach( (key: string) => { tempStore.subProp(key, def.consumers[key as keyof IConsumers] ?? 0); tempStore.addProp(key, def.producers[key as keyof IProducers] ?? 0); } );
        }
      }
    });
    // Consume and produce inhabitant stuff
    tempStore.comp_basic   -= this.gameValues.staff_total * 0.05;   // Water + Air in
    tempStore.mat_waste    += this.gameValues.staff_total * 0.05;   // Urine + CO2 out
    tempStore.mat_bio      -= this.gameValues.staff_total * 0.03;   // Food in
    tempStore.mat_biowaste += this.gameValues.staff_total * 0.03;   // Poop out
    console.log('Producer changes:',tempStore);
    tempStore.props.forEach( (key: string) => { store.addProp(key, tempStore.getProp(key)); } );

    // Advance the Build Queue
    if (this.buildQueue.length > 0) {
      this.boardModules.forEach(mod => {   // First check for full-size airlock teams
        if (mod.isBuilt && mod.isActive && 'airlock' == mod.type) {
          const def = this.moduleLookup[mod.type];
          const bq  = this.buildQueue;
          let workVal = mod.assigned_engineer / (def.consumers.staff_engineer_max ?? 1);
          while (workVal > 0 && bq.length > 0) {
            const bMod = this.boardModules[bq[0]];
            if (workVal >= bMod.buildDaysLeft) {   // Complete the building
              workVal -= bMod.buildDaysLeft;
              bMod.buildDaysLeft = 0;
              bMod.isBuilt = true;
              bq.shift();
            } else {   // Add any remainder to the next item in the queue
              bMod.buildDaysLeft -= workVal;
              workVal = 0;
            }
          }
        }
      });
      this.boardModules.forEach(mod => {   // Then check for tiny airlock teams
        if (mod.isBuilt && mod.isActive && 'airlock_tiny' == mod.type) {
          const def = this.moduleLookup[mod.type];
          const bq  = this.buildQueue;
          let workVal = mod.assigned_engineer / (def.consumers.staff_engineer_max ?? 1) * 0.5;
          while (workVal > 0 && bq.length > 0) {
            const bMod = this.boardModules[bq[0]];
            if (workVal >= bMod.buildDaysLeft) {   // Complete the building
              workVal -= bMod.buildDaysLeft;
              bMod.buildDaysLeft = 0;
              bMod.isBuilt = true;
              bq.shift();
            } else {   // Add any remainder to the next item in the queue
              bMod.buildDaysLeft -= workVal;
              workVal = 0;
            }
          }
        }
      });
    }
  }

}
