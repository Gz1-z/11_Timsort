const arrayContainer = document.getElementById('array-container');
const historyLog = document.getElementById('history-log');
const speedRange = document.getElementById('speedRange');
const speedVal = document.getElementById('speedVal');
const manualCheck = document.getElementById('manualMode');
const nextBtn = document.getElementById('nextBtn');
const startBtn = document.getElementById('startBtn');

let array = [45, 23, 89, 12, 67, 34, 9, 56, 78, 2];
const RUN = 4;
let resolveStep; 

speedRange.oninput = () => speedVal.innerText = `${speedRange.value}ms`;

function toggleManualMode() {
    nextBtn.disabled = !manualCheck.checked;
    if (!manualCheck.checked && resolveStep) resolveStep(); 
}

function triggerNext() {
    if (resolveStep) resolveStep();
}

async function wait() {
    if (manualCheck.checked) {
        return new Promise(resolve => { resolveStep = resolve; });
    } else {
        return new Promise(resolve => setTimeout(resolve, speedRange.value));
    }
}

function createBars() {
    arrayContainer.innerHTML = '';
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 2}px`;
        bar.innerText = value;
        arrayContainer.appendChild(bar);
    });
}

function addLog(msg, isHeader = false) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    if (isHeader) {
        entry.style.color = '#38bdf8';
        entry.style.fontWeight = 'bold';
        entry.style.marginTop = '10px';
    }
    entry.innerText = msg;
    historyLog.appendChild(entry);
    historyLog.scrollTop = historyLog.scrollHeight;
}

async function insertionSort(left, right) {
    const bars = document.querySelectorAll('.bar');
    addLog(`>> Menjalankan Insertion Sort pada indeks [${left} - ${right}]`, true);
    
    for (let i = left + 1; i <= right; i++) {
        let temp = array[i];
        let j = i - 1;
        bars[i].classList.add('comparing');
        addLog(`Memilih elemen '${temp}' pada indeks ${i} untuk disisipkan.`);
        
        let shifted = false;
        while (j >= left && array[j] > temp) {
            addLog(`-- Bandingkan '${array[j]}' > '${temp}'. Geser '${array[j]}' ke kanan (indeks ${j + 1}).`);
            array[j + 1] = array[j];
            bars[j + 1].style.height = `${array[j] * 2}px`;
            bars[j + 1].innerText = array[j];
            j--;
            shifted = true;
            await wait();
        }
        
        if (shifted) {
            addLog(`-- Posisi ditemukan. Menempatkan '${temp}' pada indeks ${j + 1}.`);
        } else {
             addLog(`-- '${temp}' sudah berada di posisi yang benar.`);
        }

        array[j + 1] = temp;
        bars[j + 1].style.height = `${temp * 2}px`;
        bars[j + 1].innerText = temp;
        bars[i].classList.remove('comparing');
        await wait();
    }
    addLog(`<< Selesai Insertion Sort pada indeks [${left} - ${right}]`);
}

async function merge(l, m, r) {
    const bars = document.querySelectorAll('.bar');
    addLog(`>> Menggabungkan (Merge) dua blok: Kiri [${l}-${m}] dan Kanan [${m+1}-${r}]`, true);
    
    let leftPart = array.slice(l, m + 1);
    let rightPart = array.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;

    addLog(`Isi Blok Kiri: [${leftPart.join(', ')}] | Isi Blok Kanan: [${rightPart.join(', ')}]`);

    while (i < leftPart.length && j < rightPart.length) {
        bars[k].classList.add('comparing');
        addLog(`Bandingkan Kiri '${leftPart[i]}' vs Kanan '${rightPart[j]}'`);
        
        if (leftPart[i] <= rightPart[j]) {
            addLog(`-- Kiri lebih kecil/sama. Taruh '${leftPart[i]}' di indeks ${k}.`);
            array[k] = leftPart[i]; i++;
        } else {
            addLog(`-- Kanan lebih kecil. Taruh '${rightPart[j]}' di indeks ${k}.`);
            array[k] = rightPart[j]; j++;
        }
        bars[k].style.height = `${array[k] * 2}px`;
        bars[k].innerText = array[k];
        await wait();
        bars[k].classList.remove('comparing');
        k++;
    }
    
    if (i < leftPart.length) {
        addLog(`Menyalin sisa elemen dari Blok Kiri: [${leftPart.slice(i).join(', ')}]`);
        while (i < leftPart.length) { 
            array[k] = leftPart[i]; 
            bars[k].style.height = `${array[k] * 2}px`; bars[k].innerText = array[k]; 
            i++; k++; await wait(); 
        }
    }
    
    if (j < rightPart.length) {
        addLog(`Menyalin sisa elemen dari Blok Kanan: [${rightPart.slice(j).join(', ')}]`);
        while (j < rightPart.length) { 
            array[k] = rightPart[j]; 
            bars[k].style.height = `${array[k] * 2}px`; bars[k].innerText = array[k]; 
            j++; k++; await wait(); 
        }
    }
    addLog(`<< Selesai Merge. Hasil sementara: [${array.slice(l, r + 1).join(', ')}]`);
}

async function startTimsort() {
    startBtn.disabled = true;
    historyLog.innerHTML = '';
    const n = array.length;

    addLog("=== TAHAP 1: PEMBAGIAN KE DALAM RUN (INSERTION SORT) ===", true);
    for (let i = 0; i < n; i += RUN) {
        await insertionSort(i, Math.min(i + RUN - 1, n - 1));
    }

    addLog("=== TAHAP 2: PENGGABUNGAN RUN (MERGE) ===", true);
    for (let size = RUN; size < n; size = 2 * size) {
        for (let left = 0; left < n; left += 2 * size) {
            let mid = left + size - 1;
            let right = Math.min(left + 2 * size - 1, n - 1);
            if (mid < right) await merge(left, mid, right);
        }
    }
    
    addLog("=== ALGORITMA SELESAI ===", true);
    document.querySelectorAll('.bar').forEach(b => b.classList.add('sorted'));
    startBtn.disabled = false;
}

function resetArray() {
    array = [45, 23, 89, 12, 67, 34, 9, 56, 78, 2];
    createBars();
    historyLog.innerHTML = '';
    startBtn.disabled = false;
}

createBars();