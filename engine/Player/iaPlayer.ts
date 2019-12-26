import { System } from '../System/system';
import { MoveCatcher } from './moveCatcher';
import { GravityField } from '../System/gravityField';
import { Player } from './player';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class IAPlayer extends Player {

    moveCatcher: MoveCatcher;

    constructor(system: System, gravityField: GravityField) {
        super(system, gravityField);
        this.startMovingAround();
    }

    moveInt;
    startMovingAround() {
        this.moveCatcher = new MoveCatcher(this.system.animationManager);
        this.moveCatcher.addListener((pos: Vector2, step: Vector2) => {
            step = step.multiplyInPlace(new Vector2(5, 5));
            this.move(step);
        });

        this.moveCatcher.start();

        this.moveInt = setInterval(() => {
            let move = new Vector2((Math.random() - 0.5)/5, (Math.random() - 0.5)/5);
            this.moveCatcher.catch(move);
        }, 2000);
    }

    explode() {
        clearInterval(this.moveInt);
        this._explode();
    }
}