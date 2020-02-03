
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
import { Room } from "./Server/online";

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



export class GameEngine {

    system: SystemUI;
    animation: Animation;

    gravityGrid: GravityGrid;
    planetField: PlanetField;
    realPlayer: RealPlayer;
    introUI: IntroUI;
    playUI: PlayUI;
    room: Room;

    constructor(gameOptions: GameInterface) {
        this.system = new SystemUI(gameOptions.canvas);
        this.system.optimize();

        this.gravityGrid = new GravityGrid(this.system);
        // this.planetField = new PlanetField(this.system, this.gravityGrid);
        this.room = new Room(this.system, this.gravityGrid);

        this.realPlayer = new RealPlayer(this.system, this.gravityGrid, this.room);
        this.realPlayer.setMoving(false);
        this.realPlayer.setCategory(StarCategories[0]);
        this.realPlayer.onDied = () => {
            this.introUI.show();
        };
        // this.planetField.addPlayer(this.realPlayer);
        // this.planetField.setPlayerToFollow(this.realPlayer);
        
        this.system.setSky(1);
        this.system.launchRender();

        this.introUI = new IntroUI(this.system, this.realPlayer);
        this.introUI.onStart = () => {
            this.joinGame();
            // this.startGame();
        };

        this.playUI = new PlayUI(this.system, this.realPlayer);
    }

    stopGame() {
        this.introUI.show();
        this.playUI.hide();
        this.realPlayer.setMoving(false);
        // this.planetField.checkPlayerAndRessources(false);
    }

    startGame() {
        this.introUI.hide();
        this.playUI.show();

        this.realPlayer.setMoving(true);
        this.realPlayer.removeAllPlanets();
        // this.planetField.checkPlayerAndRessources(true);
        // let ia1 = new IAPlayer(this.system, this.gravityGrid);
        // this.planetField.addPlayer(ia1);
        // ia1.setSize(1);
        // ia1.setPosition(new Vector2(50, 50));
        // ia1.setTemperature(25000);
    }

    joinGame() {
        this.room.join((newRoom) => {
            this.startGame();
            this.room.addPlayer(this.realPlayer);
        });
        // client.joinOrCreate("my_room").then(newRoom => {
        //     this.startGame();
        //     room = newRoom;

        //     this.players[room.sessionId] = this.realPlayer;
        //     console.log(room.sessionId, "joined", room.name);

        //     room.onStateChange((state: State) => {
        //         console.log(room.name, "has new state:", state);
        //         this.checkPlayers(state.players)
        //     });

        //     room.onMessage((message) => {
        //         console.log(client, "received on", room.name, message);
        //     });

        //     room.onError(() => {
        //         console.log(client, "couldn't join", room.name);
        //     });

        //     room.onLeave(() => {
        //         console.log(client, "left", room.name);
        //     });
        // }).catch(e => {
        //     console.log("JOIN ERROR", e);
        // });
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
