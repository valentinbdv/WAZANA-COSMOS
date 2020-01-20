import * as Colyseus from "colyseus.js";
import { Player } from "../player/player";

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}

export class Room {

    constructor() {
        var client = new Colyseus.Client('ws://localhost:2567');
        
        client.joinOrCreate("my_room").then(room => {
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

    checkPlayers(players: Array<Player>) {
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            player.position.x = player.position.x;
            player.position.y = player.position.y;
        }
    }
}
