import { MeshSystem } from '../System/meshSystem';

import { Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { GeostationaryEntity, GeostationaryEntityInterface } from '../Entity/geostationaryEntity';
import { Animation } from '../System/animation';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';

export interface PlanetInterface extends GeostationaryEntityInterface {
    radius ? : number,
    velocity ? : number,
}

export class Planet extends GeostationaryEntity {

    color?: Array<number>;

    offset = 0; // Used to determine beginning position around star
    cycle = 0; // Around its star % Math.PI

    animation: Animation;

    constructor(system: MeshSystem, options: PlanetInterface) {
        super('planet', system, options);
        this.animation = new Animation(this.system.animationManager);

        this.addMesh();
        this.hide();
    }

    setOptions(options: PlanetInterface) {
        if (options.radius && options.velocity) this.setGeostationnaryMovement(options.radius, options.velocity);
        if (options.size) this.setSize(options.size);
        if (options.position) this.setPosition(new Vector2(options.position.x, options.position.y));
    }

    mesh: InstancedMesh;
    addMesh() {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        // this.mesh = this.system.planetMesh.clone(this.key + "duststar");
        this.mesh = this.system.planetMesh.createInstance(this.key + "duststar");
        this.mesh.alwaysSelectAsActiveMesh = true;
        this.mesh.doNotSyncBoundingInfo = true;
        this.mesh.isVisible = true;
        this.mesh.rotation.x = Math.random() * Math.PI;
        this.mesh.rotation.y = Math.random() * Math.PI;
        this.mesh.rotation.z = Math.random() * Math.PI;
        this.mesh.parent = this.transformMesh;
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

    show() {
        // this.mesh.isVisible = true;
        let size = 0.8 + Math.random() * 0.4;
        this.animation.simple(50, (count, perc) => {
            this.mesh.scaling = new Vector3(perc * size, perc * size, perc * size);
        }, () => {
            this.mesh.scaling = new Vector3(size, size, size);
        });
    }

    hide() {
        this.setSize(0);
        this.reset();
        // this.mesh.isVisible = false;
    }
    
    reset() {
        this.setOffset(0);
        this.animation.stop();
        this.setPosition(Vector2.Zero());
        this.cycle = 0;
        this.setParent(null);
    }
}