import DexFile from './DexFile.js';

export default class DexProtoIdItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
