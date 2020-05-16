import { UiSystem } from '../System/uiSystem';
import { MouseCatcher } from './mouseCatcher';
import { TouchCatcher } from './touchCatcher';
import { GravityGrid } from '../System/GravityGrid';
import { Player } from './player';
import { startSize } from '../Objects/star';
import { onlineMap } from '../Map/onlineMap';
import { PlanetMap } from '../Map/planetMap';

import hotkeys from 'hotkeys-js';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';

export class RealPlayer extends Player {

    map: onlineMap;
    dustField = false;
    realPlayer = true;
    system: UiSystem;

    constructor(system: UiSystem, gravityGrid: GravityGrid, planetMap: PlanetMap, map: onlineMap) {
        super(system, gravityGrid, planetMap, { temperature: 5000, size: startSize, position: { x: 0, y: 0 }, maxPlanet: 5 });
        this.addMouseEvent();
        this.addKeyEvent();
        this.addZoomCatcher();
        this.fixeCamera(true);
        this.map = map;

        hotkeys('space', (event, param) => {
            if (this.moving) this.realPlayerAccelerate();
        });

        window.addEventListener('click', () => {
            if (this.moving) this.realPlayerAccelerate();
        });

        setInterval(() => {
            if (this.moving) {
                this.gravityGrid.setCenterAndSize(this.position, this.size);
                this.system.setCenterAndSize(this.position, this.size);
                if (this.map.started) this.map.send({ position: this.position });
            }
        }, 500);

        window.addEventListener("resize", () => {
            this.checkScreenSize();
        });
        this.checkScreenSize();
    }

    // Test to use Motion Blur but not really working
    realPlayerAccelerate() {
        let test = this.accelerate(() => {
            // this.system.removeMotionBlur();
        });
        // if (test) this.system.addMotionBLur();
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

    maxRadius = 70;
    addZoomCatcher() {
        this.system.scene.registerBeforeRender(() => {
            if (!this.isDead) {
                let newRadius = Math.max(this.size * 60, 50);
                newRadius = Math.min(newRadius, this.maxRadius);
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

    checkScreenSize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.maxRadius = 120 * height / width;
        // if ( width > height )
    }

    fixeCamera(fixe: boolean) {
        if (fixe) {
            this.system.camera.setPosition(Vector3.Zero());
            this.system.camera.setTarget(Vector3.Zero());
            this.system.camera.alpha = 0;
            this.system.camera.beta = Math.PI / 6;
            this.system.camera.radius = 10;
            this.system.camera.parent = this.transformMesh;
        } else {
            this.system.camera.parent = null;
            let cameraPos = this.system.camera.getFrontPosition(0.01);
            let absolutPos = this.transformMesh.absolutePosition.add(cameraPos);
            this.system.camera.setPosition(absolutPos);
            this.system.camera.setTarget(this.transformMesh.absolutePosition.clone());
        }
    }

    restart() {
        this.fixeCamera(true);
        this.setSize(startSize);
        this.setOpacity(1);
        this.setRealVelocity(1);
        this.setMoving(false);
        this.setPosition(Vector2.Zero());
        this.gravityGrid.setCenterAndSize(this.position, this.size);
        this.transformMesh.position.y = 0;
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