import { System } from '../System/system';
import { MouseCatcher } from './mouseCatcher';
import { MoveCatcher } from './moveCatcher';
import { GravityGrid } from '../System/GravityGrid';
import { Player } from './player';

import hotkeys from 'hotkeys-js';

export class RealPlayer extends Player {

    moveCatcher: MouseCatcher;
    cameraCatcher: MoveCatcher;

    constructor(system: System, gravityGrid: GravityGrid) {
        super(system, gravityGrid);
        this.addMouseEvent();
        this.addZoomCatcher();
        this.system.camera.parent = this.movingMesh;

        hotkeys('space', (event, param) => {

            if (this.moving) this.accelerate();
        });

        window.addEventListener('click', () => {
            if (this.moving) this.accelerate();
        });
    }

    addMouseEvent() {
        let mouseCatcher = new MouseCatcher(this.system.animationManager);
        this.addCactcher(mouseCatcher);

        // setTimeout(() => {
        //     this.moving = false;
        // }, 2000);

        setInterval(() => {
            this.gravityGrid.setCenterMap(this.position);
        }, 500);
    }

    addZoomCatcher() {
        // this.cameraCatcher = new MoveCatcher(this.system.animationManager);
        // this.cameraCatcher.start();
        // this.cameraCatcher.catch();
        this.system.scene.registerBeforeRender(() => {
            let newSize = Math.sqrt(this.size) * 50;
            let change = newSize - this.system.camera.radius;
            this.system.camera.radius += change/100;
        });
    }

    dispose() {
    }
    
    died = false;
    die() {
        this.removeAllPlanets();
        this.moving = false;
        this.died = true;
        // this.system.camera.parent = null;
    }
}