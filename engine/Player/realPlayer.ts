import { System } from '../System/system';
import { MouseCatcher } from './mouseCatcher';
import { GravityGrid } from '../System/GravityGrid';
import { Player } from './player';
import { Room } from "../Server/online";

import hotkeys from 'hotkeys-js';
import { Vector2 } from '@babylonjs/core/Maths/math';

export class RealPlayer extends Player {

    room: Room;

    constructor(system: System, gravityGrid: GravityGrid, room: Room) {
        super(system, gravityGrid);
        this.addMouseEvent();
        this.addZoomCatcher();
        this.system.camera.parent = this.movingMesh;
        this.room = room;

        hotkeys('space', (event, param) => {
            if (this.moving) this.accelerate();
        });

        window.addEventListener('click', () => {
            if (this.moving) this.accelerate();
        });
    }

    addMouseEvent() {
        let mouseCatcher = new MouseCatcher();

        mouseCatcher.addListener((pos: Vector2, step: Vector2) => {
            if (!this.moving) return;
            if (!this.room.started) {
                this.moveCatcher.catch(pos);
            } else {
                console.log(pos);
                
                this.room.send({ command: 'move', destination: pos });
            }
        });

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