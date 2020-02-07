import { Planet, PlanetInterface } from '../Entity/planet';
import { Player, minSize } from '../player/player';
import { TileMap } from './map';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class LocalMap extends TileMap {

    // checkAbsorbtion(player: Player) {
    //     let minDist = 1000000;
    //     let testTarget: Player;
    //     let closestTarget: Player;
    //     for (let i = 0; i < this.players.length; i++) {
    //         const otherplayer = this.players[i];
    //         let dist = Vector2.Distance(player.position, otherplayer.position) * 0.8;
    //         if (minDist > dist && otherplayer.key != player.key && player.gravityField > otherplayer.gravityField) {
    //             minDist = dist;
    //             closestTarget = otherplayer;
    //             if (dist < (player.gravityField * 10)) {
    //                 testTarget = otherplayer;
    //             }
    //         }

    //     }

    //     if (player.ia && closestTarget && minDist > player.gravityField * 10) player.goToPlayer(closestTarget);
    // }

    // checkRessourceMap(center: Vector2) {
    //     for (let i = 0; i < this.planets.length; i++) {
    //         const planet = this.planets[i];
    //         let dist = Math.sqrt(Vector2.Distance(planet.position, center));
    //         if (dist > 10) this.disposePlanet(planet);
    //     }
    // }

    addNewPlanet() {
        let planetNumber = Object.keys(this.planets).length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2);
        let planetInterface: PlanetInterface = { radius: radius, size: 1, velocity: velocity };
        this.createPlanet(planetInterface);
    }

    deletePlayer(player: Player) {
        this.removePlayer(player);
        if (player.aborber) {
            player.dive();
        } else {
            player.explode();
        }
    }
}