import DexFile from './DexFile.js';

export default class DexMethodHandleItem {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}