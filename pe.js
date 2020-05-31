const readBuffer = async(inputFile, fromByte, toByte) => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        var blob = inputFile.slice(fromByte, toByte);
        temporaryFileReader.readAsArrayBuffer(blob);
    });
};


const readUploadedFile = async(inputFile) => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };

        temporaryFileReader.readAsArrayBuffer(inputFile);
    });
};


class PEFile {
    constructor() {

    }
}



async function readDosHeader(buf) {
    return {
        e_lfanew: new Uint32Array(buf, 0)[15],
    };
}

async function readSignature(buf, offset) {
    let utf8decoder = new TextDecoder();
    let buffer = new Uint8Array(buf, offset, 4);
    return {
        Signature: `${utf8decoder.decode(buffer)}\\${buffer[2]}\\${buffer[3]}`,
    };
}

async function readFileHeader(buf, offset) {
    return {
        Machine: new Uint16Array(buf, offset)[0],
        NumberOfSections: new Uint16Array(buf, offset)[1],
        TimeDateStamp: new Uint32Array(buf, offset)[1],
        PointerToSymbolTable: new Uint32Array(buf, offset)[2],
        NumberOfSymbols: new Uint32Array(buf, offset)[3],
        SizeOfOptionalHeader: new Uint16Array(buf, offset)[8],
        Characteristics: new Uint16Array(buf, offset)[9],
    };
}

async function readOptHeader(buf, offset, size) {
    let b = new DataView(buf, offset);
    let magic = b.getUint16(0, true);
    if (magic == 267) {
        return await readOptHeader32(b);
    } else if (magic == 523) {
        return await readOptHeader64(b);
    } else {
        return {
            magic: magic
        };
    }
}

async function readOptHeader32(buf) {
    return {
        Magic: buf.getUint16(0, true).toString(16),
        MajorLinkerVersion: buf.getUint8(2, true),
        MinorLinkerVersion: buf.getUint8(3, true),
        SizeOfCode: buf.getUint32(4, true),
        SizeOfInitializedData: buf.getUint32(8, true),
        SizeOfUninitializedData: buf.getUint32(12, true),
        AddressOfEntryPoint: buf.getUint32(16, true),
        BaseOfCode: buf.getUint32(20, true),
        BaseOfData: buf.getUint32(24, true),
        ImageBase: buf.getUint32(28, true),
        SectionAlignment: buf.getUint32(32, true),
        FileAlignment: buf.getUint32(36, true),
        MajorOperatingSystemVersion: buf.getUint16(40, true),
        MinorOperatingSystemVersion: buf.getUint16(42, true),
        MajorImageVersion: buf.getUint16(44, true),
        MinorImageVersion: buf.getUint16(46, true),
        MajorSubsystemVersion: buf.getUint16(48, true),
        MinorSubsystemVersion: buf.getUint16(50, true),
        Win32VersionValue: buf.getUint32(52, true),
        SizeOfImage: buf.getUint32(56, true),
        SizeOfHeaders: buf.getUint32(60, true),
        CheckSum: buf.getUint32(64, true),
        Subsystem: buf.getUint16(68, true),
        DllCharacteristics: '0x' + buf.getUint16(70, true).toString(16),
        SizeOfStackReserve: buf.getUint32(72, true),
        SizeOfStackCommit: buf.getUint32(76, true),
        SizeOfHeapReserve: buf.getUint32(80, true),
        SizeOfHeapCommit: buf.getUint32(84, true),
        LoaderFlags: buf.getUint32(88, true),
        NumberOfRvaAndSizes: buf.getUint32(92, true),
    };
}


