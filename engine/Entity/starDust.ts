import { System } from '../System/system';
import { PositionEntity, PositionEntityInterface } from './positionEntity';
import { Animation } from '../System/animation';

import { Vector2, Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { IEasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';

export interface StarDustInterface extends PositionEntityInterface {
    temperature: number,
}

export class StarDust extends PositionEntity {

    animation: Animation;
    curve: IEasingFunction;

    constructor(system: System, options: StarDustInterface) {
        super('dust', system, options);
        this.animation = new Animation(this.system.animationManager);
        this.addMesh();
        this.curve = new CubicEase();
    }

    mesh: InstancedMesh;
    addMesh() {
        this.mesh = this.system.dustMesh.createInstance(this.key + "duststar");
        this.mesh.alwaysSelectAsActiveMesh = true;
        this.mesh.doNotSyncBoundingInfo = true;
        this.mesh.material.emissiveColor = new Color3(Math.random(), Math.random(), Math.random());
        this.setSize(0);
        this.hide();
    }

    oscillate() {
        let random = Math.random() * 10;
        this.animation.infinite((count, perc) => {
            let cossin = new Vector2(Math.cos(random + count / 100) / 100, Math.sin(random + count / 100) / 100);
            let newPos = this.position.add(cossin);
            this.setPosition(newPos);
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

    fixeAnimationLength = 40;
    goToEntity(entity: PositionEntity, callback?: Function) {
        this.animation.simple(this.fixeAnimationLength / 2, (count, perc) => {
            let progress = this.curve.ease(perc);
            let sizeProgress = Math.sqrt(this.size) * (1 - progress/2);
            this.mesh.scaling = new Vector3(sizeProgress, sizeProgress, sizeProgress);
            
            let change = entity.position.subtract(this.position);
            // let changePos = change.multiply(new Vector2(step, step));
            let changePos = change.multiply(new Vector2(progress, progress));
            let newPos = this.position.add(changePos);
            this.setPosition(newPos);
        }, () => {
            this.hide();
            if (callback) callback();
        });
    }

    show() {
        // this.mesh.isVisible = true;
        let size = 0.01 + Math.random() * 0.1;
        this.animation.simple(50, (count, perc) => {
            this.setSize(perc * size);
        }, () => {
            this.setSize(size);
            this.oscillate();
        });
    }

    hide() {
        this.setSize(0);
        // this.mesh.isVisible = false;
     }
}