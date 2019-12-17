import { System } from './system';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { GridMaterial } from '@babylonjs/materials/grid/gridMaterial';
import { IEasingFunction, CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing';
import remove from 'lodash/remove';

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

        this.initMap();
        this.addGridRibbon();
        this.addRibbon();
        
        let frame = true;
        this.system.scene.registerBeforeRender(() => {
            if (frame) {
                this.ribbon = Mesh.CreateRibbon(null, this.paths, null, null, null, null, null, null, this.ribbon);
                this.gridRibbon = Mesh.CreateRibbon(null, this.paths, null, null, null, null, null, null, this.gridRibbon);
            }
            frame = !frame;
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

        this.ribbon.material = this.material;
    }

    mapDetail = 40;
    mapSize = 150;
    halfSize: number;
    halfDetail: number;
    step:number;
    paths: Array<Array<Vector3>>;
    pathToKeys: Array<Array<string>>;
    keysToPath = {};
    center = new Vector2(1, 1);
    initMap() {
        this.halfSize = this.mapSize / 2;
        this.halfDetail = this.mapDetail / 2;
        this.step = this.mapSize / this.mapDetail;
        this.setCenterMap(Vector2.Zero());
    }

    setCenterMap(pos: Vector2) {
        let xRound = Math.round(pos.x / this.step) * this.step;
        let yRound = Math.round(-pos.y / this.step) * this.step;
        let newCenter = new Vector2(xRound, -yRound);
        if (this.center.x == newCenter.x && this.center.y == newCenter.y) return;

        let newPaths = [];
        let newPathToKeys = [];
        for (let x = xRound - this.halfSize; x < xRound + this.halfSize; x += this.step) {
            var linepath = [];
            var linekey = [];
            for (let y = yRound - this.halfSize; y < yRound + this.halfSize; y += this.step) {
                linepath.push(new Vector3(x, 0, y));
                linekey.push('');
            }
            newPaths.push(linepath);
            newPathToKeys.push(linekey);
        }
        this.center = newCenter.clone();
        this.paths = newPaths;
        this.pathToKeys = newPathToKeys;
    }

    // setCenterMap(pos: Vector2) {
    //     let xRound = Math.round(pos.x / this.step) * this.step;
    //     let yRound = Math.round(-pos.y / this.step) * this.step;
    //     let newCenter = new Vector2(xRound, -yRound);
    //     if (this.center.x == newCenter.x && this.center.y == newCenter.y) return;
        
    //     let change = this.center.subtract(newCenter);
    //     let newPaths = [];
    //     let newPathToKeys = [];
    //     for (let x = xRound - this.halfSize; x < xRound + this.halfSize; x += this.step) {
    //         var linepath = [];
    //         var linekey = [];
    //         let pathX = x - change.x + this.halfSize;
    //         for (let y = yRound - this.halfSize; y < yRound + this.halfSize; y += this.step) {
    //             let pathY = y - change.y + this.halfSize;
    //             let newY = (this.paths[pathX] && this.paths[pathX][pathY]) ? this.paths[pathX][pathY].y : 0;
    //             linepath.push(new Vector3(x, newY, y));
    //             let newKey = (this.pathToKeys[pathX] && this.pathToKeys[pathX][pathY]) ? this.paths[pathX][pathY].y : '';
    //             linekey.push(newKey);
    //         }
    //         newPaths.push(linepath);
    //         newPathToKeys.push(linekey);
    //     }
    //     for (const key in this.keysToPath) {
    //         const paths = this.keysToPath[key];
    //         for (let i = 0; i < paths.length; i++) {
    //             const path = paths[i];
    //             path[0] += change.x;
    //             path[1] += change.y;
    //         }
    //     }
    //     this.center = newCenter.clone();
    //     this.paths = newPaths;
    //     this.pathToKeys = newPathToKeys;
    // }

    pointDepth = 8;
    pointSize = 5;
    setStarPoint(key:string, pos: Vector2, size: number) {
        let StarToCenter = Vector2.Distance(pos, this.center);
        this.eraseStar(key);
        if (StarToCenter + 10 * size * this.pointSize > this.halfSize) return;
        let mapPos = pos.subtract(this.center);
        let xRound = (Math.round(mapPos.x / this.step)) + this.halfDetail;
        let yRound = (Math.round(-mapPos.y / this.step)) + this.halfDetail;
        
        let alteredPoints: Array < Vector3 > = [];
        let depth = size * this.pointDepth;
        let width = Math.round(size * this.pointSize * this.mapDetail / 20);
        let newKeysToPath = [];
        
        for (let x = xRound - width; x < xRound + width; x++) {
            for (let y = yRound - width; y < yRound + width; y++) {
                let dist = Vector2.Distance(mapPos, new Vector2(x * this.step - this.halfSize, -(y * this.step - this.halfSize)));
                let perc = this.curve.ease(dist / (size * 30));
                let newY = Math.max(depth - depth * perc, 0);

                if (newY > this.paths[x][y].y) {
                    this.paths[x][y].y = newY;
                    alteredPoints.push(this.paths[x][y]);
                    let currentkey = this.pathToKeys[x][y];
                    if (currentkey) {
                        remove(this.keysToPath[currentkey], (xy) => { return xy == [x, y]});
                    }
                    this.pathToKeys[x][y] = key;
                    newKeysToPath.push([x, y]);
                }
            }
        }
      
        this.keysToPath[key] = newKeysToPath;
    }

    eraseStar(key: string) {
        if (this.keysToPath[key] && this.keysToPath[key].length) {
            for (let i = 0; i < this.keysToPath[key].length; i++) {
                const xy = this.keysToPath[key][i];
                if (this.pathToKeys[xy[0]] && this.pathToKeys[xy[0]][xy[1]] == key) {
                    this.paths[xy[0]][xy[1]].y = 0;
                    this.pathToKeys[xy[0]][xy[1]] = '';
                }
            }
            this.keysToPath[key] = [];
        }
    }
}