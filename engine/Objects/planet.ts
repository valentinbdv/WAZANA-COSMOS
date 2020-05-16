import { MeshSystem } from '../System/meshSystem';

import { Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { SatelliteEntity, SatelliteEntityInterface } from '../Entity/satelliteEntity';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';

export interface PlanetInterface extends SatelliteEntityInterface {
    radius ? : number,
    velocity ? : number,
}

export class Planet extends SatelliteEntity {

    color?: Array<number>;

    constructor(system: MeshSystem, options: PlanetInterface) {
        super('planet', system, options);

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

    show() {
        // this.mesh.isVisible = true;
        let size = 0.8 + Math.random() * 0.4;
        this.satelliteAnimation.simple(50, (count, perc) => {
            this.setTransformMeshSize(perc * size)
        }, () => {
            this.setTransformMeshSize(size)
        });
    }

    hide() {
        this.setSize(0);
        this.reset();
        // this.mesh.isVisible = false;
    }
    
    reset() {
        this.setOffset(0);
        this.satelliteAnimation.stop();
        this.setPosition(Vector2.Zero());
        this.cycle = 0;
        this.setParent(null);
    }
}