import { System } from './system';

import { IEasingFunction, CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing';
import { Vector2 } from '@babylonjs/core/Maths/math';
import remove from 'lodash/remove';
import { Planet, PlanetInterface } from '../Entity/planet';
import { Player } from '../player/player';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class PlanetField {

    system: System;
    curve: IEasingFunction;

    constructor(system: System) {
        this.system = system;

        this.createRandomMap();
        
        let frame = 0;
        this.system.scene.registerBeforeRender(() => {
            for (let i = 0; i < this.planets.length; i++) {
                const planet = this.planets[i];
                planet.mesh.rotation.y += 0.01;
            }
            if (frame == 10) {
                this.checkPlanets();
                frame = 0;
            }
            frame++;
        });
    }

    planets: Array<Planet> = [];
    addPlanet() {
        let planetNumber = this.planets.length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2);
        let planetInterface: PlanetInterface = { color: [0, 0, 0], radius: radius, size: 1, velocity: velocity };
        let planet = new Planet(this.system, planetInterface);
        this.planets.push(planet);
        return planet;
    }

    removePlanet(planet: Planet) {
        remove(this.planets, (p) => { return planet.key == p.key })
    }

    createRandomMap() {
        for (let i = 0; i < 10; i++) {
            let newPlanet = this.addPlanet();     
            let pos = new Vector2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
            newPlanet.setPosition(pos);
        }
    }

    checkPlanets() {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            for (let i = 0; i < this.planets.length; i++) {
                const planet = this.planets[i];
                let dist = Vector2.Distance(planet.position, player.position);
                if (dist < player.size * 20) {
                    this.removePlanet(planet);
                    player.addPlanet(planet);
                }
            }
        }
    }

    players: Array<Player> = [];
    addPlayer(player: Player) {
        this.players.push(player);
    }

    removePlayer(player: Player) {
        remove(this.players, (p) => {return player.key == p.key})
    }
}