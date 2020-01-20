import { System } from './system';

import { IEasingFunction } from '@babylonjs/core/Animations/easing';
import { Vector2 } from '@babylonjs/core/Maths/math';
import remove from 'lodash/remove';
import { Planet, PlanetInterface } from '../Entity/planet';
import { StarDust, StarDustInterface } from '../Entity/starDust';
import { Player, minSize } from '../player/player';
import { BlackHole } from '../Entity/blackHole';
import { GravityField } from './gravityField';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class PlanetField {

    system: System;
    curve: IEasingFunction;
    gravityField: GravityField;

    constructor(system: System, gravityField: GravityField) {
        this.system = system;
        this.gravityField = gravityField;

        this.checkRessourceMap(new Vector2(0, 0));
        
        let frame = 0;
        this.system.scene.registerBeforeRender(() => {
            for (let i = 0; i < this.planets.length; i++) {
                const planet = this.planets[i];
                planet.mesh.rotation.y += 0.01;
            }
            if (frame > 10 && this.check) {
                this.checkPlayers();
                this.checkRessourceMap(this.playerToFollow.position);
                frame = 0;
            }
            frame++;
        });
    }

    playerToFollow: Player;
    setPlayerToFollow(player: Player) {
        this.playerToFollow = player;
    }

    players: Array<Player> = [];
    addPlayer(player: Player) {
        this.players.push(player);
    }

    removePlayer(player: Player) {
        remove(this.players, (p) => { return player.key == p.key })
    }

    planets: Array<Planet> = [];
    addPlanet() {
        let planetNumber = this.planets.length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2);
        let planetInterface: PlanetInterface = { radius: radius, size: 1, velocity: velocity };
        let planet = new Planet(this.system, planetInterface);
        this.planets.push(planet);
        return planet;
    }

    removePlanet(planet: Planet) {
        remove(this.planets, (p) => { return planet.key == p.key });
    }

    disposePlanet(planet: Planet) {
        this.removePlanet(planet);
        planet.mesh.dispose();
    }

    dusts: Array<StarDust> = [];
    addDust() {
        let dustInterface: StarDustInterface = { temperature: 6000, size: 0.01 };
        let dust = new StarDust(this.system, dustInterface);
        this.dusts.push(dust);
        return dust;
    }

    removeDust(dust: StarDust) {
        remove(this.dusts, (p) => { return dust.key == p.key });
    }

    disposeDust(dust: StarDust) {
        this.removeDust(dust);
        dust.mesh.dispose();
    }

    blackHoles: Array<BlackHole> = [];
    addBlackHole(blackHole: BlackHole) {
        this.blackHoles.push(blackHole);
    }

    removeBlackHole(blackHole: BlackHole) {
        remove(this.blackHoles, (p) => { return blackHole.key == p.key });
    }

    check = false;
    checkPlayerAndRessources(check: boolean) {
        this.check = check;
    }

    dustNeeded = 200;
    planetNeeded = 10;
    checkRessourceMap(center: Vector2) {
        for (let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];
            let dist = Math.sqrt(Vector2.Distance(planet.position, center));
            if (dist > 10) this.disposePlanet(planet);
        }

        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Math.sqrt(Vector2.Distance(dust.position, center));
            if (dist > 10) this.disposeDust(dust);
        }

        let newPlanetNeeded = this.planetNeeded - this.planets.length;
        for (let i = 0; i < newPlanetNeeded; i++) {
            let newPlanet = this.addPlanet();     
            let pos = this.getNewRandomPosition(center);
            newPlanet.setPosition(pos);
        }

        let newDustNeeded = this.dustNeeded - this.dusts.length;
        for (let i = 0; i < newDustNeeded; i++) {
            let newPlanet = this.addDust();
            let pos = this.getNewRandomPosition(center);
            newPlanet.setPosition(pos);
        }
    }

    getNewRandomPosition(center: Vector2): Vector2 {
        let sign1 = (Math.random() > 0.5)? 1 : -1;
        let sign2 = (Math.random() > 0.5)? 1 : -1;
        let x = center.x + sign1 * (5 + (Math.random()/2) * 100);
        let y = center.y + sign2 * (5 + (Math.random()/2) * 100);
        return new Vector2(x, y);
    }

    checkPlayers() {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (!player.accelerating) this.checkPlayerRessources(player);
            this.checkAbsorbtion(player);
            if (player.size < minSize) this.playerDead(player);
        }
    }

    checkPlayerRessources(player: Player) {
        if (player.planets.length < player.maxPlanet) {
            for (let i = 0; i < this.planets.length; i++) {
                const planet = this.planets[i];
                let dist = Vector2.Distance(planet.position, player.position);
                if (dist < player.size * 10) {
                    this.removePlanet(planet);
                    player.addPlanet(planet);
                }
            }
        }

        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Vector2.Distance(dust.position, player.position);
            if (dist < player.size * 6) {
                this.removeDust(dust);
                player.addDust(dust);
            }
        }
    }

    checkAbsorbtion(player: Player) {
        let blackHoleTest: BlackHole;
        let minDist = 1000000;
        for (let i = 0; i < this.blackHoles.length; i++) {
            const blackHole = this.blackHoles[i];
            let dist = Vector2.Distance(blackHole.position, player.position);
            if (dist < blackHole.size * 30) {
                if (minDist > dist) {
                    minDist = dist;
                    blackHoleTest = blackHole;
                }
            }
        }

        if (blackHoleTest) {
            player.getAbsorbByTarget(blackHoleTest);
            let velocity = Math.pow((minDist / (blackHoleTest.size * 20)), 2);
            player.setRealVelocity(velocity);
        } else {
            let minDist = 1000000;
            let testTarget: Player;
            let closestTarget: Player;
            for (let i = 0; i < this.players.length; i++) {
                const otherplayer = this.players[i];
                let dist = Vector2.Distance(player.position, otherplayer.position) * 0.8;
                if (minDist > dist && otherplayer.key != player.key && player.size > otherplayer.size) {
                    minDist = dist;
                    closestTarget = otherplayer;
                    if (dist < (player.size * 10)) {
                        testTarget = otherplayer;
                    }
                }

            }

            if (player.ia && closestTarget && minDist > player.size * 10) player.goToPlayer(closestTarget);

            if (testTarget) {
                let velocity = Math.pow((minDist / (player.size * 20)), 1);
                testTarget.setRealVelocity(velocity);
                player.absorbTarget(testTarget);
            } else {
                player.absorbStop();
            }
        }
    }

    playerDead(player: Player) {
        this.removePlayer(player);
        let playerSize = player.size;
        if (player.aborber) {
            player.dive();
        } else {
            player.explode(() => {
                if (playerSize > 10 && Math.random() > 0.5 && this.blackHoles.length < 10) this.createBlackHole(player.position.clone());
                // this.createBlackHole(player.position.clone());
            });
        }
    }

    createBlackHole(pos: Vector2) {
        let black = new BlackHole(this.system, this.gravityField, { position: { x: pos.x, z: 0, y: pos.y }, size: 1 });
        this.addBlackHole(black);
    }
}