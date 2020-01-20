import { System } from '../System/system';
import { MoveCatcher } from './moveCatcher';
import { GravityGrid } from '../System/GravityGrid';
import { Player } from './player';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class IAPlayer extends Player {

    ia = true;

    constructor(system: System, gravityGrid: GravityGrid) {
        super(system, gravityGrid);
        this.startMovingAround();
        this.setSize(0.6);
    }

    moveInt;
    startMovingAround() {
        let moveCatcher = new MoveCatcher(this.system.animationManager);
        this.addCactcher(moveCatcher);
        
        this.moveInt = setInterval(() => {
            let move = new Vector2((Math.random() - 0.5), (Math.random() - 0.5));
            this.moveCatcher.catch(move);
        }, 2000);
    }

    explode(callback: Function) {
        clearInterval(this.moveInt);
        this._explode(callback);
    }

    goToPlayer(player: Player) {
        let move = player.position.subtract(this.position);
        move.x += (Math.random() - 0.5) * 2;
        move.y += (Math.random() - 0.5) * 2;
        this.moveCatcher.catch(move);
    }
}