import DexFile from './DexFile.js';

export default class DexFileHeader {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
