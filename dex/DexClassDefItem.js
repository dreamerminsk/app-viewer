import DexFile from './DexFile.js';

export default class DexClassDefItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
