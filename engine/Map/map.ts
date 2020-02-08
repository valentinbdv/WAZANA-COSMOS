import { System } from '../System/system';
import { GravityGrid } from '../System/GravityGrid';
import { Planet, PlanetInterface } from '../Entity/planet';
import { StarDust, StarDustInterface } from '../Entity/starDust';
import { Player } from '../player/player';
import { BlackHole, BlackHoleInterface } from '../Entity/blackHole';
import { StarInterface } from '../Entity/star';

import { IEasingFunction } from '@babylonjs/core/Animations/easing';
import { Vector2 } from '@babylonjs/core/Maths/math';
import remove from 'lodash/remove';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class TileMap {

    system: System;
    curve: IEasingFunction;
    gravityGrid: GravityGrid;

    constructor(system: System, gravityGrid: GravityGrid) {
        this.system = system;
        this.gravityGrid = gravityGrid;
        
        let frame = 0;
        this.system.scene.registerBeforeRender(() => {
            for (const key in this.planets) {
                const planet = this.planets[key];
                planet.mesh.rotation.y += 0.01;
            }
            if (frame > 10 && this.check) {
                this.checkPlayersDust();
                this.checkDustMap(this.playerToFollow.position);
                frame = 0;
            }
            frame++;
        });
    }

    ////////// PLAYER

    createPlayer(starInterface: StarInterface) {
        let player = new Player(this.system, this.gravityGrid, starInterface);
        // player.setCategory(starInterface);
        player.key = starInterface.key;
        this.addPlayer(player);
        return player;
    }

    playerToFollow: Player;
    setPlayerToFollow(player: Player) {
        this.playerToFollow = player;
    }

    players: Object = {};
    addPlayer(player: Player) {
        this.players[player.key] = player;
    }

    removePlayer(player: Player) {
        delete this.players[player.key];
    }

    ////////// BLACKHOLE

    createBlackHole(blackHoleInterface: BlackHoleInterface) {
        let blackHole = new BlackHole(this.system, this.gravityGrid, blackHoleInterface);
        this.addBlackHole(blackHole)
        return blackHole;
    }

    blackHoles: Object = {};
    addBlackHole(blackHole: BlackHole) {
        this.blackHoles[blackHole.key] = blackHole;
    }

    removeBlackHole(blackHole: BlackHole) {
        delete this.blackHoles[blackHole.key];
    }

    disposeBlackHole(blackHole: BlackHole) {
        this.removeBlackHole(blackHole);
        blackHole.movingMesh.dispose();
    }

    eraseAllBlackHoles() {
        for (const key in this.blackHoles) {
            this.disposeBlackHole(this.blackHoles[key]);
        }
    }

    ////////// PLANET

    createPlanet(planetInterface: PlanetInterface) {
        let planet = new Planet(this.system, planetInterface);
        this.addPlanet(planet)
        return planet;
    }

    planets: Object = {};
    addPlanet(planet: Planet) {
        this.planets[planet.key] = planet;
    }

    removePlanet(planet: Planet) {
        delete this.planets[planet.key];
    }

    disposePlanet(planet: Planet) {
        this.removePlanet(planet);
        planet.mesh.dispose();
    }

    eraseAllPlanets() {
        for (const key in this.planets) {
            this.disposePlanet(this.planets[key]);
        }
    }

    ////////// Dust

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

    check = false;
    checkPlayerAndRessources(check: boolean) {
        this.check = check;
    }

    dustNeeded = 200;
    checkDustMap(center: Vector2) {
        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Math.sqrt(Vector2.Distance(dust.position, center));
            if (dist > 10) this.disposeDust(dust);
        }

        let newDustNeeded = this.dustNeeded - this.dusts.length;
        for (let i = 0; i < newDustNeeded; i++) {
            let newPlanet = this.addDust();
            let pos = this.getNewRandomPosition();
            newPlanet.setPosition(pos);
        }
    }

    mapSize = 100;
    getNewRandomPosition(): Vector2 {
        let sign1 = (Math.random() > 0.5) ? 1 : -1;
        let sign2 = (Math.random() > 0.5) ? 1 : -1;
        let pos = new Vector2(0, 0);
        pos.x = sign1 * this.mapSize * Math.random();
        pos.y = sign2 * this.mapSize * Math.random();
        return pos;
    }

    checkPlayerDust(player: Player) {
        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Vector2.Distance(dust.position, player.position);
            if (dist < player.gravityField * 6) {
                this.removeDust(dust);
                player.addDust(dust);
            }
        }
    }

    checkPlayersDust() {
        for (const key in this.players) {
            const player = this.players[key];
            if (!player.accelerating) this.checkPlayerDust(player);
        }
    }
}