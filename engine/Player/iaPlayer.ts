import { MeshSystem } from '../System/meshSystem';
import { GravityGrid } from '../System/GravityGrid';
import { Player, startSize, maxSize } from './player';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class IAPlayer extends Player {

    ia = true;

    constructor(system: MeshSystem, gravityGrid: GravityGrid) {
        super(system, gravityGrid, { temperature: 5000, size: startSize, position: { x: 0, y: 0 }, maxPlanet: 5 });
        
        let random = Math.pow(Math.random(), 10);
        let size = startSize / 2 + random * maxSize;
        this.setSize(size);
    }

    level = 1;
    setLevel(level: number) {
        this.level = level;
    }

    moveInt;
    startMovingAround() {        
        this.moveInt = setInterval(() => {
            if (this.isDead) return clearInterval(this.moveInt);
            let move = new Vector2((Math.random() - 0.5), (Math.random() - 0.5));
            this.moveCatcher.catch(move);
        }, 2000);
    }

    checkAction(closestTarget: Player) {
        if (this.absorber) {
            let clumsy = Math.random() > 0.8 - ( this.level / 10);
            if (!clumsy) this.avoidAbsorption();
        } else if (closestTarget) {
            let dist = Vector2.Distance(this.position, closestTarget.position);
            let clumsy = Math.random() > 0.6 - (this.level / 10);
            if (dist < this.gravityField * 50 && !clumsy) this.goToPlayer(closestTarget);
        }
    }

    avoidAbsorption() {
        let direction = this.absorber.position.subtract(this.position);
        let moveToavoid = this.position.add(direction);
        this.moveCatcher.catch(moveToavoid);
        if (Math.random() > 0.5 && this.planets.length && !this.accelerating) this.accelerate();
    }

    goToPlayer(player: Player) {
        let move = player.position.subtract(this.position);
        move.x += (Math.random() - 0.5) * 2;
        move.y += (Math.random() - 0.5) * 2;
        this.moveCatcher.catch(move);
    }

    dispose() {
        clearInterval(this.moveInt);
        this.hide();
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