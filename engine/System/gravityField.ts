import { System } from './system';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Color4, Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { GridMaterial } from '@babylonjs/materials/grid/gridMaterial';
import { IEasingFunction, CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class GravityField {

    system: System;
    curve: IEasingFunction;

    constructor(system: System) {
        this.system = system;

        this.initPath();
        this.addGridRibbon();
        this.addRibbon();
        
        this.system.scene.registerBeforeRender(() => {
            this.ribbon = Mesh.CreateRibbon(null, this.paths, null, null, null, null, null, null, this.ribbon);
            this.gridRibbon = Mesh.CreateRibbon(null, this.paths, null, null, null, null, null, null, this.gridRibbon);
        });


        this.curve = new CubicEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    }

    gridRibbon: Mesh;
    // ribbonMaterial: PBRMaterial;
    gridMaterial: GridMaterial;
    gridSize = 3;
    addGridRibbon() {
        var sideO = Mesh.BACKSIDE;
        this.gridRibbon = Mesh.CreateRibbon("gridRibbon", this.paths, false, false, 0, this.system.scene, true, sideO);
        this.gridRibbon.rotation.x = Math.PI;
        this.gridRibbon.position.y = 0.01;
        // this.gridRibbon.renderingGroupId = 2;
        // this.gridRibbon.isVisible = false;

        this.gridMaterial = new GridMaterial("groundMaterial", this.system.scene);
        this.gridMaterial.lineColor = new Color3(0.8, 1, 0.8);
        this.gridMaterial.mainColor = new Color3(0.8, 1, 0.8);
        this.gridMaterial.gridRatio = this.gridSize;
        this.gridMaterial.majorUnitFrequency = this.gridSize;
        this.gridMaterial.minorUnitVisibility = 1;

        // Force opacity != 1 to have no main color on grid
        this.gridMaterial.opacity = 0.99;

        console.log(this.gridRibbon);
        this.gridRibbon.material = this.gridMaterial;
    }

    ribbon: Mesh;
    // ribbonMaterial: PBRMaterial;
    material: PBRMaterial;
    addRibbon() {
        var sideO = Mesh.BACKSIDE;
        this.ribbon = Mesh.CreateRibbon("ribbon", this.paths, false, false, 0, this.system.scene, true, sideO);
        // this.gridRibbon.renderingGroupId = 3;
        // this.ribbon = Mesh.CreatePlane("ribbon", 10, this.system.scene);
        // this.ribbon.isVisible = false;
        this.ribbon.rotation.x = Math.PI;
        this.material = new PBRMaterial("material", this.system.scene);
        this.material.reflectionTexture = this.system.scene.environmentTexture.clone();
        this.material.reflectionTexture.level = 0.2;

        this.material.roughness = 0.5;
        this.material.metallic = 0.5;
        this.material.alpha = 1;
        console.log(this.ribbon);

        this.ribbon.material = this.material;
    }

    mapDetail = 100;
    mapSize = 100;
    step = 1;
    paths: Array< Array< Vector3 > >;
    initPath() {
        let halfMap = this.mapDetail / 2;
        this.step = this.mapSize / this.mapDetail;
        var mainpath = [];
        for (let i = -halfMap; i < halfMap; i += this.step) {
            var linepath = [];
            for (let j = -halfMap; j < halfMap; j += this.step) {
                linepath.push(new Vector3(i, 0, j));
            }
            mainpath.push(linepath);
        }
        this.paths = mainpath;
    }

    pointDepth = 5;
    pointSize = 5;
    setStarPoint(pos: Vector2, size: number): Array< Vector3 > {
        let halfMap = this.mapDetail / 2
        let xRound = (Math.round(pos.x) / this.step) + halfMap;
        let zRound = (Math.round(-pos.y) / this.step) + halfMap;
        let alteredPoints: Array < Vector3 > = [];
        let depth = size * this.pointDepth;
        let width = Math.round(size * this.pointSize * this.mapDetail / 20);
        for (let x = xRound - width; x < xRound + width; x += this.step) {
            let xX = x - xRound;
            for (let z = zRound - width; z < zRound + width; z += this.step) {
                let zX = z - zRound;
                let dist = Vector2.Distance(pos, new Vector2(x - halfMap, -(z - halfMap)));
                this.paths[x][z].y = Math.max(depth - depth * this.curve.ease(dist / width), 0);
                alteredPoints.push(this.paths[x][z]);
            }
        }
        return alteredPoints;
    }
}