import { MeshSystem } from '../System/meshSystem';
import { Planet } from '../Objects/planet';
import { DustMap } from './dustMap';

import remove from 'lodash/remove';
import filter from 'lodash/filter';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class PlanetMap extends DustMap {

    system: MeshSystem;

    constructor(system: MeshSystem) {
        super(system);
        this.system = system;
        this.createAllPlanets();
    }

    planetNumbers = 50;
    planetsStorage: Array<Planet> = [];
    planetsWithStar: Array<Planet> = [];
    createAllPlanets() {
        for (let i = 0; i < this.planetNumbers; i++) {
            let planet = new Planet(this.system);
            this.planetsStorage.push(planet);
        }
    }

    planets: Object = {};
    addPlanet(): Planet {
        let planetsAvailable = filter(this.planetsStorage, (p) => { return !p.attachedToStar });
        if (planetsAvailable.length != 0) {
            let planet: Planet = planetsAvailable.pop();
            remove(this.planetsStorage, (p) => { return p.key == planet.key });
            planet.show();
            this.planets[planet.key] = planet;
            return planet;
        }
        return null;
    }

    removePlanet(planet: Planet) {
        delete this.planets[planet.key];
    }

    storagePlanet(planet: Planet) {
        this.removePlanet(planet);
        planet.hide();
        if (this.planetsStorage.indexOf(planet) == -1) this.planetsStorage.push(planet);
    }

    setPlanetWithStar(planet: Planet) {
        this.removePlanet(planet);
    }

    eraseAllPlanets() {
        for (const key in this.planets) {
            this.storagePlanet(this.planets[key]);
        }
        for (const key in this.planetsStorage) {
            this.planetsStorage[key].hide();
        }
        this.planets = {};
    }

    checkPlanetsCycle() {
        for (const key in this.planets) {
            const planet = this.planets[key];
            planet.mesh.rotation.y += 0.01 * this.system.fpsRatio;
        }
    }
}