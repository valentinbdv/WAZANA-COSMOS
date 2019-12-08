
import { starInterface } from './Entity/star';
import { NakerOffscreenViewer } from '@naker/services/Viewer/offscreenViewer';
import { setStyle } from 'redom';

declare let StarEngine;
export class StarViewer extends NakerOffscreenViewer {

    constructor(container:HTMLElement, backOptions: starInterface, callback?: Function, offscreen?: boolean) {
        super(container, offscreen);
        setStyle(this.canvas, { 'pointer-events': 'none', 'z-index': '-1' });

        this.load('https://test.wazana.io/starwars/dist/', backOptions, (engine) => {
        // this.load('http://localhost/StarWars/dist/', backOptions, (engine) => {
            if (callback) callback(engine);
        });
    }

    engine: any;
    buildProject(back: starInterface) {
        back.canvas = this.canvas;
        return StarEngine.start(back);
    }
}