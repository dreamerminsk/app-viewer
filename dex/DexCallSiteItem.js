import DexFile from './DexFile.js';

export default class DexCallSiteItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}