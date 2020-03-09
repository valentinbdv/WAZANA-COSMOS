import { SystemAsset } from '../System/systemAsset';
import { MouseCatcher } from './mouseCatcher';
import { GravityGrid } from '../System/GravityGrid';
import { Player, startSize } from './player';
import { onlineMap } from "../Map/onlineMap";

import hotkeys from 'hotkeys-js';
import { Vector2 } from '@babylonjs/core/Maths/math';

export class RealPlayer extends Player {

    map: onlineMap;
    dustField = false;

    constructor(system: SystemAsset, gravityGrid: GravityGrid, map: onlineMap) {
        super(system, gravityGrid, { temperature: 5000, size: startSize, position: { x: 0, y: 0 }, maxPlanet: 5 });
        this.addMouseEvent();
        this.addKeyEvent();
        this.addZoomCatcher();
        this.system.camera.parent = this.movingMesh;
        this.map = map;

        hotkeys('space', (event, param) => {
            if (this.moving) this.accelerate();
        });

        window.addEventListener('click', () => {
            if (this.moving) this.accelerate();
        });

        setInterval(() => {
            if (this.moving) {
                this.gravityGrid.setCenterAndSize(this.position, this.size);
                if (this.map.started) this.map.send({ position: this.position });
            }
        }, 500);
    }

    addMouseEvent() {
        let mouseCatcher = new MouseCatcher();

        mouseCatcher.addListener((pos: Vector2, step: Vector2) => {
            this.sendMove(this.keyDirection);
        });
    }

    keyDirection = new Vector2(0, 0);
    keyMove = 10;
    addKeyEvent() {
        window.addEventListener("keydown", (evt) => {
            if (evt.keyCode == 37) { // Left Arrow
                this.keyDirection.y = -this.keyMove;
            } else if (evt.keyCode == 38) { // Up Arrow
                this.keyDirection.x = -this.keyMove;
            } else if (evt.keyCode == 39) { // Right Arrow
                this.keyDirection.y = this.keyMove;
            } else if (evt.keyCode == 40) { // Down Arrow
                this.keyDirection.x = this.keyMove;
            }
            this.sendMove(this.keyDirection);
        });

        window.addEventListener("keyup", (evt) => {
            if (evt.keyCode == 37 || evt.keyCode == 39) { // Left Arrow
                this.keyDirection.y = 0;
            } else if (evt.keyCode == 38 || evt.keyCode == 40) { // Up Arrow
                this.keyDirection.x = 0;
            } 
            this.sendMove(this.keyDirection);
        });
    }

    sendMove(pos: Vector2) {
        if (!this.moving) return;
        if (!this.map.started) {
            this.moveCatcher.catch(pos);
        } else {
            this.map.send({ destination: pos });
        }
    }

    addZoomCatcher() {
        this.system.scene.registerBeforeRender(() => {
            let newRadius = Math.max(this.size * 50, 50);
            let change = newRadius - this.system.camera.radius;
            this.system.camera.radius += change/100;

            // let aspect = this.system.scene.getEngine().getAspectRatio(this.system.camera);
            // let ortho = newRadius * 0.4;
            // this.system.camera.orthoTop = ortho;
            // this.system.camera.orthoBottom = -ortho;
            // this.system.camera.orthoLeft = -ortho * aspect;
            // this.system.camera.orthoRight = ortho * aspect;
        });
    }

    dispose() {
        this.setPosition(Vector2.Zero());
        this.setMoving(false);
        this.setSize(startSize);
        this.secondLight.excludedMeshes = [];
        this.secondLight.includedOnlyMeshes = [];
        this.setCategory(this.category, true);
        this.show();
        this.system.checkActiveMeshes();
    }
}