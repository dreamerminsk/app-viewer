import DexFile from './DexFile.js';

export default class DexHeaderItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
