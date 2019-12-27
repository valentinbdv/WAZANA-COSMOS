import { System } from '../System/system';
import { MouseCatcher } from './mouseCatcher';
import { GravityField } from '../System/gravityField';
import { Player } from './player';

import hotkeys from 'hotkeys-js';

export class RealPlayer extends Player {

    moveCatcher: MouseCatcher;

    constructor(system: System, gravityField: GravityField) {
        super(system, gravityField);
        this.addMouseEvent();
        this.system.camera.parent = this.movingMesh;

        hotkeys('space', (event, param) => {
            this.launchPlanet();
        });
    }

    addMouseEvent() {
        let mouseCatcher = new MouseCatcher(this.system.animationManager);
        this.addCactcher(mouseCatcher);

        // setTimeout(() => {
        //     this.moving = false;
        // }, 2000);

        setInterval(() => {
            this.gravityField.setCenterMap(this.position);
        }, 500);
    }

    explode() {
        this.moving = false;
        this._explode();
    }
}