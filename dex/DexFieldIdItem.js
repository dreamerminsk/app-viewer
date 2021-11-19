import DexFile from './DexFile.js';

export default class DexFieldIdItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
