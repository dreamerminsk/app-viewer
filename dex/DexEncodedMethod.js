import DexFile from './DexFile.js';

export default class DexEncodedMethod  {
    constructor(dexFile) {
        if (dexFile instanceof DexFile) {
            this.dexFile = dexFile;
        }
    }
}
