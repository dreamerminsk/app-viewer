import DexFile from './DexFile.js';

export default class DexMethodIdItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
