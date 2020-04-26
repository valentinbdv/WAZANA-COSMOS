import { MeshSystem } from '../System/meshSystem';
import { StarDust } from '../Entity/starDust';

import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { Vector2 } from '@babylonjs/core/Maths/math';
import remove from 'lodash/remove';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class DustMap {

    system: MeshSystem;

    constructor(system: MeshSystem) {
        this.system = system;

        this.createAllDusts();
        this.createAllUpperDusts();
    }

    ////////// DUST

    dustNumbers = 200;
    dustsStorage: Array<StarDust> = [];
    createAllDusts() {        
        for (let i = 0; i < this.dustNumbers; i++) {
            let dust = new StarDust(this.system);
            this.dustsStorage.push(dust);
        }
    }

    dusts: Array<StarDust> = [];
    addDust(size?: number) {
        let dustSize = (size) ? size : 0.01;
        if (this.dustsStorage.length != 0) {
            let dust = this.dustsStorage.pop();
            dust.setSize(dustSize);
            dust.show();
            if (this.dusts.indexOf(dust) == -1) this.dusts.push(dust);
            return dust;
        }
        return false;
    }

    addDustField(position: Vector2) {
        let dustNumber = 50;
        for (let i = 0; i < dustNumber; i++) {
            let newDust = this.addDust(0.03);
            if (newDust) {
                let pos = this.getNewRandomPositionFromCenter(position, 20, 0);
                newDust.setPosition(pos);
            }
        }
    }

    removeDust(dust: StarDust) {
        let removeDust = remove(this.dusts, (p) => { return dust.key == p.key });
    }
    
    storageDust(dust: StarDust) {
        dust.hide();
        dust.animation.stop();
        if (this.dustsStorage.indexOf(dust) == -1) this.dustsStorage.push(dust);
    }

    eraseAllDusts() {
        for (let i = 0; i < this.dusts.length; i++) {
            this.storageDust(this.dusts[i]);
        }
        this.dusts = [];
    }

    ////////// UPPER DUST

    upperDustNumbers = 50;
    upperDusts: Array<InstancedMesh> = [];
    upDist = 100;
    createAllUpperDusts() {
        for (let i = 0; i < this.upperDustNumbers; i++) {
            let upperDust = this.system.upperDustMesh.createInstance('');
            upperDust.alwaysSelectAsActiveMesh = true;
            upperDust.doNotSyncBoundingInfo = true;
            upperDust.position.x = (Math.random() - 0.5) * this.upDist;
            upperDust.position.z = (Math.random() - 0.5) * this.upDist;
            upperDust.position.y = (Math.random() - 0.5) * 15 + 25;
            // upperDust.startPosition = upperDust.position.clone();
            this.upperDusts.push(upperDust);
        }

        // Tried to make shooting stars
        // let j = 0;
        // this.system.scene.registerBeforeRender(() => {
        //     for (let i = 0; i < this.upperDusts.length; i++) {
        //         let upperDust = this.upperDusts[i];
        //         upperDust.position.x = upperDust.startPosition.x + j * 1;
        //         upperDust.position.z = upperDust.startPosition.z + j * 1;
        //     }
        //     j++;
        //     if (j == 100) {console.log(0);
        //      j = 0;}
        // });
    }

    /////////// CHECK FUNCTIONS 

    dustDensity = 100;
    sizeDustRatio = 5;
    checkDustMap() {
        let c = this.system.center;
        let s = this.system.size;
        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Vector2.Distance(dust.position, c);
            if (dist > Math.sqrt(s) * this.sizeDustRatio * 15) {
                this.removeDust(dust);
                this.storageDust(dust);
            }
        }

        let newDustNeeded = Math.round(s * this.dustDensity - this.dusts.length);
        for (let i = 0; i < newDustNeeded; i++) {
            let newDust = this.addDust();
            if (newDust) {
                let pos = this.getNewDustRandomPosition();
                newDust.setPosition(pos);
            }
        }
    }

    checkUpperDustMap() {
        let c = this.system.center;
        let checkDist = this.upDist/2;
        for (let i = 0; i < this.upperDusts.length; i++) {
            const upperDust = this.upperDusts[i];
            let p = upperDust.position;
            if (p.x > c.x + checkDist) p.x -= checkDist * 2;
            if (p.x < c.x - checkDist) p.x += checkDist * 2;
            if (p.z > c.y + checkDist) p.z -= checkDist * 2;
            if (p.z < c.y - checkDist) p.z += checkDist * 2;
        }
    }

    getNewDustRandomPosition(): Vector2 {
        let c = this.system.center;
        let s = this.system.size;
        let sign1 = (Math.random() > 0.5) ? 1 : -1;
        let sign2 = (Math.random() > 0.5) ? 1 : -1;
        let x = c.x + sign1 * Math.sqrt(s) * (this.sizeDustRatio / 2 + Math.random() * this.sizeDustRatio * 10);
        let y = c.y + sign2 * Math.sqrt(s) * (this.sizeDustRatio / 2 + Math.random() * this.sizeDustRatio * 10);
        return new Vector2(x, y);
    }

    mapSize = 200;
    getNewRandomPosition(): Vector2 {
        let sign1 = (Math.random() > 0.5) ? 1 : -1;
        let sign2 = (Math.random() > 0.5) ? 1 : -1;
        let pos = new Vector2(0, 0);
        pos.x = sign1 * this.mapSize * Math.random();
        pos.y = sign2 * this.mapSize * Math.random();
        return pos;
    }

    getNewRandomPositionFromCenter(position: Vector2, size: number, gap: number): Vector2 {
        let angle = Math.random() * Math.PI * 2;
        let centerRatio = Math.pow(Math.random(), 1.5) * size;
        let x = Math.cos(angle) * (gap + centerRatio);
        let y = Math.sin(angle) * (gap + centerRatio);
        return new Vector2(position.x + x, position.y + y);
    }
    
}