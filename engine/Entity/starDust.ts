import { System } from '../System/system';
import { PositionEntity, PositionEntityInterface } from './positionEntity';
import { Animation } from '../System/animation';

import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { IEasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';

export interface StarDustInterface extends PositionEntityInterface {
    temperature: number,
}

export class StarDust extends PositionEntity {

    showAnimation: Animation;
    curve: IEasingFunction;

    constructor(system: System, options: StarDustInterface) {
        super('dust', system, options);

        this.showAnimation = new Animation(this.system.animationManager);
        this.addDust();
        this.show();
        this.curve = new CubicEase();
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

    fixeAnimationLength = 20;
    goToEntity(entity: PositionEntity, callback?: Function) {
        let step = 1 - (1 / this.fixeAnimationLength);
        this.showAnimation.simple(this.fixeAnimationLength, (count, perc) => {
            let progress = this.curve.ease(perc);
            let sizeProgress = Math.sqrt(this.size) * (1 - progress);
            this.mesh.scaling = new Vector3(sizeProgress, sizeProgress, sizeProgress);
            
            let change = entity.position.subtract(this.position);
            let changePos = change.multiply(new Vector2(step, step));
            // let changePos = change.multiply(new Vector2(1 - progress, 1 - progress));
            let newPos = entity.position.subtract(changePos);
            this.setPosition(newPos);
        }, () => {
            this.mesh.dispose();
            if (callback) callback();
        });
    }
}