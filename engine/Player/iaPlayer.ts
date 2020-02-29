import { SystemAsset } from '../System/systemAsset';
import { GravityGrid } from '../System/GravityGrid';
import { Player, startSize } from './player';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class IAPlayer extends Player {

    ia = true;

    constructor(system: SystemAsset, gravityGrid: GravityGrid) {
        super(system, gravityGrid, { temperature: 5000, size: startSize, position: { x: 0, y: 0 }, maxPlanet: 5 });
        this.startMovingAround();
        this.setSize(0.8 + Math.random() / 2);
    }

    moveInt;
    startMovingAround() {        
        this.moveInt = setInterval(() => {
            if (this.isDead) return clearInterval(this.moveInt);
            let move = new Vector2((Math.random() - 0.5), (Math.random() - 0.5));
            this.moveCatcher.catch(move);
        }, 2000);
    }

    // explode(callback: Function) {
    //     clearInterval(this.moveInt);
    //     this._explode(callback);
    // }

    goToPlayer(player: Player) {
        let move = player.position.subtract(this.position);
        move.x += (Math.random() - 0.5) * 2;
        move.y += (Math.random() - 0.5) * 2;
        this.moveCatcher.catch(move);
    }

    dispose() {
        clearInterval(this.moveInt);
        this._disposePlayer();
    }
}