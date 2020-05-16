import { SatelliteEntity } from './satelliteEntity';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';

export let gravityRatio = 10;
let grabCurve = new CubicEase();
grabCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

export class GravityEntity extends SatelliteEntity {
    
    gravity = 1;
    gravityField = 1;
    setGravity(gravity: number) {
        this.gravity = gravity;
        this.updateGravityField();
    }

    _setSize(size: number) {
        this.size = size;
        this.updateGravityField();
    }

    updateGravityField() {
        this.gravityField = Math.sqrt(this.size * this.gravity) * gravityRatio;
    }

    cycleAbsorb = 1;
    satellites: Array<SatelliteEntity> = [];
    cycleSize = 1;
    satelliteCycle() {
        for (let i = 0; i < this.satellites.length; i++) {
            const satellite = this.satellites[i];
            satellite.transformMesh.position.x = ((this.size * 1.5) + satellite.stationaryRadius) * Math.cos((satellite.stationaryVelocity * satellite.cycle) / 100 + satellite.offset);
            satellite.transformMesh.position.z = ((this.size * 1.5) + satellite.stationaryRadius) * Math.sin((satellite.stationaryVelocity * satellite.cycle) / 100 + satellite.offset);
            // console.log(this.size,satellite.stationaryRadius,satellite.stationaryVelocity,satellite.cycle,satellite.offset);
            satellite.transformMesh.rotation.y = satellite.stationaryVelocity * ( this.cycleSize / 100 );
            satellite.cycle += this.cycleSize * this.system.fpsRatio;
        }
    }

    removeAllSatellites() {
        // for (let i = 0; i < this.satellites.length; i++) {
        //     const satellite = this.satellites[i];
        //     satellite.hide();
        //     this.planetMap.storagePlanet(planet);
        // }
        this.satellites = [];
    }

    fixeSatellite(satellite: SatelliteEntity) {
        satellite.setParent(this.transformMesh);
        this.satellites.push(satellite);
    }

    grabAnimationLength = 50;
    grabSatellite(satellite: SatelliteEntity, radius: number, velocity: number) {
        let xgap = this.position.x - satellite.position.x;
        let ygap = this.position.y - satellite.position.y;
        let offset = (xgap > 0) ? Math.atan(ygap / xgap) + Math.PI : Math.atan(ygap / xgap);
        satellite.setOffset(offset);

        let dist = Vector2.Distance(satellite.position, this.position);
        let radiusTemp = dist - this.size;
        let radiusChange = radiusTemp - radius;
        satellite.setGeostationnaryMovement(radius + radiusChange, 0);
        satellite.satelliteAnimation.simple(this.grabAnimationLength, (count, perc) => {
            let progress = grabCurve.ease(perc);
            satellite.setGeostationnaryMovement(radius + (1 - progress) * radiusChange, progress * velocity);
        }, () => {
            satellite.setGeostationnaryMovement(radius, velocity);
        });
    }

}