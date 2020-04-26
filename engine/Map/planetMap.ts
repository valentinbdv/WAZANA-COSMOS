import { MeshSystem } from '../System/meshSystem';
import { Planet, PlanetInterface } from '../Entity/planet';
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
    createAllPlanets() {
        for (let i = 0; i < this.planetNumbers; i++) {
            let planetInterface: PlanetInterface = { size: 1 };
            let planet = new Planet(this.system, planetInterface);
            this.planetsStorage.push(planet);
        }
    }

    planets: Object = {};
    addPlanet(planetInterface: PlanetInterface) {
        let planetsAvailable = filter(this.planetsStorage, (p) => { return !p.attachedToStar });
        if (planetsAvailable.length != 0) {
            let planet = planetsAvailable.pop();
            remove(this.planetsStorage, (p) => { return p.key == planet.key });
            planet.setOptions(planetInterface);
            planet.show();
            this.planets[planet.key] = planet;
            return planet;
        }
        return false;
    }

    removePlanet(planet: Planet) {
        delete this.planets[planet.key];
    }

    storagePlanet(planet: Planet) {
        this.removePlanet(planet);
        planet.animation.stop();
        if (this.planetsStorage.indexOf(planet) == -1) this.planetsStorage.push(planet);
    }

    setPlanetWithStar(planet: Planet) {
        this.storagePlanet(planet);
        planet.attachedToStar = true;
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