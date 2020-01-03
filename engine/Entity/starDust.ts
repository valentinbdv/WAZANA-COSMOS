import { System } from '../System/system';
import { PositionEntity, PositionEntityInterface } from './positionEntity';
import { Animation } from '../System/animation';

import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';

export interface StarDustInterface extends PositionEntityInterface {
    temperature: number,
}

export class StarDust extends PositionEntity {

    showAnimation: Animation;

    constructor(system: System, options: StarDustInterface) {
        super('dust', system, options);

        this.showAnimation = new Animation(this.system.animationManager);
        this.addDust();
        this.show();
    }

    mesh: InstancedMesh;
    addDust() {
        this.mesh = this.system.dustMesh.createInstance(this.key + "duststar");
        this.setSize(0);
    }

    show() {
        let size = 0.01 + Math.random() * 0.1;
        this.showAnimation.simple(50, (count, perc) => {
            this.setSize(perc * size);
        }, () => {
            this.setSize(size);
        });
    }

    setSize(size: number) {
        this._setSize(size);
        let newsize = Math.sqrt(size);
        let sizeVector = new Vector3(newsize, newsize, newsize);
        this.mesh.scaling = sizeVector;
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.y;
        this.mesh.position.y = 1;
    }
}