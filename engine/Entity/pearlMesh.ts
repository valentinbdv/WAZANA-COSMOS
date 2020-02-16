import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { VertexBuffer } from '@babylonjs/core/Meshes/buffer';
import { Scene } from '@babylonjs/core/scene'
import { FloatArray } from '@babylonjs/core/types';

export class PearlMesh extends Mesh {

    constructor(name:string, scene: Scene, positions?: Array<number> | number) {
        super(name, scene);
        if (typeof positions == 'number') this._setIcoSphere(positions);
        else if (positions) this._setPositions(positions);
        else this._update(10);
        return this;
    }

    _setIcoSphere(subdivisions?:number, radius?:number) {
        let options:any = { subdivisions: subdivisions };
        if (subdivisions) options.subdivisions = subdivisions;
        else options.subdivisions = 2;
        if (radius) options.radius = radius;
        else options.radius = 0.7;
        var vertexData = VertexData.CreateIcoSphere(options);
        vertexData.applyToMesh(this, false);
    }

    pearlPositions: FloatArray;
    _setPositions(newpositions: FloatArray) {
        let vertexData = VertexData.CreateSphere({ segments: 2 });
        vertexData.applyToMesh(this, false);

        let indices = this.getIndices();
        let normals = [];
        this.setVerticesData(VertexBuffer.PositionKind, newpositions);
        VertexData.ComputeNormals(newpositions, indices, normals);
        this.setVerticesData(VertexBuffer.NormalKind, normals);
        this.convertToFlatShadedMesh();
    }

    _update(pearlSize: number) {
        let vertexData = VertexData.CreateSphere({ segments: 2 });
        vertexData.applyToMesh(this, false);
        let positions = this.getVerticesData(VertexBuffer.PositionKind);
        let numberOfPoints = positions.length / 3;

        let map = [];

        // The higher point in the sphere
        let max = [];

        for (let i = 0; i < numberOfPoints; i++) {
            let p = new Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

            if (p.y >= pearlSize / 2) {
                max.push(p);
            }

            let found = false;
            for (let index = 0; index < map.length && !found; index++) {
                let array = map[index];
                let p0 = array[0];
                if (p0.equals(p) || (p0.subtract(p)).lengthSquared() < 0.01) {
                    array.push(i * 3);
                    found = true;
                }
            }
            if (!found) {
                let array: Array<any> = [];
                array.push(p, i * 3);
                map.push(array);
            }

        }

        let randomNumber = function (min, max) {
            if (min == max) {
                return (min);
            }
            let random = Math.random();
            return ((random * (max - min)) + min);
        };

        map.forEach((array) => {
            let index, min = -pearlSize / 70, max = pearlSize / 70;
            let rx = randomNumber(min, max);
            let ry = randomNumber(min, max);
            let rz = randomNumber(min, max);

            for (index = 1; index < array.length; index++) {
                let i = array[index];
                positions[i] = (positions[i] + rx);
                positions[i + 1] = (positions[i + 1] + ry);
                positions[i + 2] = (positions[i + 2] + rz);
            }
        });

        positions = this.getVerticesData(VertexBuffer.PositionKind);
        this.pearlPositions = positions;
        this._setPositions(positions);
        return positions;
    }

    _getPositions() {
        return this.pearlPositions;
    }
}
