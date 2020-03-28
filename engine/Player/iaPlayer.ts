import { MeshSystem } from '../System/meshSystem';
import { GravityGrid } from '../System/GravityGrid';
import { Player, startSize, maxSize } from './player';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class IAPlayer extends Player {

    ia = true;

    constructor(system: MeshSystem, gravityGrid: GravityGrid) {
        super(system, gravityGrid, { temperature: 5000, size: startSize, position: { x: 0, y: 0 }, maxPlanet: 5 });
        
        let random = Math.pow(Math.random(), 10);
        let size = startSize + random * maxSize;
        this.setSize(size);
    }

    level = 1;
    setLevel(level: number) {
        this.level = level;
    }

    moveInt;
    startMovingAround() {     
        this.moveAround();   
        if (this.moveInt) return;
        this.moveInt = setInterval(() => {
            if (this.isDead) return this.stopMovingAround();
            if (!this.goingToPlayer) this.moveAround();
        }, 4000);
    }

    moveAround() {
        let move = new Vector2((Math.random() - 0.5), (Math.random() - 0.5));
        this.moveCatcher.catch(move);
    }

    stopMovingAround() {
        clearInterval(this.moveInt);
        this.moveInt = null;
    }

    checkAction(closestTarget: Player) {
        if (this.absorber) {
            let clumsy = Math.random() > 0.8 - ( this.level / 10);
            if (!clumsy) this.avoidAbsorption();
        } else if (closestTarget) {
            let dist = Vector2.Distance(this.position, closestTarget.position);
            let clumsy = Math.random() > 0.7 - (this.level / 10);
            if (dist < this.gravityField * 50 && !clumsy) this.goToPlayer(closestTarget);
            else this.moveAround();
        } else {
            this.goingToPlayer = false;
        }
    }

    avoidAbsorption() {
        let direction = this.absorber.position.subtract(this.position);
        let moveToavoid = this.position.add(direction);
        this.moveCatcher.catch(moveToavoid);
        if (Math.random() > 0.5 && this.planets.length && !this.accelerating) this.accelerate();
    }

    goingToPlayer = false;
    goToPlayer(player: Player) {
        this.goingToPlayer = true;
        let move = player.position.subtract(this.position);
        move.x += (Math.random() - 0.5) * 2;
        move.y += (Math.random() - 0.5) * 2;
        this.moveCatcher.catch(move);
    }

    dispose() {
        this.stopMovingAround();
        this._disposePlayer();
    }

    showIA() {
        if (this.isStarVisible) return;
        this.show();
        this.startMovingAround();
    }

    hideIA() {
        if (!this.isStarVisible) return;
        this.hide();
    }

}