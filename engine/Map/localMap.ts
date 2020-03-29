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
                this.checkRessourceMap();
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
        let palyerGravityField = player.gravityField;
        for (const key in this.tileMap.players) {
            const otherplayer: Player = this.tileMap.players[key];
            if (otherplayer.isStarVisible && otherplayer.key != player.key && player.size > otherplayer.size) {
                let dist = Vector2.Distance(player.position, otherplayer.position);
                if (minDist > dist) {
                    minDist = dist;
                    closestTarget = otherplayer;
                    if (dist < palyerGravityField) {
                        testTarget = otherplayer.key;
                    }
                }
            }

        }

        if (testTarget) {
            let otherPlayer: Player = this.tileMap.players[testTarget]
            player.absorbTarget(otherPlayer);
            otherPlayer.setAbsorber(player, minDist / palyerGravityField);
            return true;
        } else {
            player.absorbStop();
            if (player.ia) player.checkAction(closestTarget);
            return false;
        }

    }

    planetDensity = 200;
    checkRessourceMap() {
        let newPlanetNeeded = this.planetDensity - Object.keys(this.tileMap.planets).length;
        for (let i = 0; i < newPlanetNeeded; i++) {
            this.addNewPlanet();
        }
    }

    checkPlanetMap(player: Player) {
        // add planet while accelerating create bug with planet
        if (player.accelerating) return;
        if (Object.keys(player.planets).length < player.maxPlanet) {
            for (const key in this.tileMap.planets) {
                const planet: Planet = this.tileMap.planets[key];
                // New check of attachedToStar because in the loop it can change
                if (!planet.attachedToStar) {
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
        let pos = this.tileMap.getNewRandomPosition();
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
        let newIa = new IAPlayer(this.system, this.gravityGrid);
        let pos = this.getFreePosition();
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

    getFreePosition(): Vector2 {
        let test = true;
        let distProgress = starMapDistance/2;
        while (test) {
            let pos = this.tileMap.getNewRandomPositionFromCenter(this.tileMap.playerToFollow.position, distProgress, distProgress);
            let distTest = true;
            for (const key in this.tileMap.players) {
                let player: Player = this.tileMap.players[key];
                let dist = Vector2.Distance(pos, player.position);
                if (dist < 25) { distTest = false; }
            }
            if (distTest) {
                test = false;
                return pos;
            }
            distProgress += 5;
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