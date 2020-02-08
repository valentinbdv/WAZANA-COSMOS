import { System } from '../System/system';
import { GravityGrid } from '../System/GravityGrid';
import { Planet, PlanetInterface } from '../Entity/planet';
import { StarDust, StarDustInterface } from '../Entity/starDust';
import { Player, PlayerInterface } from '../player/player';
import { BlackHole } from '../Entity/blackHole';

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
                this.checkPlayersRessources();
                this.checkRessourceMap(this.playerToFollow.position);
                frame = 0;
            }
            frame++;
        });
    }

    createPlayer(playerInterface: PlayerInterface) {
        let player = new Player(this.system, this.gravityGrid);
        // player.setCategory(playerInterface);
        player.key = playerInterface.key;
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

    createPlanet(planetInterface: PlanetInterface) {
        let planet = new Planet(this.system, planetInterface);
        console.log('CREATE PLANET', planetInterface.key, planet.key);
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
    checkRessourceMap(center: Vector2) {
        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Math.sqrt(Vector2.Distance(dust.position, center));
            if (dist > 10) this.disposeDust(dust);
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

    checkPlayerRessources(player: Player) {
        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Vector2.Distance(dust.position, player.position);
            if (dist < player.gravityField * 6) {
                this.removeDust(dust);
                player.addDust(dust);
            }
        }
    }

    checkPlayersRessources() {
        for (const key in this.players) {
            const player = this.players[key];
            if (!player.accelerating) this.checkPlayerRessources(player);
        }
    }
}