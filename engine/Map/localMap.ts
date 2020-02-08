import { Planet, PlanetInterface } from '../Entity/planet';
import { Player, minSize } from '../player/player';
import { TileMap } from './map';
import { System } from '../System/system';
import { GravityGrid } from '../System/GravityGrid';
import { BlackHole } from '../Entity/blackHole';

import { Vector2 } from '@babylonjs/core/Maths/math';
import find from 'lodash/find';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class LocalMap extends TileMap {

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
    }

    checkPlayersAbsorbtion() {
        for (const key in this.players) {
            const player = this.players[key];
            this.checkPlayerAbsorbtion(player);
            this.checkPlanetMap(player);
            if (player.size < minSize) this.playerDead(player);
        }
    }

    checkPlayerAbsorbtion(player: Player) {
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
        } else {
            let minDist = 1000000;
            let testTarget = '';
            for (const key in this.players) {
                const otherplayer: Player = this.players[key];
                let dist = Vector2.Distance(player.position, otherplayer.position) * 0.8;
                if (minDist > dist && otherplayer.key != player.key && player.gravityField > otherplayer.gravityField) {
                    minDist = dist;
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
            } else {
                player.absorbStop();
            }
        }
    }

    planetNeeded = 100;
    checkRessourceMap() {
        let newPlanetNeeded = this.planetNeeded - Object.keys(this.planets).length;
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
                    this.removePlanet(planet);
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
        let newPlanet = this.createPlanet(planetInterface);
        return newPlanet;
    }

    playerDead(player: Player) {
        this.removePlayer(player);
        player.die(() => {
            this.addDustField(player.position);
        });

        // Check if not absorbed by hole
        let isBlackHole = find(this.blackHoles, (b: BlackHole) => { return b.key == player.absorbed })
        if (!isBlackHole) {
            if (Math.random() > 0.5 && Object.keys(this.blackHoles).length < 10) this.createHole(player);
            // this.createHole(player.position.clone());
        }
    }

    createHole(player: Player) {
        let blackHole = new BlackHole(this.system, this.gravityGrid, { position: player.position });
        this.addBlackHole(blackHole);
    }
}