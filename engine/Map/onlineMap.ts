import { Player, PlayerInterface } from "../player/player";
import { TileMap } from "./map";

import * as Colyseus from "colyseus.js";
import { Vector2 } from "@babylonjs/core/Maths/math";
import { Planet, PlanetInterface } from "../Entity/planet";

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}

export class onlineMap {

    client: Colyseus.Client;
    room: Colyseus.Room;
    tileMap: TileMap

    constructor(tileMap: TileMap) {
        this.tileMap = tileMap;
    }

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
        this.tileMap.eraseAllPlanets();
        // this.room.leave();
    }

    checkPlayers(playersData: Object) {
        for (const key in playersData) {
            const playerData: PlayerInterface = playersData[key];
            if (!this.tileMap.players[key]) this.tileMap.createPlayer(playerData);
            else this.checkPlayer(this.tileMap.players[key], playerData);
        }
        for (const key in this.tileMap.players) {
            const player:Player = this.tileMap.players[key];
            if (!playersData[key]) this.tileMap.removePlayer(player);
        }        
    }

    checkPlayer(player: Player, playerData: PlayerInterface) {
        if (playerData.destination) {
            let dest = new Vector2(playerData.destination.x, playerData.destination.y);
            player.moveCatcher.catch(dest);
        }
        console.log(playerData.planets);
        if (playerData.planets) {
            for (let i = 0; i < playerData.planets.length; i++) {
                const planetkey: string = playerData.planets[i];
                console.log(this.tileMap.planets[planetkey]);
                if (this.tileMap.planets[planetkey]) {
                    console.log('ADD', planetkey);
                    let planet = this.tileMap.planets[planetkey]
                    player.addPlanet(planet);
                    planet.attachedToStar = true;
                    this.tileMap.storagePlanet(planet);
                }
            }
        }

    }

    checkPlanets(planets: Object) {
        for (const key in planets) {
            const planet: PlanetInterface = planets[key];
            if (!this.tileMap.planets[key]) this.tileMap.addPlanet(planet);
        }
        // for (const key in this.planets) {
        //     const planet: Planet = this.planets[key];
        //     if (!planets[key]) this.removePlanet(planet);
        // }
    }
}
