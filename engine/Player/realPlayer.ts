import { SystemUI } from '../System/systemUI';
import { MouseCatcher } from './mouseCatcher';
import { TouchCatcher } from './touchCatcher';
import { GravityGrid } from '../System/GravityGrid';
import { Player, startSize } from './player';
import { onlineMap } from "../Map/onlineMap";

import hotkeys from 'hotkeys-js';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';

export class RealPlayer extends Player {

    map: onlineMap;
    dustField = false;
    system: SystemUI;

    constructor(system: SystemUI, gravityGrid: GravityGrid, map: onlineMap) {
        super(system, gravityGrid, { temperature: 5000, size: startSize, position: { x: 0, y: 0 }, maxPlanet: 5 });
        this.addMouseEvent();
        this.addKeyEvent();
        this.addZoomCatcher();
        this.fixeCamera(true);
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
                this.system.setCenter(this.position);
                if (this.map.started) this.map.send({ position: this.position });
            }
        }, 500);
    }

    addMouseEvent() {
        if (this.system.checkPlatform()) {
            let touchCatcher = new TouchCatcher(window);
            touchCatcher.addListener((pos: Vector2) => {
                this.sendMove(pos);
            });
        } else {
            let mouseCatcher = new MouseCatcher();
            mouseCatcher.addListener((pos: Vector2, step: Vector2) => {
                this.sendMove(pos);
            });
        }
    }

    keyDirection = new Vector2(0, 0);
    keyMove = 10;
    addKeyEvent() {
        window.addEventListener("keydown", (evt) => {
            let key = evt.keyCode;
            if (key == 37) { // Left Arrow
                this.keyDirection.y = -this.keyMove;
            } else if (key == 38) { // Up Arrow
                this.keyDirection.x = -this.keyMove;
            } else if (key == 39) { // Right Arrow
                this.keyDirection.y = this.keyMove;
            } else if (key == 40) { // Down Arrow
                this.keyDirection.x = this.keyMove;
            }
            if (key == 37 || key == 38 || key == 39 || key == 40) this.sendMove(this.keyDirection);
        });

        window.addEventListener("keyup", (evt) => {
            let key = evt.keyCode;
            if (key == 37 || key == 39) { // Left Arrow
                this.keyDirection.y = 0;
            } else if (key == 38 || key == 40) { // Up Arrow
                this.keyDirection.x = 0;
            } 
            if (key == 37 || key == 38 || key == 39 || key == 40) this.sendMove(this.keyDirection);
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
            if (!this.isDead) {
                let newRadius = Math.max(this.size * 70, 50);
                newRadius = Math.min(this.size * 70, 100);
                // Large size to check stuff
                // let newRadius = 200;
                let change = newRadius - this.system.camera.radius;
                this.system.camera.radius += change/100;
                
                // let aspect = this.system.scene.getEngine().getAspectRatio(this.system.camera);
                // let ortho = newRadius * 0.4;
                // this.system.camera.orthoTop = ortho;
                // this.system.camera.orthoBottom = -ortho;
                // this.system.camera.orthoLeft = -ortho * aspect;
                // this.system.camera.orthoRight = ortho * aspect;
            }
        });
    }

    fixeCamera(fixe: boolean) {
        if (fixe) {
            this.system.camera.setPosition(Vector3.Zero());
            this.system.camera.setTarget(Vector3.Zero());
            this.system.camera.alpha = 0;
            this.system.camera.beta = Math.PI / 6;
            this.system.camera.radius = 10;
            this.system.camera.parent = this.movingMesh;
        } else {
            this.system.camera.parent = null;
            let cameraPos = this.system.camera.getFrontPosition(0.01);
            let absolutPos = this.movingMesh.absolutePosition.add(cameraPos);
            this.system.camera.setPosition(absolutPos);
            this.system.camera.setTarget(this.movingMesh.absolutePosition.clone());
        }
    }

    restart() {
        this.fixeCamera(true);
        this.setSize(startSize);
        this.setOpacity(1);
        this.setMoving(false);
        this.setPosition(Vector2.Zero());
        this.gravityGrid.setCenterAndSize(this.position, this.size);
        this.movingMesh.position.y = 0;
        this.isDead = false;
        
        this.shine();
        this.show();

        this.updateCategory(this.category, true);
        this.system.checkActiveMeshes();
    }

    dispose() {
        this.setMoving(false);
        this.fixeCamera(true);
    }

    show() {
        if (this.isStarVisible) return;
        this.isStarVisible = true;
        this.setSize(this.size);
        this.setOpacity(1);
    }

    hide() {
        if (!this.isStarVisible) return;
        this.isStarVisible = false;
        this.setSize(0);
        this.setOpacity(0);
    }
}