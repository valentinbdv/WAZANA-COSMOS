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
import filter from 'lodash/filter';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class TileMap {

    system: System;
    gravityGrid: GravityGrid;
    curve: IEasingFunction;

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

        this.createAllDusts();
        this.createAllPlanets();
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

    planetNumbers = 50;
    planetsStorage: Array<Planet> = [];
    createAllPlanets() {
        console.log(this.planetNumbers);
        for (let i = 0; i < this.planetNumbers; i++) {
            let planetInterface: PlanetInterface = { size: 1 };
            let planet = new Planet(this.system, planetInterface);
            this.planetsStorage.push(planet);
        }
    }

    planets: Object = {};
    addPlanet(planetInterface: PlanetInterface) {
        let planetsAvailable = filter(this.planetsStorage, (p) => { return !p.attachedToStar });
        if (planetsAvailable.length != 0) {
            let planet = this.planetsStorage.pop();
            planet.setOptions(planetInterface);
            planet.show();
            this.planets[planet.key] = planet;
            return planet;
        }
        return false;
    }

    removePlanet(planet: Planet) {
        delete this.planets[planet.key];
    }

    storagePlanet(planet: Planet) {
        this.removePlanet(planet);
        this.planetsStorage.push(planet);
    }

    eraseAllPlanets() {
        for (const key in this.planets) {
            this.storagePlanet(this.planets[key]);
        }
    }

    ////////// Dust

    dustNumbers = 200;
    dustsStorage: Array<StarDust> = [];
    createAllDusts() {        
        for (let i = 0; i < this.dustNumbers; i++) {
            let dustInterface: StarDustInterface = { temperature: 6000, size: 1 };
            let dust = new StarDust(this.system, dustInterface);
            this.dustsStorage.push(dust);
        }
    }

    dusts: Array<StarDust> = [];
    addDust(size?: number) {
        let dustSize = (size) ? size : 0.01;
        if (this.dustsStorage.length != 0) {
            let dust = this.dustsStorage.pop();
            dust.setSize(dustSize);
            dust.show();
            this.dusts.push(dust);
            return dust;
        }
        return false;
    }

    addDustField(position: Vector2) {
        let dustNumber = 50;
        for (let i = 0; i < dustNumber; i++) {
            let newDust = this.addDust(0.03);
            if (newDust) {
                let pos = this.getNewRandomPositionFromCenter(position, 40);
                newDust.setPosition(pos);
            }
        }
    }

    removeDust(dust: StarDust) {
        let removeDust = remove(this.dusts, (p) => { return dust.key == p.key });
    }
    
    storageDust(dust: StarDust) {
        dust.hide();
        this.dustsStorage.push(dust);
    }

    eraseAllDusts() {
        for (let i = 0; i < this.dusts.length; i++) {
            this.removeDust(this.dusts[i]);
            this.storageDust(this.dusts[i]);
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
            if (dist > Math.sqrt(s) * this.sizeDustRatio * 15) {
                this.removeDust(dust);
                this.storageDust(dust);
            }
        }

        let newDustNeeded = Math.round(s * this.dustDensity - this.dusts.length);
        for (let i = 0; i < newDustNeeded; i++) {
            let newDust = this.addDust();
            if (newDust) {
                let pos = this.getNewDustRandomPosition();
                newDust.setPosition(pos);
            }
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
                this.moveDustToPlayer(player, dust);
            }
        }
    }

    moveDustToPlayer(player: Player, dust: StarDust) {
        this.removeDust(dust);
        dust.goToEntity(player, () => {
            player.changeSize(dust.size / (player.size * 20));
            player.shine();
            this.storageDust(dust);
        });
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