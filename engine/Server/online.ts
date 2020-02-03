import { Player, PlayerInterface } from "../player/player";
import { TileMap } from "./map";
import { System } from '../System/system';
import { GravityGrid } from '../System/GravityGrid';

import * as Colyseus from "colyseus.js";
import { Vector2 } from "@babylonjs/core/Maths/math";

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}

export class Room extends TileMap {

    client: Colyseus.Client;
    room: Colyseus.Room;

    constructor(system: System, gravityGrid: GravityGrid) {
        super(system, gravityGrid);
    }

    started = false;
    join(callback: Function) {
        if (!this.client) this.client = new Colyseus.Client('ws://localhost:2567');
        
        this.client.joinOrCreate("my_room").then(room => {
            this.room = room;
            this.started = true;
            console.log(room.sessionId, "joined", room.name);
            // this.checkPlayers(room.state.players);

            room.onStateChange((state: State) => {
                // console.log(room.name, "has new state:", state);
                this.checkPlayers(state.players);
                this.checkPlayersMovement(state.players)
            });

            room.onMessage((message) => {
                console.log(this.client, "received on", room.name, message);
            });

            room.onError(() => {
                console.log(this.client, "couldn't join", room.name);
            });

            room.onLeave(() => {
                this.leave();
                console.log(this.client, "left", room.name);
            });

            callback(room);
        }).catch(e => {
            console.log("JOIN ERROR", e);
        });
    }

    send(data){
        this.room.send(data);
    }

    leave() {
        this.started = false;
    }

    checkPlayers(players: Object) {
        for (const key in players) {
            const player: PlayerInterface = players[key];
            if (!this.players[key]) this.createPlayer(player);
        }
        for (const key in this.players) {
            const player:Player = this.players[key];
            if (!players[key]) this.removePlayer(player);
        }
    }

    checkPlayersMovement(players: Object) {
        for (const key in players) {
            const playerdata = players[key];
            const player = this.players[key];
            if (player && playerdata.destination) {
                let dest = new Vector2(playerdata.destination.x, playerdata.destination.y);
                console.log(dest);
                player.moveCatcher.catch(dest);
            } 
        }
    }
}
