import { System } from '../System/system';

import { Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { PositionEntity, PositionEntityInterface } from './positionEntity';
import { Animation } from '../System/animation';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';

export interface PlanetInterface extends PositionEntityInterface {
    radius ? : number,
    velocity ? : number,
}

export class Planet extends PositionEntity {

    color?: Array<number>;
    radius?: number;
    velocity?: number;

    offset = 0; // Used to determine beginning position around star
    cycle = 0; // Around its star % Math.PI

    showAnimation: Animation;

    constructor(system: System, options: PlanetInterface) {
        super('planet', system, options);

        this.addMesh();
        if (options.radius && options.velocity) this.setGeostationnaryMovement(options.radius, options.velocity);
        if (options.size) this.setSize(options.size);
        if (options.position) this.setPosition(new Vector2(options.position.x, options.position.y));
        this.showAnimation = new Animation(this.system.animationManager);
        this.show();
    }

    setGeostationnaryMovement(radius: number, velocity: number) {
        this.radius = radius;
        this.velocity = velocity;
    }

    mesh: InstancedMesh;
    addMesh() {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        this.mesh = this.system.planetMesh.createInstance(this.key + "duststar");
        this.mesh.alwaysSelectAsActiveMesh = true;
        this.mesh.doNotSyncBoundingInfo = true;
        this.mesh.isVisible = true;
        this.mesh.rotation.x = Math.random() * Math.PI;
        this.mesh.rotation.y = Math.random() * Math.PI;
        this.mesh.rotation.z = Math.random() * Math.PI;
    }

    show() {
        let size = 0.8 + Math.random() * 0.4;
        this.showAnimation.simple(50, (count, perc) => {
            this.mesh.scaling = new Vector3(perc * size, perc * size, perc * size);
        }, () => {
            this.mesh.scaling = new Vector3(size, size, size);
        });
    }

    setParent(parent: AbstractMesh) {
        this.mesh.parent = parent;
    }

    setOffset(offset: number) {
        this.offset = offset;
    }

    setSize(size: number) {
        this._setSize(size);
        let newsize = Math.sqrt(size / 2);
        let sizeVector = new Vector3(newsize, newsize, newsize);
        this.mesh.scaling = sizeVector;
    }

    position: Vector2;
    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.y;
        this.mesh.position.y = 1;
    }

}