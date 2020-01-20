
import * as Colyseus from "colyseus.js";

import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityGrid } from './System/GravityGrid';
import { PlanetField } from './System/planetField';
import { IAPlayer } from './Player/iaPlayer';
import { StarCategories } from './Player/player';
import { RealPlayer } from './Player/realPlayer';
import { BlackHole } from './Entity/blackHole';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { IntroUI } from './Ui/intro';
import { PlayUI } from './Ui/play';

import { Player } from "./player/player";

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}
// Fade in et clignote dust / planet
// Gravité impacte autre étoile et de plus en plus de particle
export interface GameInterface {
    canvas?: HTMLCanvasElement,
}


var client = new Colyseus.Client('ws://localhost:2567');

export class GameEngine {

    system: SystemUI;
    animation: Animation;

    gravityGrid: GravityGrid;
    planetField: PlanetField;
    realPlayer: RealPlayer;
    introUI: IntroUI;
    playUI: PlayUI;

    constructor(gameOptions: GameInterface) {
        this.system = new SystemUI(gameOptions.canvas);
        this.system.optimize();

        this.gravityGrid = new GravityGrid(this.system);
        this.planetField = new PlanetField(this.system, this.gravityGrid);

        this.realPlayer = new RealPlayer(this.system, this.gravityGrid);
        this.realPlayer.setMoving(false);
        this.realPlayer.setCategory(StarCategories[0]);
        this.realPlayer.onDied = () => {
            this.introUI.show();
        };
        this.planetField.addPlayer(this.realPlayer);
        this.planetField.setPlayerToFollow(this.realPlayer);
        
        this.system.setSky(1);
        this.system.launchRender();

        this.introUI = new IntroUI(this.system, this.realPlayer);
        this.introUI.onStart = () => {
            this.joinGame();
        };

        this.playUI = new PlayUI(this.system, this.realPlayer);
    }

    stopGame() {
        this.introUI.show();
        this.playUI.hide();
        this.realPlayer.setMoving(false);
        this.planetField.checkPlayerAndRessources(false);
    }

    startGame() {
        this.introUI.hide();
        this.playUI.show();

        // this.realPlayer.setMoving(true);
        this.realPlayer.removeAllPlanets();
        this.planetField.checkPlayerAndRessources(true);
        // let ia1 = new IAPlayer(this.system, this.gravityGrid);
        // this.planetField.addPlayer(ia1);
        // ia1.setSize(1);
        // ia1.setPosition(new Vector2(50, 50));
        // ia1.setTemperature(25000);
    }

    joinGame() {

        client.joinOrCreate("my_room").then(room => {
            this.startGame();

            this.players[room.sessionId] = this.realPlayer;
            console.log(room.sessionId, "joined", room.name);

            room.onStateChange((state: State) => {
                console.log(room.name, "has new state:", state);
                this.checkPlayers(state.players)
            });

            room.onMessage((message) => {
                console.log(client, "received on", room.name, message);
            });

            room.onError(() => {
                console.log(client, "couldn't join", room.name);
            });

            room.onLeave(() => {
                console.log(client, "left", room.name);
            });
        }).catch(e => {
            console.log("JOIN ERROR", e);
        });

    }

    players: Map<string, Player> = {};
    checkPlayers(players: Array<Player>) {
        console.log(players);
        
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (!this.players[player.key]) this.addPlayer(player.key);
            this.players[player.key].position.x = player.position.x;
            this.players[player.key].position.y = player.position.y;
        }
    }

    addPlayer(key: string) {
        this.players[key] = new Player(this.system, this.gravityGrid);
    }

    addBlackHole(pos) {
        let black = new BlackHole(this.system, this.gravityGrid, { position: { x: pos.x, z: 0, y: pos.y }, size: 1 });
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
