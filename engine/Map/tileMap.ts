import { MeshSystem } from '../System/meshSystem';
import { GravityGrid } from '../System/GravityGrid';
import { StarDust } from '../Objects/starDust';
import { Player } from '../player/player';
import { BlackHole } from '../Objects/blackHole';
import { StarInterface } from '../Objects/star';
import { PlanetMap } from './planetMap';

import { EasingFunction } from '@babylonjs/core/Animations/easing';
import { Vector2 } from '@babylonjs/core/Maths/math';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class TileMap extends PlanetMap {

    gravityGrid: GravityGrid;
    curve: EasingFunction;

    constructor(system: MeshSystem, gravityGrid: GravityGrid) {
        super(system);
        this.gravityGrid = gravityGrid;
        
        let frame = 0;
        this.system.scene.registerBeforeRender(() => {
            this.checkPlanetsCycle();
            this.checkPlayersCycle();
            if (frame > 10 && this.check) {
                this.checkPlayersDust();
                this.checkDustMap();
                this.checkUpperDustMap();
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
        let player = new Player(this.system, this.gravityGrid, this, starInterface);
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
            if (player != this.playerToFollow) player.dispose();
        }
        this.players = {};
    }

    ////////// BLACKHOLE

    createBlackHole(position: Vector2) {
        let blackHole = new BlackHole(this.system, this.gravityGrid, position);
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
        blackHole.transformMesh.dispose();
    }

    eraseAllBlackHoles() {
        for (const key in this.blackHoles) {
            this.blackHoles[key].dispose();
        }
        this.blackHoles = {};
    }

    checkPlayerDust(player: Player) {
        for (let i = 0; i < this.dusts.length; i++) {
            const dust = this.dusts[i];
            let dist = Vector2.Distance(dust.position, player.position);
            if (dist < player.gravityField) {
                this.moveDustToPlayer(player, dust);
            }
        }
    }

    moveDustToPlayer(player: Player, dust: StarDust) {
        this.removeDust(dust);
        dust.goToEntity(player, () => {
            player.addDust();
            this.storageDust(dust);
        });
    }

    checkPlayersDust() {
        for (const key in this.players) {
            const player: Player = this.players[key];
            if (!player.accelerating && player.isStarVisible) this.checkPlayerDust(player);
        }
    }

    checkPlayersCycle() {
        for (const key in this.players) {
            const player: Player = this.players[key];
            if (player.isStarVisible) player.starCycle();
        }
    }

    killPlayer(player: Player) {
        this.removePlayer(player);
        player.die(() => {
            if (player.dustField) this.addDustField(player.position);
        });
    }

    eraseAllEntity() {
        // Erase Players before Planets so that planet are all in storage
        this.eraseAllPlayers();
        this.eraseAllBlackHoles();
        this.eraseAllDusts();
        this.eraseAllPlanets();
        this.system.checkActiveMeshes();
        this.addPlayer(this.playerToFollow);
    }
}