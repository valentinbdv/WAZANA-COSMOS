import { System } from '../System/system';
import { MoveCatcher } from './moveCatcher';
import { GravityField } from '../System/gravityField';
import { Player } from './player';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class IAPlayer extends Player {

    constructor(system: System, gravityField: GravityField) {
        super(system, gravityField);
        this.startMovingAround();
    }

    moveInt;
    startMovingAround() {
        let moveCatcher = new MoveCatcher(this.system.animationManager);
        this.addCactcher(moveCatcher);
        
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