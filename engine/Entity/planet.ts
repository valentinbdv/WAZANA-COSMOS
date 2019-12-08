import { System } from '../System/system';
import { PearlMesh } from './pearlMesh';

import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

export interface PlanetInterface {
    texture?: string,
    color ? : Array < number >,
    size ? : number,
    damage?: number,
    radius ? : number,
    velocity ? : number,
    // life?: number,
}

export class Planet {

    key: string;

    system: System;

    mesh: PearlMesh;
    color?: Array<number>;
    size?: number;
    damage?: number;
    radius?: number;
    velocity?: number;

    constructor(system: System, options: PlanetInterface) {
        this.system = system;

        this.key = "star1";

        let color = Color3.FromInts(5 + options.color[0] / 20, 5 + options.color[1] / 20, 5 + options.color[2] / 20);
        this.addMesh(color);

        if (options.radius && options.velocity) this.setGeostationnaryMovement(options.radius, options.velocity);
        if (options.size) this.setSize(options.size);
    }

    setGeostationnaryMovement(radius: number, velocity: number) {
        this.radius = radius;
        this.velocity = velocity + Math.random() / 2;
    }

    meshMaterial: PBRMaterial;
    addMesh(color: Color3) {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        this.mesh = new PearlMesh(this.key + "planet", this.system.scene);
        
        this.meshMaterial = new PBRMaterial(this.key + "material", this.system.scene);
        // this.meshMaterial.roughness = 1;
        this.meshMaterial.emissiveColor = color;
        // console.log(this.meshMaterial);
        this.mesh.material = this.meshMaterial;
    }

    setParent(parent: AbstractMesh) {
        this.mesh.parent = parent;
    }


    setSize(size: number) {
        let newsize = Math.sqrt(size / 2);
        let sizeVector = new Vector3(newsize, newsize, newsize);
        this.mesh.scaling = sizeVector;
    }

}