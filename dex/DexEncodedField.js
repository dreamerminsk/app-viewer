import DexFile from './DexFile.js';

export default class DexEncodedField  {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
