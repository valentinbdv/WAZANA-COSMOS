import { Planet, PlanetInterface } from '../Entity/planet';
import { Player, minSize } from '../player/player';
import { TileMap } from './map';
import { System } from '../System/system';
import { GravityGrid } from '../System/GravityGrid';
import { BlackHole } from '../Entity/blackHole';

import { Vector2 } from '@babylonjs/core/Maths/math';
import find from 'lodash/find';
import { IAPlayer } from '../Player/iaPlayer';
import { StarCategory, StarCategories } from '../Entity/star';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class LocalMap extends TileMap {

    chekIaInterval;

    constructor(system: System, gravityGrid: GravityGrid) {
        super(system, gravityGrid);
        
        let frame = 0;
        this.system.scene.registerBeforeRender(() => {
            if (frame > 10 && this.check) {
                this.checkPlayersAbsorbtion();
                this.checkRessourceMap();
                frame = 0;
            }
            frame++;
        });
        
        this.chekIaInterval = setInterval(()=> {
            if (this.check) this.checkIaMap();
            // this.checkIaMap();
        }, 10000);
    }

    checkPlayersAbsorbtion() {
        for (const key in this.players) {
            const player = this.players[key];
            this.checkPlayerAbsorbtion(player);
            this.checkPlanetMap(player);
            if (player.size < minSize) this.playerDead(player);
        }
    }

    playerDead(player: Player) {
        this.killPlayer(player);
        if (player.ia) this.removeIa(player);

        // Check if not absorbed by hole
        let isBlackHole = find(this.blackHoles, (b: BlackHole) => { return b.key == player.absorbed })
        if (!isBlackHole) {
            // if (Math.random() > 0.5 && Object.keys(this.blackHoles).length < 10) this.createHole(player);
            // this.createHole(player.position.clone());
        }
    }

    checkPlayerAbsorbtion(player: Player) {
        let blackHoleTest = this.checkBlackHoleAbsorption(player);
        if (!blackHoleTest) this.checkPlayerAbsorption(player);
    }

    checkBlackHoleAbsorption(player: Player): boolean {
        let blackHoleTest = '';
        let minDist = 1000000;
        for (const key in this.blackHoles) {
            const blackHole: BlackHole = this.blackHoles[key];
            let dist = Vector2.Distance(blackHole.position, player.position);
            if (dist < blackHole.gravityField * 30) {
                if (minDist > dist) {
                    minDist = dist;
                    blackHoleTest = blackHole.key;
                }
            }
        }

        if (blackHoleTest) {
            let blackHole = this.blackHoles[blackHoleTest]
            player.getAbsorbByTarget(blackHole);
            let velocity = Math.pow((minDist / (blackHole.gravityField * 20)), 2);
            player.setRealVelocity(velocity);
            return true;
        }
        return false;
    }

    checkPlayerAbsorption(player: Player) {
        let closestTarget: Player;
        let minDist = 1000000;
        let testTarget = '';
        for (const key in this.players) {
            const otherplayer: Player = this.players[key];
            let dist = Vector2.Distance(player.position, otherplayer.position) * 0.8;
            if (minDist > dist && otherplayer.key != player.key && player.gravityField > otherplayer.gravityField) {
                minDist = dist;
                closestTarget = otherplayer;
                if (dist < (player.gravityField * 10)) {
                    testTarget = otherplayer.key;
                }
            }

        }

        if (testTarget) {
            let otherPlayer: Player = this.players[testTarget]
            player.absorbTarget(otherPlayer);
            otherPlayer.getAbsorbByTarget(player);
            let velocity = Math.pow((minDist / (player.gravityField * 20)), 1);
            otherPlayer.setRealVelocity(velocity);
            return true;
        } else {
            player.absorbStop();
            if (player.ia && closestTarget && minDist > player.gravityField * 10) player.goToPlayer(closestTarget);
            return false;
        }

    }

    planetDensity = 200;
    checkRessourceMap() {
        let newPlanetNeeded = this.planetDensity - Object.keys(this.planets).length;
        for (let i = 0; i < newPlanetNeeded; i++) {
            this.addNewPlanet();
        }
    }

    checkPlanetMap(player: Player) {
        if (Object.keys(player.planets).length < player.maxPlanet) {
            for (const key in this.planets) {
                const planet: Planet = this.planets[key];
                let dist = Vector2.Distance(planet.position, player.position);
                if (dist < player.gravityField * 10) {
                    player.addPlanet(planet);
                    planet.attachedToStar = true;
                    this.storagePlanet(planet);
                }
            }
        }
    }

    addNewPlanet() {
        let planetNumber = Object.keys(this.planets).length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2);
        let pos = this.getNewRandomPosition();
        let planetInterface: PlanetInterface = { position: pos, radius: radius, size: 1, velocity: velocity };
        let newPlanet = this.addPlanet(planetInterface);
        return newPlanet;
    }

    iaNeeded = 5;
    ias: Object = {};
    checkIaMap() {
        let newIaNeeded = Math.round(this.iaNeeded - Object.keys(this.ias).length);
        for (let i = 0; i < newIaNeeded; i++) {
            setTimeout(() => {
                console.log('createIA');
                this.createIa();
            }, i * 1000);
        }
    }

    getRandomCategory(): StarCategory {
        let l = StarCategories.length;
        let alea = Math.round(Math.random() * l - 0.5);
        return StarCategories[alea];
    }

    createIa() {
        let newIa = new IAPlayer(this.system, this.gravityGrid);
        this.addPlayer(newIa);
        let pos = this.getFreePosition();
        newIa.setPosition(pos);
        let cat = this.getRandomCategory();
        newIa.setCategory(cat);
        this.addIa(newIa);
    }
    
    addIa(ia: IAPlayer) {
        this.ias[ia.key] = ia;
    }

    removeIa(ia: IAPlayer) {
        delete this.ias[ia.key];
    }

    disposeIa(ia: IAPlayer) {
        this.removeIa(ia);
        ia.dispose();
        clearInterval(ia.moveInt);
    }

    getFreePosition(): Vector2 {
        let test = true;
        let distProgress = 5;
        while (test) {
            let pos = this.getNewRandomPositionFromCenter(Vector2.Zero(), distProgress);
            let distTest = true;
            for (const key in this.players) {
                let player: Player = this.players[key];
                let dist = Vector2.Distance(pos, player.position);
                if (dist < 50) { distTest = false; }
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
            this.disposeIa(this.ias[key]);
        }
    }
}