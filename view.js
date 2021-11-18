async function processFile(f) {
    const fileContentDiv = document.querySelector('div#file-content');
    const fileContents = await readBuffer(f, 0, 4096);
    try {
        const dos = await readDosHeader(fileContents);
        const sign = await readSignature(fileContents, dos.e_lfanew);
        const fh = await readFileHeader(fileContents, dos.e_lfanew + 4);
        const oh = await readOptHeader(fileContents, dos.e_lfanew + 24, fh.SizeOfOptionalHeader);
        const dirOffset = dos.e_lfanew + 24 + (oh.Magic == "10b" ? 96 : 112);
        const dirs = await readDirectories(
            new DataView(fileContents, dirOffset),
            oh.NumberOfRvaAndSizes);
        const sectOffset = dirOffset + 8 * 16;
        const sects = await readSections(new DataView(fileContents, sectOffset), fh.NumberOfSections);

        fileContentDiv.innerHTML = FilePropsView(f);
        fileContentDiv.innerHTML += DosView(dos);
        fileContentDiv.innerHTML += NTView(sign);
        fileContentDiv.innerHTML += FileView(fh);
        fileContentDiv.innerHTML += OptionalView(oh);
        fileContentDiv.innerHTML += DirsView(dirs);
        fileContentDiv.innerHTML += SectsView(sects);
        fileContentDiv.innerHTML += SectorListView(sects);
    } catch (e) {
        fileContentDiv.innerHTML += `
        <div class="notification is-danger">
            <button class="delete"></button>
            ${e.message}
        </div>`;
    }
}

function FilePropsView(f) {
    const lm = new Date(f.lastModified);
    return `<div class='panel is-link'>
                <div class='panel-heading'>${f.name}</div>
                ${rowRefs('type', f.type)}
                 ${rowRefs('size', f.size)}
                 ${rowRefs('lastModified', `${lm.toLocaleDateString()} ${lm.toLocaleTimeString()}`)}
                ${Object.keys(f).map((sect, _idx) => `
                    ${rowRefs(sect, f[sect])}
                `).join('')}
            </div>`
}

function DosView(dos) {
    return `<div class='panel is-info is-small'>
            <div class='panel-heading'>DOS HEADER</div>
            ${row("e_lfanew", dos.e_lfanew)}
        </div>`;
}

function NTView(sign) {
    return `<div class='panel is-info is-small'>
            <p class='panel-heading'>NT HEADERS</p>
            ${row("Signature", sign.Signature)}
        </div>`;
}

function FileView(fh) {
    return `<div class='panel is-info is-small'>
            <p class='panel-heading'>FILE HEADER</p>
            ${row("Machine", fh.Machine.toString(16))}
            ${row("NumberOfSections", fh.NumberOfSections)}
            ${row("TimeDateStamp", fh.TimeDateStamp.toString(16))}
            ${row("PointerToSymbolTable", fh.PointerToSymbolTable)}
            ${row("NumberOfSymbols", fh.NumberOfSymbols)}
            ${row("SizeOfOptionalHeader", fh.SizeOfOptionalHeader)}
            ${row("Characteristics", fh.Characteristics.toString(16))}
        </div>`;
}

function OptionalView(oh) {
    return `<div class='panel is-info is-small'>
    <p class='panel-heading'>OPTIONAL HEADER</p>
    ${Object.keys(oh).map((color, _idx) => `
        ${row(color, oh[color])}
    `).join('')}
</div>`;
}

function DirsView(dirs) {
    return `<div class='panel is-info is-small'>
            <p class='panel-heading'>DATA DIRECTORIES</p>
            ${dirs.map((color, idx) => `
                ${entryRow(getDirName(idx), color.Size > 0)}
                ${row("VirtualAddress", color.VirtualAddress, color.Size > 0)}
                ${row("Size", color.Size, color.Size > 0)}
            `).join('')}
        </div>`;
}

function SectsView(sects) {
    return `<div class='panel is-info is-small'>
            <p class='panel-heading'>IMAGE_DATA_SECTIONS</p>
            ${sects.map((sect, _idx) => `
                ${entryRow(sect.Name, true)}
                ${Object.keys(sect).map((prop, _idx) => `
                ${row(prop, sect[prop])}
            `).join('')}
            `).join('')}
        </div>`;
}

function SectorListView(sects) {
    return `
    ${sects.map((sect, _idx) => `
        <div class='panel is-info'>
        <div class='panel-heading'>${sect.Name}</div>
        ${subheader(sect.PointerToRawData, sect.SizeOfRawData)}
        </div>
        `).join('')}
    `
}

function subheader(offset, size) {
    return `<span class='panel-block'>
    <div class="field is-grouped is-grouped-multiline">
        <div class="control">
            <div class="tags has-addons">
                 <a class="tag is-dark">offset</a> 
                 <a class="tag is-link">${offset}</a>
             </div> 
        </div> 
        <div class="control">
            <div class="tags has-addons">
                <a class="tag is-dark">size</a>
                <a class="tag is-link">${size}</a>
            </div>
         </div>
      </div>
    </span>          
    `;
}


function entryRow(name, ispresent) {
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

function rowRefs(name, value) {
    return `<a class='panel-block'>
        <div class='control'>
            <nav class='level is-mobile'>
                <div class='level-left'>
                    <div class='level-item'>
                        <p class='has-text-left'>${name}</p>
                    </div>
                </div>
                <div class='level-right'>
                    <div class='level-item'>
                        <p class='has-text-right'>${value}</p>
                    </div>
                </div>
            </nav>
        </div>
    </a>            
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



const dropArea = document.getElementById('drop-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
})

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
})

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(_e) {
    dropArea.classList.add('highlight');
}

function unhighlight(_e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    files = [...files];
    files.forEach(processFile);
}