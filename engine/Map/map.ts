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
                this.checkDustMap();
                frame = 0;
            }
            frame++;
        });
    }

    check = false;
    checkPlayerAndRessources(check: boolean) {
        this.check = check;
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


    disposePlayer(player: Player) {
        this.removePlayer(player);
        player.dispose();
    }

    eraseAllPlayers() {
        for (const key in this.players) {
            let player = this.players[key];
            if (player != this.playerToFollow) this.disposePlayer(player);
        }
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
    addDust(size?: number) {
        let dustSize = (size) ? size : 0.01;
        let dustInterface: StarDustInterface = { temperature: 6000, size: dustSize };
        let dust = new StarDust(this.system, dustInterface);
        this.dusts.push(dust);
        return dust;
    }

    addDustField(position: Vector2) {
        let dustNumber = Math.round( 100 );
        for (let i = 0; i < dustNumber; i++) {
            let newDust = this.addDust(0.03);
            let pos = this.getNewRandomPositionFromCenter(position, 40);
            newDust.setPosition(pos);
        }
    }

    removeDust(dust: StarDust) {
        remove(this.dusts, (p) => { return dust.key == p.key });
    }

    disposeDust(dust: StarDust) {
        this.removeDust(dust);
        dust.mesh.dispose();
    }

    eraseAllDusts() {
        for (let i = 0; i < this.dusts.length; i++) {
            this.disposeDust(this.dusts[i]);
        }
    }

    /////////// CHECK FUNCTIONS 
    dustDensity = 100;
    sizeDustRatio = 5;
    checkDustMap() {
        let c = this.playerToFollow.position;
        let s = this.playerToFollow.size;
        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Vector2.Distance(dust.position, c);
            if (dist > Math.sqrt(s) * this.sizeDustRatio * 15) this.disposeDust(dust);
        }

        let newDustNeeded = Math.round(s * this.dustDensity - this.dusts.length);
        for (let i = 0; i < newDustNeeded; i++) {
            let newPlanet = this.addDust();
            let pos = this.getNewDustRandomPosition();
            newPlanet.setPosition(pos);
        }
    }

    getNewDustRandomPosition(): Vector2 {
        let c = this.playerToFollow.position;
        let s = this.playerToFollow.size;
        let sign1 = (Math.random() > 0.5) ? 1 : -1;
        let sign2 = (Math.random() > 0.5) ? 1 : -1;
        let x = c.x + sign1 * Math.sqrt(s) * (this.sizeDustRatio / 2 + Math.random() * this.sizeDustRatio * 10);
        let y = c.y + sign2 * Math.sqrt(s) * (this.sizeDustRatio / 2 + Math.random() * this.sizeDustRatio * 10);
        return new Vector2(x, y);
    }
    
    // getCloseDust(): Array< StarDust > {
    //     let dusts = [];
    //     let c = this.playerToFollow.position;
    //     let s = this.playerToFollow.size * 5;
    //     for (let i = 0; i < this.dusts.length; i++) {
    //         const dust = this.dusts[i];
    //         let xTest = dust.position.x < c.x + s && dust.position.x > c.x - s;
    //         let yTest = dust.position.y < c.y + s && dust.position.y > c.y - s;
    //         if (xTest && yTest) dusts.push(dust);
    //     }
    //     return dusts;
    // }

    mapSize = 1000;
    getNewRandomPosition(): Vector2 {
        let sign1 = (Math.random() > 0.5) ? 1 : -1;
        let sign2 = (Math.random() > 0.5) ? 1 : -1;
        let pos = new Vector2(0, 0);
        pos.x = sign1 * this.mapSize * Math.random();
        pos.y = sign2 * this.mapSize * Math.random();
        return pos;
    }

    getNewRandomPositionFromCenter(position: Vector2, size: number): Vector2 {
        let angle = Math.random() * Math.PI * 2;
        let centerRatio = Math.pow(Math.random(), 1.5);
        let x = Math.cos(angle) * size * centerRatio;
        let y = Math.sin(angle) * size * centerRatio;
        return new Vector2(position.x + x, position.y + y);
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

    killPlayer(player: Player) {
        this.removePlayer(player);
        player.die(() => {
            this.addDustField(player.position);
        });
    }

    eraseAllEntity() {
        this.eraseAllPlanets();
        this.eraseAllBlackHoles();
        this.eraseAllPlayers();
        this.eraseAllDusts();
    }
}