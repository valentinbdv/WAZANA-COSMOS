import { System } from './system';

import { IEasingFunction } from '@babylonjs/core/Animations/easing';
import { Vector2 } from '@babylonjs/core/Maths/math';
import remove from 'lodash/remove';
import { Planet, PlanetInterface } from '../Entity/planet';
import { StarDust, StarDustInterface } from '../Entity/starDust';
import { Player } from '../player/player';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class PlanetField {

    system: System;
    curve: IEasingFunction;

    constructor(system: System) {
        this.system = system;

        this.checkRessourceMap(new Vector2(0, 0));
        
        let frame = 0;
        this.system.scene.registerBeforeRender(() => {
            for (let i = 0; i < this.planets.length; i++) {
                const planet = this.planets[i];
                planet.mesh.rotation.y += 0.01;
            }
            if (frame == 20) {
                this.checkPlayers();
                this.checkRessourceMap(this.playerToFollow.position);
                frame = 0;
            }
            frame++;
        });
    }

    planets: Array<Planet> = [];
    addPlanet() {
        let planetNumber = this.planets.length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2);
        let planetInterface: PlanetInterface = { color: [0, 0, 0], radius: radius, size: 1, velocity: velocity };
        let planet = new Planet(this.system, planetInterface);
        this.planets.push(planet);
        return planet;
    }

    removePlanet(planet: Planet) {
        remove(this.planets, (p) => { return planet.key == p.key })
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
        dust.mesh.dispose();
    }

    dustNeeded = 100;
    planetNeeded = 10;
    checkRessourceMap(center: Vector2) {
        for (let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];
            let dist = Math.sqrt(Vector2.Distance(planet.position, center));
            if (dist > 10) this.removePlanet(planet);
        }

        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Math.sqrt(Vector2.Distance(dust.position, center));
            if (dist > 10) this.removeDust(dust);
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
            for (let i = 0; i < this.planets.length; i++) {
                const planet = this.planets[i];
                let dist = Math.sqrt(Vector2.Distance(planet.position, player.position));
                if (dist < player.size * 5) {
                    this.removePlanet(planet);
                    player.addPlanet(planet);
                }
            }

            for (let i = 0; i < this.dusts.length; i++) {
                const dust = this.dusts[i];
                let dist = Math.sqrt(Vector2.Distance(dust.position, player.position));
                if (dist < player.size * 2.5) {
                    this.removeDust(dust);
                    player.addDust();
                }
            }

            let minDist = 1000000;
            let target: Player;
            for (let i = 0; i < this.players.length; i++) {
                const otherplayer = this.players[i];
                let dist = Math.sqrt(Vector2.Distance(player.position, otherplayer.position));
                if (otherplayer.key != player.key && player.size > otherplayer.size && dist < (player.size + otherplayer.size) * 3) {
                    if (minDist > player.size + otherplayer.size) {
                        minDist = player.size + otherplayer.size;
                        target = otherplayer;
                    }
                }
                
            }
            if (target) player.absorbTarget(target);
            else player.absorbStop();

            if (player.size < 0.1) {
                player.explode();
                this.removePlayer(player);
            }
        }
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
        remove(this.players, (p) => {return player.key == p.key})
    }
}