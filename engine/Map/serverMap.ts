import { Player, PlayerInterface } from "../player/player";
import { TileMap } from "./map";
import { System } from '../System/system';
import { GravityGrid } from '../System/GravityGrid';

import * as Colyseus from "colyseus.js";
import { Vector2 } from "@babylonjs/core/Maths/math";
import { Planet, PlanetInterface } from "../Entity/planet";

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}

export class ServerMap extends TileMap {

    client: Colyseus.Client;
    room: Colyseus.Room;

    started = false;
    sessionId: string;
    join(callback: Function) {
        if (!this.client) this.client = new Colyseus.Client('ws://localhost:2567');
        
        this.client.joinOrCreate("my_room").then(room => {
            this.room = room;
            this.sessionId = room.sessionId;
            this.started = true;
            console.log(room.sessionId, "joined", room.name);

            room.onStateChange((state: State) => {
                // console.log(room.name, "has new state:", state);
                this.checkPlayers(state.players);
                this.checkPlanets(state.planets);
            });

            room.onMessage((message) => {
                console.log(this.client, "received on", room.name, message);
            });

            room.onError(() => {
                console.log(this.client, "couldn't join", room.name);
            });

            room.onLeave(() => {
                this.onLeave();
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

    onLeave: Function;
    leave() {
        this.started = false;
        this.eraseAllPlanets();
        // this.room.leave();
    }

    checkPlayers(playersData: Object) {
        for (const key in playersData) {
            const playerData: PlayerInterface = playersData[key];
            if (!this.players[key]) this.createPlayer(playerData);
            else this.checkPlayer(this.players[key], playerData);
        }
        for (const key in this.players) {
            const player:Player = this.players[key];
            if (!playersData[key]) this.removePlayer(player);
        }        
    }

    checkPlayer(player: Player, playerData: PlayerInterface) {
        if (playerData.destination) {
            let dest = new Vector2(playerData.destination.x, playerData.destination.y);
            player.moveCatcher.catch(dest);
        }
        if (playerData.planets) {
            for (let i = 0; i < playerData.planets.length; i++) {
                const planet: PlanetInterface = playerData.planets[i];
                
            }
        }

    }

    checkPlanets(planets: Object) {
        for (const key in planets) {
            const planet: PlanetInterface = planets[key];
            if (!this.planets[key]) this.createPlanet(planet);
        }
        for (const key in this.planets) {
            const planet: Planet = this.planets[key];
            if (!planets[key]) this.removePlanet(planet);
        }
    }
}
