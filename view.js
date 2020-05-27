async function processFile(f) {
    const fileContentDiv = document.querySelector('div#file-content');
    const fileContents = await readBuffer(f, 0, 1024);
    try {
        let dos = await readDosHeader(fileContents);
        let sign = await readSignature(fileContents, dos.e_lfanew);
        let fh = await readFileHeader(fileContents, dos.e_lfanew + 4);
        let oh = await readOptHeader(fileContents, dos.e_lfanew + 24, fh.SizeOfOptionalHeader);
        let dirOffset = dos.e_lfanew + 24 + (oh.Magic == "10b" ? 96 : 112);
        let dirs = await readDirectories(
            new DataView(fileContents, dirOffset),
            oh.NumberOfRvaAndSizes);
        let sectOffset = dirOffset + 8 * 16;
        console.log(sectOffset);
        let sects = await readSections(new DataView(fileContents, sectOffset), fh.NumberOfSections);

        fileContentDiv.innerHTML =
            `<div class='panel is-info'>
                <div class='panel-heading'>${f.name}</div>
                ${subheader(0, f.size)}
                ${row("HEADERS", oh.SizeOfHeaders)}
            </div>`;

        fileContentDiv.innerHTML +=
            `<div class='panel is-info is-small'>
            <div class='panel-heading'>IMAGE_DOS_HEADER</div>
            ${row("e_lfanew", dos.e_lfanew)}
        </div>`;
        fileContentDiv.innerHTML +=
            `<div class='panel is-info is-small'>
            <p class='panel-heading'>IMAGE_NT_HEADERS</p>
            ${row("Signature", sign.Signature)}
        </div>`;
        fileContentDiv.innerHTML +=
            `<div class='panel is-info is-small'>
            <p class='panel-heading'>IMAGE_FILE_HEADER</p>
            ${row("Machine", fh.Machine.toString(16))}
            ${row("NumberOfSections", fh.NumberOfSections)}
            ${row("TimeDateStamp", fh.TimeDateStamp.toString(16))}
            ${row("PointerToSymbolTable", fh.PointerToSymbolTable)}
            ${row("NumberOfSymbols", fh.NumberOfSymbols)}
            ${row("SizeOfOptionalHeader", fh.SizeOfOptionalHeader)}
            ${row("Characteristics", fh.Characteristics.toString(16))}
        </div>`;
        fileContentDiv.innerHTML +=
            `<div class='panel is-info is-small'>
            <p class='panel-heading'>IMAGE_OPTIONAL_HEADER</p>
            ${Object.keys(oh).map((color, idx) => `
                ${row(color, oh[color])}
            `).join('')}
        </div>`;

        fileContentDiv.innerHTML +=
            `<div class='panel is-info is-small'>
            <p class='panel-heading'>IMAGE_DATA_DIRECTORIES</p>
            ${dirs.map((color, idx) => `
                ${entry_row(getDirName(idx), color.Size > 0)}
                ${row("VirtualAddress", color.VirtualAddress, color.Size > 0)}
                ${row("Size", color.Size, color.Size > 0)}
            `).join('')}
        </div>`;

        fileContentDiv.innerHTML +=
            `<div class='panel is-info is-small'>
            <p class='panel-heading'>IMAGE_DATA_SECTIONS</p>
            ${sects.map((sect, idx) => `
                ${entry_row(sect.Name, true)}
                ${Object.keys(sect).map((prop, idx) => `
                ${row(prop, sect[prop])}
            `).join('')}
            `).join('')}
        </div>`;
    } catch (e) {
        fileContentDiv.innerHTML += e.message
    }
};


function subheader(offset, size) {
    return `
    <span class='panel-block'>
        <div class="control is-inline">
            <div class="tags has-addons is-inline">
                <span class="tag is-dark">offset</span>
                <span class="tag is-info">${offset}</span>
            </div>
            <div class="tags has-addons is-inline">
                <span class="tag is-dark">size</span>
                <span class="tag is-info">${size}</span>
            </div>
        </div>
    </span>          
    `;
}


function entry_row(name, ispresent) {
    return `<span class='panel-block'>
        <div class='control'>
            <p ${ispresent ?
            "class=\'has-text-link has-text-weight-bold\'" :
            "class=\'has-text-grey-light has-text-weight-bold\'"}>
            ${name}
            </p>
        </div>
    </span>            
    `;
}

function row(name, value, ispresent = true) {
    return `<span class='panel-block'>
        <div class='control'>
            <nav class='level is-mobile'>
                <div class='level-left'>
                    <div class='level-item'>
                        <p class='has-text-left ${ispresent ? 'has-text-black' : 'has-text-grey-light'}'>${name}</p>
                    </div>
                </div>
                <div class='level-right'>
                    <div class='level-item'>
                        <p class='has-text-right ${ispresent ? 'has-text-black' : 'has-text-grey-light'}'>${value}</p>
                    </div>
                </div>
            </nav>
        </div>
    </span>            
    `;
}



let dropArea = document.getElementById('drop-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
};

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
};

function unhighlight(e) {
    dropArea.classList.remove('highlight');
};

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
};

function handleFiles(files) {
    files = [...files];
    files.forEach(processFile);
};