async function readOptHeader64(buf) {
    return {
        Magic: buf.getUint16(0, true).toString(16),
        MajorLinkerVersion: buf.getUint8(2, true),
        MinorLinkerVersion: buf.getUint8(3, true),
        SizeOfCode: buf.getUint32(4, true),
        SizeOfInitializedData: buf.getUint32(8, true),
        SizeOfUninitializedData: buf.getUint32(12, true),
        AddressOfEntryPoint: buf.getUint32(16, true),
        BaseOfCode: buf.getUint32(20, true),
        ImageBase: buf.getBigUint64(24, true),
        SectionAlignment: buf.getUint32(32, true),
        FileAlignment: buf.getUint32(36, true),
        MajorOperatingSystemVersion: buf.getUint16(40, true),
        MinorOperatingSystemVersion: buf.getUint16(42, true),
        MajorImageVersion: buf.getUint16(44, true),
        MinorImageVersion: buf.getUint16(46, true),
        MajorSubsystemVersion: buf.getUint16(48, true),
        MinorSubsystemVersion: buf.getUint16(50, true),
        Win32VersionValue: buf.getUint32(52, true),
        SizeOfImage: buf.getUint32(56, true),
        SizeOfHeaders: buf.getUint32(60, true),
        CheckSum: buf.getUint32(64, true),
        Subsystem: buf.getUint16(68, true),
        DllCharacteristics: '0x' + buf.getUint16(70, true).toString(16),
        SizeOfStackReserve: buf.getBigUint64(72, true),
        SizeOfStackCommit: buf.getBigUint64(80, true),
        SizeOfHeapReserve: buf.getBigUint64(88, true),
        SizeOfHeapCommit: buf.getBigUint64(96, true),
        LoaderFlags: buf.getUint32(104, true),
        NumberOfRvaAndSizes: buf.getUint32(108, true),
    };
}

function getDirName(idx) {
    switch (idx) {
        case 0:
            return "ENTRY_EXPORT";
        case 1:
            return "ENTRY_IMPORT";
        case 2:
            return "ENTRY_RESOURCE";
        case 3:
            return "ENTRY_EXCEPTION";
        case 4:
            return "ENTRY_SECURITY";
        case 5:
            return "ENTRY_BASERELOC";
        case 6:
            return "ENTRY_DEBUG";
        case 7:
            return "ENTRY_ARCHITECTURE";
        case 8:
            return "ENTRY_GLOBALPTR";
        case 9:
            return "ENTRY_TLS";
        case 10:
            return "ENTRY_LOAD_CONFIG";
        case 11:
            return "ENTRY_BOUND_IMPORT";
        case 12:
            return "ENTRY_IAT";
        case 13:
            return "ENTRY_DELAY_IMPORT";
        case 14:
            return "ENTRY_COM_DESCRIPTOR";
        case 15:
            return "ENTRY_RESERVED";
        default:
            return "ENTRY_UNKNOWN";
    }
}

async function readDirectories(buf, count) {
    let dirs = [];
    console.log(buf);
    for (let i = 0; i < count; i++) {
        dirs.push({
            VirtualAddress: buf.getUint32(8 * i, true),
            Size: buf.getUint32(8 * i + 4, true),
        });
    }
    return dirs;
}

async function readSections(buf, count) {
    let dirs = [];
    console.log(buf);
    for (let i = 0; i < count; i++) {
        dirs.push({
            Name: await readString(buf, buf.byteOffset + 40 * i, 8),
            VirtualSize: buf.getUint32(40 * i + 8, true),
            VirtualAddress: buf.getUint32(40 * i + 12, true),
            SizeOfRawData: buf.getUint32(40 * i + 16, true),
            PointerToRawData: buf.getUint32(40 * i + 20, true),
            PointerToRelocations: buf.getUint32(40 * i + 24, true),
            PointerToLinenumbers: buf.getUint32(40 * i + 28, true),
            NumberOfRelocations: buf.getUint16(40 * i + 32, true),
            NumberOfLinenumbers: buf.getUint16(40 * i + 34, true),
            Characteristics: buf.getUint32(40 * i + 36, true),
        });
    }
    return dirs;
}

async function readString(buf, pos, length) {
    let utf8decoder = new TextDecoder();
    return utf8decoder.decode(new Uint8Array(buf.buffer, pos, length));
}