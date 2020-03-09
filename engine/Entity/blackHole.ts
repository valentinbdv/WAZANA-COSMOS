import { SystemAsset } from '../System/systemAsset';
import { Animation } from '../System/animation';
import { GravityGrid } from '../System/GravityGrid';
import { MovingEntity, MovingEntityInterface } from './movingEntity';

import { Vector2 } from '@babylonjs/core/Maths/math';

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
    depth = 150;

    constructor(system: SystemAsset, gravityGrid: GravityGrid, options: BlackHoleInterface) {
        super('blackhole', system, options);
        this.gravityGrid = gravityGrid;

        if (options.position) {
            let pos = new Vector2(options.position.x, options.position.y);
            this.setPosition(pos);
        }
        this.build();
        this.startMovingAround();
    }

    moveInt;
    startMovingAround() {
        this.addCactcher();

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
        }, () => {
            this.startMovingAround();
            this.moveAround();
        });
    }
}