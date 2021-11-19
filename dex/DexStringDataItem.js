import DexFile from './DexFile.js';

export default class DexStringDataItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}