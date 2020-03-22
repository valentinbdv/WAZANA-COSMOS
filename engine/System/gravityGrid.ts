import { SystemAsset } from './systemAsset';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { GridMaterial } from '@babylonjs/materials/grid/gridMaterial';
import { EasingFunction, CubicEase,  } from '@babylonjs/core/Animations/easing';
import remove from 'lodash/remove';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class GravityGrid {

    system: SystemAsset;
    starCurve: EasingFunction;
    blackHoleCurve: EasingFunction;

    constructor(system: SystemAsset) {
        this.system = system;

        this.initMap();
        this.addGridRibbon();
        this.addRibbon();
        
        let frame = true;
        this.system.scene.registerBeforeRender(() => {
            if (frame) {
                try {
                    if (this.paths.length == 0) return;
                    this.ribbon = Mesh.CreateRibbon(null, this.paths, null, null, null, null, null, null, this.ribbon);
                    this.gridRibbon = Mesh.CreateRibbon(null, this.paths, null, null, null, null, null, null, this.gridRibbon);
                    // this.ribbon.convertToFlatShadedMesh();
                    // this.gridRibbon.convertToFlatShadedMesh();
                } catch {
                    console.log('maperror');
                    console.log(this.paths);
                }
            }
            frame = !frame;
        });

        this.starCurve = new CubicEase();
        this.starCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        this.blackHoleCurve = new CubicEase();
        this.blackHoleCurve.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    }

    gridRibbon: Mesh;
    // ribbonMaterial: PBRMaterial;
    gridMaterial: GridMaterial;
    gridSize = 3;
    addGridRibbon() {
        var sideO = Mesh.BACKSIDE;
        this.gridRibbon = Mesh.CreateRibbon("gridRibbon", this.paths, false, false, 0, this.system.scene, true, sideO);
        this.gridRibbon.alwaysSelectAsActiveMesh = true;
        this.gridRibbon.doNotSyncBoundingInfo = true;
        this.gridRibbon.rotation.x = Math.PI;
        this.gridRibbon.position.y = 0.01;
        // this.gridRibbon.convertToFlatShadedMesh();
        // this.gridRibbon.renderingGroupId = 2;
        // this.gridRibbon.isVisible = false;

        this.gridMaterial = new GridMaterial("groundMaterial", this.system.scene);
        this.gridMaterial.lineColor = new Color3(0.8, 1, 0.8);
        this.gridMaterial.mainColor = new Color3(0.8, 1, 0.8);
        this.gridMaterial.gridRatio = this.gridSize;
        this.gridMaterial.majorUnitFrequency = this.gridSize;
        this.gridMaterial.minorUnitVisibility = 0.2;

        // Force opacity != 1 to have no main color on grid
        this.gridMaterial.opacity = 0.1;

        this.gridRibbon.material = this.gridMaterial;
    }

    ribbon: Mesh;
    // ribbonMaterial: PBRMaterial;
    material: PBRMaterial;
    addRibbon() {
        var sideO = Mesh.BACKSIDE;
        this.ribbon = Mesh.CreateRibbon("ribbon", this.paths, false, false, 0, this.system.scene, true, sideO);
        this.ribbon.alwaysSelectAsActiveMesh = true;
        this.ribbon.doNotSyncBoundingInfo = true;
        // this.ribbon.convertToFlatShadedMesh();
        // this.gridRibbon.renderingGroupId = 3;
        // this.ribbon = Mesh.CreatePlane("ribbon", 10, this.system.scene);
        // this.ribbon.isVisible = false;
        this.ribbon.rotation.x = Math.PI;
        
        this.ribbon.material = this.system.ribbonMaterial;
    }

    mapDetail = 20;
    mapSize = 150;
    halfSize: number;
    halfDetail: number;
    step:number;
    paths: Array<Array<Vector3>>;
    pathToKeys: Array<Array<string>>;
    keysToPath = {};
    center = new Vector2(1, 1);
    initMap() {
        this.halfDetail = this.mapDetail / 2;
        this.setCenterAndSize(Vector2.Zero(), 1);
    }
    
    setCenterAndSize(pos: Vector2, size: number) {
        size = Math.max(size, 2);
        // Whatever the size of the player, the ribbon will get bigger and small to alway take the all screen
        let halfSize = Math.round(size * this.mapSize / 2);
        this.halfSize = Math.round(halfSize / this.mapDetail) * this.mapDetail;
        this.step = Math.round(2 * this.halfSize / this.mapDetail);
        
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
        // console.log(newPaths);
        
        this.paths = newPaths;
        this.pathToKeys = newPathToKeys;
    }

    setStarPoint(key:string, pos: Vector2, size: number, depth?: number) {
        this.setMassPoint(key, pos, size, this.starCurve, depth);
    }


    setBlackHolePoint(key: string, pos: Vector2, size: number, depth?: number) {
        this.setMassPoint(key, pos, size, this.blackHoleCurve, depth);
    }


    pointDepth = 20;
    pointSize = 3;
    setMassPoint(key: string, pos: Vector2, size: number, curve: EasingFunction, depth?: number) {
        this.eraseMass(key);
        let MassToCenter = Vector2.Distance(pos, this.center);
        // If too far from center, ignore it
        if (MassToCenter > this.halfSize) return;
        let mapPos = pos.subtract(this.center);
        let xRound = (Math.round(mapPos.x / this.step)) + this.halfDetail;
        let yRound = (Math.round(-mapPos.y / this.step)) + this.halfDetail;

        let alteredPoints: Array<Vector3> = [];
        if (!depth) depth = size * this.pointDepth;
        let width = Math.round(size * this.pointSize * this.mapDetail / 20);
        let newKeysToPath = [];

        for (let x = Math.max(xRound - width, 0); x < Math.min(xRound + width, this.mapDetail); x++) {
            for (let y = Math.max(yRound - width, 0); y < Math.min(yRound + width, this.mapDetail); y++) {
                if (!this.paths[x] || !this.paths[x][y]) return;
                let dist = Vector2.Distance(mapPos, new Vector2(x * this.step - this.halfSize, -(y * this.step - this.halfSize)));
                let perc = curve.ease(dist / (size * 30));
                let newY = Math.max(depth - depth * perc, 0);

                if (newY > this.paths[x][y].y) {
                    this.paths[x][y].y = newY;
                    alteredPoints.push(this.paths[x][y]);
                    let currentkey = this.pathToKeys[x][y];
                    if (currentkey) {
                        remove(this.keysToPath[currentkey], (xy) => { return xy == [x, y] });
                    }
                    this.pathToKeys[x][y] = key;
                    newKeysToPath.push([x, y]);
                }
            }
        }

        this.keysToPath[key] = newKeysToPath;
    }

    eraseMass(key: string) {
        if (this.keysToPath[key] && this.keysToPath[key].length) {
            for (let i = 0; i < this.keysToPath[key].length; i++) {
                if (!this.keysToPath[key] || !this.keysToPath[key][i]) return;
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