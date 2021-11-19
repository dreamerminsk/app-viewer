import DexFile from './DexFile.js';

export default class DexCallSiteIdItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}