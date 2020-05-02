import { Planet, PlanetInterface } from '../Entity/planet';
import { Player } from '../player/player';
import { minSize, maxSize } from '../Entity/star';
import { TileMap } from './tileMap';
import { MeshSystem } from '../System/meshSystem';
import { GravityGrid } from '../System/GravityGrid';
import { BlackHole } from '../Entity/blackHole';

import { Vector2 } from '@babylonjs/core/Maths/math';
import find from 'lodash/find';
import { IAPlayer } from '../Player/iaPlayer';
import { StarCategory, StarCategories, starMapDistance } from '../Entity/star';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class LocalMap {

    system: MeshSystem;
    gravityGrid: GravityGrid;
    tileMap: TileMap

    constructor(system: MeshSystem, gravityGrid: GravityGrid, tileMap: TileMap) {
        this.system = system;
        this.gravityGrid = gravityGrid;
        this.tileMap = tileMap;

        setInterval(() => {
            if (this.tileMap.check) {
                this.checkPlayersAbsorbtion();
                this.checkPlanetRessourceMap();
                this.checkIaMap();
            }
        }, 200);
    }

    checkPlayersAbsorbtion() {
        for (const key in this.tileMap.players) {
            if (this.tileMap.players.hasOwnProperty(key)) {
                const player: Player = this.tileMap.players[key];
                if (player.isStarVisible) {
                    this.checkPlayerAbsorbtion(player);
                    this.checkPlanetMap(player);
                    this.checkPlayerSize(player);
                    if (player.size < minSize) this.playerDead(player);
                }
            }
        }
    }

    playerDead(player: Player) {
        this.tileMap.killPlayer(player);
        if (player.ia) this.removeIa(player);

        // Check if not absorbed by hole
        let isBlackHole = find(this.tileMap.blackHoles, (b: BlackHole) => { return b.key == player.absorbed })
        if (!isBlackHole) {
            // if (Math.random() > 0.5 && Object.keys(this.blackHoles).length < gravityRatio) this.createBlackHole(player);
            // this.createBlackHole(player.position.clone());
        }
    }

    // We reduce player too big
    checkPlayerSize(player: Player) {
        // if (player.size > maxSize - 1) player.changeSize(-player.size / 1000);
        player.changeSize(-player.size/10000);
    }

    checkPlayerAbsorbtion(player: Player) {
        let blackHoleTest = this.checkBlackHoleAbsorption(player);
        if (!blackHoleTest) this.checkPlayerAbsorption(player);
    }

    checkBlackHoleAbsorption(player: Player): boolean {
        let blackHoleTest = '';
        let minDist = 1000000;
        let minBlackHoleField = 1;
        for (const key in this.tileMap.blackHoles) {
            const blackHole: BlackHole = this.tileMap.blackHoles[key];
            let blackHoleField = blackHole.gravityField;
            let dist = Vector2.Distance(blackHole.position, player.position);
            if (dist < blackHoleField) {
                if (minDist > dist) {
                    minDist = dist;
                    minBlackHoleField = blackHoleField;
                    blackHoleTest = blackHole.key;
                }
            }
        }

        if (blackHoleTest) {
            let blackHole: BlackHole = this.tileMap.blackHoles[blackHoleTest]
            player.absorbByBlackHole(blackHole, minDist / minBlackHoleField);
            return true;
        } else {
            if (player.blackHoleAbsorber) player.absorbStop();
        }
        return false;
    }

    checkPlayerAbsorption(player: Player) {
        let closestTarget: Player;
        let minDist = 1000000;
        let testTarget = '';
        let playerGravityField = player.gravityField;
        for (const key in this.tileMap.players) {
            const otherplayer: Player = this.tileMap.players[key];
            if (otherplayer.isStarVisible && otherplayer.key != player.key && player.size > otherplayer.size) {
                let dist = Vector2.Distance(player.position, otherplayer.position);
                if (minDist > dist) {
                    minDist = dist;
                    closestTarget = otherplayer;
                    if (dist < playerGravityField) {
                        testTarget = otherplayer.key;
                    }
                }
            }

        }

        if (testTarget) {
            let otherPlayer: Player = this.tileMap.players[testTarget]
            player.absorbTarget(otherPlayer, minDist);
            otherPlayer.setAbsorber(player, minDist / playerGravityField);
            return true;
        } else {
            player.absorbStop();
            if (player.ia) player.checkAction(closestTarget);
            return false;
        }

    }

    planetDensity = 200;
    checkPlanetRessourceMap() {
        for (const key in this.tileMap.planets) {
            const planet = this.tileMap.planets[key];
            let dist = Vector2.Distance(planet.position, this.system.center);
            if (dist > this.planetDensity) {
                planet.hide();
                this.tileMap.storagePlanet(planet);
            }
        }
        let newPlanetAvailable = this.tileMap.planetsStorage.length;
        for (let i = 0; i < newPlanetAvailable; i++) {
            this.addNewPlanet();
        }
    }

    checkPlanetMap(player: Player) {
        // add planet while accelerating create bug with planet
        if (player.accelerating) return;
        if (Object.keys(player.planets).length < player.maxPlanet) {
            for (const key in this.tileMap.planets) {
                const planet: Planet = this.tileMap.planets[key];
                // New check maxPlanet because in the loop it can change
                if (Object.keys(player.planets).length < player.maxPlanet) {
                    let dist = Vector2.Distance(planet.position, player.position);
                    if (dist < player.gravityField) {
                        this.tileMap.setPlanetWithStar(planet);
                        player.addPlanet(planet);
                    }
                }
            }
        }
    }

    addNewPlanet() {
        let planetNumber = Object.keys(this.tileMap.planets).length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2);
        // let pos = this.tileMap.getNewRandomPosition();
        let pos = this.getFreePosition(10, 50, 50);
        let planetInterface: PlanetInterface = { position: pos, radius: radius, size: 1, velocity: velocity };
        let newPlanet = this.tileMap.addPlanet(planetInterface);
        return newPlanet;
    }

    iaLevel = 1;
    setIaLevel(level: number) {
        this.iaLevel = level;
    }

    iaNeeded = starMapDistance / 3;
    // iaNeeded = 2;
    ias: Object = {};
    checkIaMap() {
        let newIaNeeded = Math.round(this.iaNeeded - Object.keys(this.ias).length);
        for (let i = 0; i < newIaNeeded; i++) {
            this.createIa();
        }

        for (const key in this.ias) {
            const ia:IAPlayer = this.ias[key];
            if (ia.isStarOnScreen()) ia.showIA();
            else ia.hideIA();

            if (!ia.isStarOnMap()) {
                ia.dispose();
                this.removeIa(ia);
            }
        }
    }

    getRandomCategory(): StarCategory {
        let l = StarCategories.length;
        let alea = Math.round(Math.random() * l - 0.5);
        return StarCategories[alea];
    }

    createIa() {
        let newIa = new IAPlayer(this.system, this.gravityGrid, this.tileMap);
        let pos = this.getFreePosition(starMapDistance / 2, 25, 5);
        newIa.setPosition(pos);
        let cat = this.getRandomCategory();
        newIa.setCategory(cat, false);
        newIa.setLevel(this.iaLevel);
        this.addIa(newIa);
    }
    
    addIa(ia: IAPlayer) {
        this.ias[ia.key] = ia;
        this.tileMap.addPlayer(ia);
    }

    removeIa(ia: IAPlayer) {
        this.tileMap.removePlayer(this.ias[ia.key]);
        delete this.ias[ia.key];
    }

    getFreePosition(gap: number, close: number, step: number): Vector2 {
        let test = true;
        let distProgress = gap;
        while (test) {
            let pos = this.tileMap.getNewRandomPositionFromCenter(this.system.center, distProgress, distProgress);
            let distTest = true;
            for (const key in this.tileMap.players) {
                let player: Player = this.tileMap.players[key];
                let dist = Vector2.Distance(pos, player.position);
                if (dist < close) { distTest = false; }
            }
            if (distTest) {
                test = false;
                return pos;
            }
            distProgress += step;
        }
        return new Vector2(0, 0);
    }

    eraseAllIas() {
        for (const key in this.ias) {
            this.ias[key].dispose();
            this.removeIa(this.ias[key]);
        }
        this.ias =  {};
    }
}