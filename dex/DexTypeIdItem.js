import DexFile from './DexFile.js';

export default class DexTypeIdItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
