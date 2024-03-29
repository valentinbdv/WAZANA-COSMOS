import { MeshSystem } from '../System/meshSystem';
import { PositionEntity } from '../Entity/positionEntity';
import { Animation } from '../System/animation';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';


export class StarDust extends PositionEntity {

    animation: Animation;
    curve: EasingFunction;

    constructor(system: MeshSystem) {
        super('dust', system);
        this.animation = new Animation(this.system.animationManager);
        this.addMesh();
        this.curve = new CubicEase();
    }

    mesh: InstancedMesh;
    addMesh() {
        this.mesh = this.system.dustMesh.createInstance(this.key + "duststar");
        // let random = Math.random();
        // if (random < 0.25) this.mesh = this.system.dustMesh1.createInstance(this.key + "duststar");
        // else if (random < 0.5) this.mesh = this.system.dustMesh2.createInstance(this.key + "duststar");
        // else if (random < 0.75) this.mesh = this.system.dustMesh3.createInstance(this.key + "duststar");
        // else this.mesh = this.system.dustMesh4.createInstance(this.key + "duststar");
        this.mesh.alwaysSelectAsActiveMesh = true;
        this.mesh.doNotSyncBoundingInfo = true;
        this.mesh.parent = this.transformMesh;
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

    fixeAnimationLength = 40;
    goToEntity(entity: PositionEntity, callback?: Function) {
        this.animation.simple(this.fixeAnimationLength / 2, (count, perc) => {
            let progress = this.curve.ease(perc);
            let sizeProgress = this.size * (1 - progress/2);
            this.setTransformMeshSize(sizeProgress);
            
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
        let size = 0.04 + Math.random() * 0.4;
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