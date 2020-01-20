
import { NakerWorker } from '@naker/services/Viewer/worker';
import { starInterface } from './Entity/star';

declare let StarEngine;
class BackWorker extends NakerWorker {
    buildProject(back: starInterface) {
        return StarEngine.start(back);
    }
}

let back = new BackWorker();