import { MeshSystem } from '../System/meshSystem';
import { Animation } from '../System/animation';
import { GravityGrid } from '../System/GravityGrid';
import { MovingEntity, MovingEntityInterface } from './movingEntity';

import { Vector2 } from '@babylonjs/core/Maths/math';

export let BlackHoleDepth = 150;

export interface BlackHoleInterface extends MovingEntityInterface {
    life?: number,
    power?: number,
}

export class BlackHole extends MovingEntity {

    gravityGrid: GravityGrid;
    introAnimation: Animation;

    life: number;
    power: number;
    velocity = 0.5;
    size = 5;
    fullGravityField = 10;
    gravityField = 10;
    depth = BlackHoleDepth;

    constructor(system: MeshSystem, gravityGrid: GravityGrid, position: Vector2) {
        super('blackhole', system, {});
        this.gravityGrid = gravityGrid;

        this.setPosition(position);
        this.setSize(30);
        this.build();
        this.startMovingAround();
    }

    moveInt;
    startMovingAround() {
        this.moveInt = setInterval(() => {
            this.moveAround();
        }, 10000);
    }
    
    moveAround() {
        let move = new Vector2((Math.random() - 0.5), (Math.random() - 0.5));
        this.moveCatcher.catch(move);
    }

    setSize(size: number) {
        this._setSize(size);
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.gravityGrid.setBlackHolePoint(this.key, this.position, this.size, this.depth);
    }
    
    build() {
        this.introAnimation = new Animation(this.system.animationManager);
        this.introAnimation.simple(200, (count, perc) => {
            this.gravityGrid.setBlackHolePoint(this.key, this.position, this.size, perc * this.depth);
            this.setGravity(perc);
        }, () => {
            this.startMovingAround();
            this.moveAround();
        });
    }

    dispose() {
        clearInterval(this.moveInt);
        this.moveCatcher.stop();
        this.setMoving(false);
        this.movingMesh.dispose();
        this.gravityGrid.eraseMass(this.key);
    }
}