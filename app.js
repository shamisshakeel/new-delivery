/**
 * Ahmed Hanif Rajput Pakwan - Point of Sale Software Module
 * GitHub Target Version: Refactored Production Build
 */

// Application Scope Global Core Memory Registers
let customItems = JSON.parse(localStorage.getItem('categorizedMenu')) || [];
let currentDayLog = JSON.parse(localStorage.getItem('currentDayLog')) || [];
let currentRefundLog = JSON.parse(localStorage.getItem('currentRefundLog')) || [];
let allTimeHistory = JSON.parse(localStorage.getItem('allTimeHistory')) || [];
let knownCustomers = JSON.parse(localStorage.getItem('knownCustomers')) || [];
let shiftStartTime = localStorage.getItem('shiftStartTime') || null;

let currentCart = {};
let currentActiveCategory = "All";
let activeCustomerSearchQuery = "";

// System Level Date Utilities
function getFormattedSystemDate(targetDate = new Date()) {
    return targetDate.toLocaleDateString('en-GB').replace(/\//g, '-');
}

function normalizeToSystemDate(dateString) {
    if (!dateString) return getFormattedSystemDate();
    return dateString.replace(/\//g, '-');
}

// System Backup and Data Restoration System Engines
function exportSystemBackupJSON() {
    const backupPayload = {
        categorizedMenu: customItems,
        currentDayLog: currentDayLog,
        currentRefundLog: currentRefundLog,
        allTimeHistory: allTimeHistory,
        knownCustomers: knownCustomers,
        shiftStartTime: shiftStartTime
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AHRP_POS_SYSTEM_BACKUP_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

function importSystemBackupJSON() {
    const fileInput = document.getElementById('import-backup-file');
    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a valid (.json) backup database template file first.");
        return;
    }
    
    if (!confirm("CRITICAL WARNING: This action will completely overwrite all local application data, current shift data, history ledgers, and configurations. Proceed?")) {
        return;
    }
    
    const selectedFile = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const parsedData = JSON.parse(event.target.result);
            
            if (!parsedData.categorizedMenu || !parsedData.knownCustomers || !parsedData.allTimeHistory) {
                throw new Error("Invalid schema tracking configuration variables.");
            }
            
            // Sync Local Storage
            localStorage.setItem('categorizedMenu', JSON.stringify(parsedData.categorizedMenu));
            localStorage.setItem('currentDayLog', JSON.stringify(parsedData.currentDayLog || []));
            localStorage.setItem('currentRefundLog', JSON.stringify(parsedData.currentRefundLog || []));
            localStorage.setItem('allTimeHistory', JSON.stringify(parsedData.allTimeHistory || []));
            localStorage.setItem('knownCustomers', JSON.stringify(parsedData.knownCustomers || []));
            
            if (parsedData.shiftStartTime) {
                localStorage.setItem('shiftStartTime', parsedData.shiftStartTime);
            } else {
                localStorage.removeItem('shiftStartTime');
            }
            
            // Memory State Core Override Synchronization
            customItems = parsedData.categorizedMenu;
            currentDayLog = parsedData.currentDayLog || [];
            currentRefundLog = parsedData.currentRefundLog || [];
            allTimeHistory = parsedData.allTimeHistory || [];
            knownCustomers = parsedData.knownCustomers || [];
            shiftStartTime = parsedData.shiftStartTime || null;
            
            alert("Database Memory Override Successfully Restored!");
            window.location.reload(); 
            
        } catch (err) {
            alert("Error parsing memory file: Invalid or corrupted JSON backup package schema layout.\n" + err.message);
        }
    };
    reader.readAsText(selectedFile);
}

// Active Mass Configuration Metrics Grid Matrix
function renderMenuWeightsManagement() {
    const container = document.getElementById('menu-weights-management-container');
    if (!container) return;
    container.innerHTML = '';
    
    let table = `<div class="section-title" style="margin-top:16px;">Active Dynamic Mass Multiplier Factors</div>
    <table class="styled-table">
        <thead>
            <tr>
                <th>Menu Item Label</th>
                <th>Category Mapping</th>
                <th style="width:120px;">Unit Grams (g)</th>
                <th style="text-align:right; width:80px;">Execution</th>
            </tr>
        </thead>
        <tbody>`;
        
    customItems.forEach((itemObj, index) => {
        table += `<tr>
            <td style="font-weight:600; color:var(--text-main);">${itemObj.name}</td>
            <td style="color:var(--text-muted); font-size:12px;">${itemObj.category}</td>
            <td>
                <input type="number" class="input-field" id="weight-input-${index}" value="${itemObj.weight || 0}" style="padding:6px; font-size:13px; text-align:center;">
            </td>
            <td style="text-align:right;">
                <button class="btn-action-small btn-edit" style="background:var(--accent); color:white; border:none;" onclick="updateItemWeightRow(${index})">Bind</button>
            </td>
        </tr>`;
    });
    table += `</tbody></table>`;
    container.innerHTML = table;
}

function updateItemWeightRow(index) {
    const inputField = document.getElementById(`weight-input-${index}`);
    if (!inputField) return;
    
    const newW = parseInt(inputField.value, 10);
    if (isNaN(newW) || newW < 0) {
        alert("Entry out of bounds range parameters.");
        return;
    }
    
    customItems[index].weight = newW;
    localStorage.setItem('categorizedMenu', JSON.stringify(customItems));
    alert(`Retroactive execution mapping successful. Item weight altered to ${newW}g.`);
    
    renderMenu();
    updateLiveBreakdown();
}

// Fuzzy Levenshtein Distance Algorithmic Helper Block
function findClosestCustomerName(query) {
    if (!query || knownCustomers.length === 0) return null;
    let closestMatch = null;
    let minDistance = 3; // Strict Threshold
    
    const cleanQuery = query.trim().toLowerCase();
    
    for (let name of knownCustomers) {
        let cleanName = name.trim().toLowerCase();
        if (cleanName === cleanQuery) return name;
        
        // Basic Levenshtein Evaluation Core implementation
        let distance = calculateLevenshtein(cleanQuery, cleanName);
        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = name;
        }
    }
    return closestMatch;
}

function calculateLevenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Profile Master Ledger Management Actions Loop
function addCustomerManually() {
    const input = document.getElementById('new-manual-customer');
    if (!input) return;
    
    const name = input.value.trim().replace(/\b\w/g, char => char.toUpperCase());
    if (!name) return;
    
    if (!knownCustomers.includes(name)) {
        knownCustomers.push(name);
        localStorage.setItem('knownCustomers', JSON.stringify(knownCustomers));
        
        if (typeof populateCustomerDatalist === "function") populateCustomerDatalist();
        if (typeof populateMergeDropdowns === "function") populateMergeDropdowns();
        renderCustomerManagement();
        input.value = '';
    } else {
        alert("Account key already exists.");
    }
}

function editCustomer(index) {
    const oldName = knownCustomers[index];
    const newName = prompt("Alter tracked profile allocation header string:", oldName);
    if (!newName || newName.trim() === "" || newName.trim() === oldName) return;
    
    const formattedName = newName.trim().replace(/\b\w/g, char => char.toUpperCase());
    if (knownCustomers.includes(formattedName) && formattedName !== oldName) {
        alert("Target token value collision identifier detected.");
        return;
    }
    
    knownCustomers[index] = formattedName;
    localStorage.setItem('knownCustomers', JSON.stringify(knownCustomers));
    
    currentDayLog.forEach(log => { if (log.customer === oldName) log.customer = formattedName; });
    localStorage.setItem('currentDayLog', JSON.stringify(currentDayLog));
    
    allTimeHistory.forEach(day => {
        if (day.detailedTimeline) {
            day.detailedTimeline.forEach(entry => { if (entry.customer === oldName) entry.customer = formattedName; });
        }
    });
    localStorage.setItem('allTimeHistory', JSON.stringify(allTimeHistory));
    
    if (typeof populateCustomerDatalist === "function") populateCustomerDatalist();
    if (typeof populateMergeDropdowns === "function") populateMergeDropdowns();
    renderCustomerManagement();
    renderLogs();
}

function deleteCustomer(index) {
    const targetName = knownCustomers[index];
    if (confirm(`Wipe "${targetName}" identity mapping block trace completely?`)) {
        knownCustomers.splice(index, 1);
        localStorage.setItem('knownCustomers', JSON.stringify(knownCustomers));
        
        if (typeof populateCustomerDatalist === "function") populateCustomerDatalist();
        if (typeof populateMergeDropdowns === "function") populateMergeDropdowns();
        renderCustomerManagement();
    }
}

function openCustomerModal() {
    const inputField = document.getElementById('cust-modal-name-input');
    const modal = document.getElementById('customer-name-modal');
    if (inputField && modal) {
        inputField.value = '';
        modal.style.display = 'flex';
        inputField.focus();
    }
}

function closeCustomerModal() { 
    const modal = document.getElementById('customer-name-modal');
    if (modal) modal.style.display = 'none'; 
}

function submitCustomerModal() {
    const inputElement = document.getElementById('cust-modal-name-input');
    if (!inputElement) return;
    
    const rawName = inputElement.value.trim();
    if (rawName === "") {
        alert("Valid identification matrix required.");
        return;
    }
    
    let finalName = "";
    const matchedName = findClosestCustomerName(rawName);
    if (matchedName) {
        finalName = matchedName;
    } else {
        finalName = rawName.replace(/\b\w/g, char => char.toUpperCase());
        knownCustomers.push(finalName);
        localStorage.setItem('knownCustomers', JSON.stringify(knownCustomers));
        if (typeof populateCustomerDatalist === "function") populateCustomerDatalist(); 
    }
    closeCustomerModal();
    executeTokenPrinting(finalName); 
}

// POS Grid Generator Blocks & Cart Actions
function renderCategoryFilters() {
    const container = document.getElementById('category-filter-container');
    if (!container) return;
    container.innerHTML = '';
    
    const categories = ["All", "Rice", "Curry", "Bread", "Others"];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-filter-btn ${currentActiveCategory === cat ? 'active' : ''}`;
        btn.innerText = cat;
        btn.onclick = () => {
            currentActiveCategory = cat;
            renderCategoryFilters();
            renderMenu();
        };
        container.appendChild(btn);
    });
}

function getItemCategory(itemName) {
    const found = customItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    return found ? found.category : "Others";
}

function getItemWeight(itemName) {
    const found = customItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    return found && found.weight ? parseFloat(found.weight) : 0;
}

function renderMenu() {
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    customItems.forEach((itemObj) => {
        if (currentActiveCategory !== "All" && itemObj.category !== currentActiveCategory) return;
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerText = itemObj.name;
        card.onclick = () => { addToCart(itemObj.name); };
        grid.appendChild(card);
    });
}

function addNewItem() {
    const nameInput = document.getElementById('new-item-name');
    const catSelect = document.getElementById('new-item-category');
    const weightInput = document.getElementById('new-item-weight');
    
    if (!nameInput || !catSelect || !weightInput) return;
    
    const name = nameInput.value.trim();
    const weight = parseInt(weightInput.value, 10) || 0;
    if (!name) return;
    
    customItems.push({ name: name, category: catSelect.value, weight: weight });
    localStorage.setItem('categorizedMenu', JSON.stringify(customItems));
    
    nameInput.value = '';
    weightInput.value = '';
    alert(`Successfully mapped item allocation array schema instance.`);
    
    renderMenu();
    renderMenuWeightsManagement();
}

function renderCart() {
    const container = document.getElementById('cart-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (Object.keys(currentCart).length === 0) {
        container.innerHTML = '<p style="color:#94a3b8; text-align:center; padding-top:45px; margin:0; font-size: 13px;">Queue Array Buffer Allocation Empty</p>';
        return;
    }
    
    for (let item in currentCart) {
        const div = document.createElement('div');
        div.className = 'cart-row';
        div.innerHTML = `
            <span style="font-weight: 600;">${item}</span>
            <div class="qty-controls">
                <button class="qty-btn" onclick="changeQty('${item}', -1)">-</button>
                <span style="font-weight:700; width:24px; text-align:center;">${currentCart[item]}</span>
                <button class="qty-btn" onclick="changeQty('${item}', 1)">+</button>
            </div>
        `;
        container.appendChild(div);
    }
}

function addToCart(item) { 
    currentCart[item] = (currentCart[item] || 0) + 1; 
    renderCart(); 
}

function changeQty(item, amount) { 
    if (!currentCart[item]) return;
    currentCart[item] += amount; 
    if (currentCart[item] <= 0) delete currentCart[item]; 
    renderCart();
}

// Live Vector Processing Engine
function updateLiveBreakdown() {
    const container = document.getElementById('live-total-container');
    if (!container) return;
    
    if (currentDayLog.length === 0 && currentRefundLog.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8; text-align:center; margin:0; font-size:13px;">Live operational transaction vectors empty.</p>';
        return;
    }
    
    let grossCount = 0; 
    let refundCount = 0; 
    let itemTotals = {};

    currentDayLog.forEach(log => { 
        grossCount += log.qty; 
        itemTotals[log.item] = (itemTotals[log.item] || 0) + log.qty; 
    });
    currentRefundLog.forEach(log => { 
        refundCount += log.qty; 
    });

    const rangeStr = shiftStartTime ? ` (Opened: ${shiftStartTime})` : '';
    let html = `
        <div style="font-size:13px; margin-bottom:12px; color:var(--text-muted);">
            <div style="font-size:11px; font-weight:700; color:var(--primary); margin-bottom:6px;">${rangeStr}</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Gross Generated Logs:</span><span style="font-weight:600; color:var(--text-main);">${grossCount + refundCount} Units</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:var(--danger);">
                <span>Liquidated Void Logs:</span><span style="font-weight:600;">-${refundCount} Units</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px solid var(--border); padding-top:6px; font-size:14px; color:var(--accent);">
                <span>Net Verified Shift Inventory:</span><span>${grossCount} Units</span>
            </div>
        </div>
        <div style="font-weight:700; font-size:11px; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px; border-bottom:1px solid var(--border); padding-bottom:4px;">Dynamic Mass Metrics Breakdown</div>
        <table style="width:100%; font-size:13px; color:var(--text-main); border-collapse:collapse;">
    `;

    const categoryOrder = ["Rice", "Curry", "Bread", "Others"];
    categoryOrder.forEach(cat => {
        let catHeaderAdded = false;
        for (let item in itemTotals) {
            if (getItemCategory(item) === cat) {
                if (!catHeaderAdded) {
                    html += `<tr><td colspan="2" style="font-size:11px; font-weight:800; color:var(--primary); padding:6px 0 2px 0; text-transform:uppercase;">${cat}</td></tr>`;
                    catHeaderAdded = true;
                }
                let calcWeightKg = ((itemTotals[item] * getItemWeight(item)) / 1000).toFixed(2);
                html += `<tr>
                    <td style="padding:2px 0 2px 8px; font-weight:500;">${item}</td>
                    <td style="text-align:right; font-weight:700; color:var(--text-main);">x${itemTotals[item]} <span style="font-size:11px; color:var(--text-muted); font-weight:normal;">(${calcWeightKg} KG)</span></td>
                </tr>`;
            }
        }
    });
    html += `</table>`;
    container.innerHTML = html;
}

function renderLogs() {
    const logBody = document.getElementById('live-log');
    if (!logBody) return;
    logBody.innerHTML = '';
    
    if (currentDayLog.length === 0) { 
        logBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px; font-size:13px;">No item array stream signals captured.</td></tr>`; 
    }
    
    for (let i = currentDayLog.length - 1; i >= 0; i--) {
        const log = currentDayLog[i];
        const customerDisplay = log.customer ? `<div style="font-size:11px; color:var(--primary); font-weight:700;">Profile Account: ${log.customer}</div>` : '';
        const itemWeightKg = ((log.qty * getItemWeight(log.item)) / 1000).toFixed(2);
        const row = `<tr>
            <td style="color:var(--text-muted); font-weight:500;">${log.time}</td>
            <td><div style="font-weight:600; color:var(--text-main);">${log.item}</div>${customerDisplay}</td>
            <td style="text-align:center; font-weight:700; color:var(--primary);">x${log.qty}<br><span style="font-size:10px; color:var(--text-muted); font-weight:normal;">${itemWeightKg} KG</span></td>
            <td style="text-align:center;"><button class="btn-action-small btn-refund" onclick="refundLogItem(${i})">Void</button></td>
        </tr>`;
        logBody.insertAdjacentHTML('beforeend', row);
    }

    const refundBody = document.getElementById('refund-log');
    if (!refundBody) return;
    refundBody.innerHTML = '';
    
    if (currentRefundLog.length === 0) { 
        refundBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:20px; font-size:13px;">No historical void signals logs generated.</td></tr>`; 
    }
    
    for (let j = currentRefundLog.length - 1; j >= 0; j--) {
        const rLog = currentRefundLog[j];
        const itemWeightKg = ((rLog.qty * getItemWeight(rLog.item)) / 1000).toFixed(2);
        const row = `<tr>
            <td style="color:var(--danger); font-weight:500;">${rLog.time}</td>
            <td style="font-weight:600; color:var(--text-muted); text-decoration: line-through;">${rLog.item}</td>
            <td style="text-align:center; font-weight:700; color:var(--danger);">x${rLog.qty}<br><span style="font-size:10px; font-weight:normal;">-${itemWeightKg} KG</span></td>
        </tr>`;
        refundBody.insertAdjacentHTML('beforeend', row);
    }

    updateLiveBreakdown();

    const histContainer = document.getElementById('history-container');
    if (!histContainer) return;
    histContainer.innerHTML = '';
    
    if (allTimeHistory.length === 0) { 
        histContainer.innerHTML = '<p style="color:#94a3b8; text-align:center; font-size:14px; padding-top:20px; width:100%;">Vault ledger history index empty array structure.</p>'; 
    }
    
    allTimeHistory.forEach((day, index) => {
        const normalizedDateLabel = normalizeToSystemDate(day.date);
        const rangeSuffix = (day.startTime && day.endTime) ? ` (${day.startTime} to ${day.endTime})` : '';

        let html = `<div class="history-card">
            <button class="delete-history-btn" onclick="deleteHistoryItem(${index})">×</button>
            <div class="history-header">
                <span>Date Scope Trace: <strong>${normalizedDateLabel}</strong></span>
                <span style="color:var(--primary); font-size:11px;">Timeline Boundary: <strong>${rangeSuffix || 'N/A'}</strong></span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:11px; color:var(--text-muted);">
                <span>Gross: ${day.grossItems || day.totalItems} | Voided: ${day.refundedItems || 0}</span>
                <span style="color:var(--accent); font-weight:bold;">Net Operational Sum: ${day.totalItems}</span>
            </div>
            <table style="width:100%; font-size:13px; color:#475569;">`;
        
        const categoryOrder = ["Rice", "Curry", "Bread", "Others"];
        categoryOrder.forEach(cat => {
            let catHeaderAdded = false;
            for (let itm in day.summary) {
                if (getItemCategory(itm) === cat) {
                    if (!catHeaderAdded) {
                        html += `<tr><td colspan="2" style="font-size:11px; font-weight:700; color:var(--primary); padding-top:6px; text-transform:uppercase;">${cat}</td></tr>`;
                        catHeaderAdded = true;
                    }
                    let histItemWeight = ((day.summary[itm] * getItemWeight(itm)) / 1000).toFixed(2);
                    html += `<tr><td style="padding:2px 0 2px 6px;">${itm}</td><td style="text-align:right; font-weight:600; color:var(--text-main);">x${day.summary[itm]} <span style="font-size:11px; font-weight:normal; color:var(--text-muted);">(${histItemWeight} KG)</span></td></tr>`;
                }
            }
        });
        html += `</table>`;
        
        if (day.detailedTimeline && day.detailedTimeline.length > 0) {
            html += `<div style="font-weight:700; font-size:11px; margin-top:12px; color:var(--text-muted); text-transform:uppercase; border-top: 1px dashed var(--border); padding-top: 8px;">Chronological Action Log Flow</div><div class="timeline-box">`;
            day.detailedTimeline.forEach(t => {
                const styleRule = t.type === 'REFUND' ? 'color:var(--danger); font-weight:700;' : 'color:var(--text-main);';
                const nameSuffix = t.customer ? ` (${t.customer})` : '';
                const wCalc = ((t.qty * getItemWeight(t.item)) / 1000).toFixed(2);
                html += `<div style="margin-bottom:4px; ${styleRule}">[${t.time}] ${t.type}: ${t.item}${nameSuffix} x${t.qty} (${wCalc} KG)</div>`;
            });
            html += `</div>`;
        }
        html += `<button class="print-report-btn" onclick="printSummaryReport(${index})">Generate Thermal Report</button></div>`;
        histContainer.insertAdjacentHTML('afterbegin', html);
    });
}

function refundLogItem(index) {
    if (!confirm("Execute target data structure mutation termination override script?")) return;
    
    if (typeof openPinModal === "function") {
        openPinModal("Verification authorization protocols requested.", "refund", function() {
            executeRefund(index);
        });
    } else {
        executeRefund(index);
    }
}

function executeRefund(index) {
    const now = new Date();
    const refundTime = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const targetItem = currentDayLog[index];
    
    const refundObject = { time: refundTime, item: targetItem.item, qty: targetItem.qty, customer: targetItem.customer || "Walk-In" };
    currentRefundLog.push(refundObject);
    localStorage.setItem('currentRefundLog', JSON.stringify(currentRefundLog));
    
    currentDayLog.splice(index, 1);
    localStorage.setItem('currentDayLog', JSON.stringify(currentDayLog));
    
    renderLogs();
    printSingleRefundToken(refundObject);
}

function printSingleRefundToken(refundObj) {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;
    printArea.innerHTML = '';
    
    const token = document.createElement('div');
    token.className = 'pos-token';
    const weightStr = ((refundObj.qty * getItemWeight(refundObj.item)) / 1000).toFixed(2);
    token.innerHTML = `
        <div class="brand-main">AHMED HANIF RAJPUT</div>
        <div style="font-size: 14px; font-weight: 900; text-align: center; color: #ffffff !important; background-color: #000000 !important; padding: 2px 0; margin: 4px 0;">[ VOID CANCEL ]</div>
        <div class="pos-divider"></div>
        <div class="item-container">
            <div class="pos-item" style="text-decoration: line-through;">${refundObj.item}</div>
            <div class="pos-qty">TERMINATED: [ ${refundObj.qty} ]</div>
            <div style="font-weight:900; font-size:14px; margin-top:4px;">-${weightStr} KG</div>
        </div>
        <div class="pos-divider"></div>
        <div class="meta-line">DATE: ${getFormattedSystemDate()} &nbsp;&nbsp;&nbsp;&nbsp; TIME: ${refundObj.time}</div>
    `;
    printArea.appendChild(token);
    setTimeout(() => { window.print(); printArea.innerHTML = ''; }, 50);
}

function printSummaryReport(index) {
    const day = allTimeHistory[index];
    const printArea = document.getElementById('print-area');
    if (!day || !printArea) return;
    printArea.innerHTML = '';
    
    let topItem = "None"; 
    let maxQty = 0;
    for (let itm in day.summary) { 
        if (day.summary[itm] > maxQty) { 
            maxQty = day.summary[itm]; 
            topItem = itm; 
        } 
    }
    
    const reportDiv = document.createElement('div');
    reportDiv.className = 'pos-report';
    let itemsHtml = '';
    const categoryOrder = ["Rice", "Curry", "Bread", "Others"];
    
    categoryOrder.forEach(cat => {
        let catHeaderPrinted = false;
        for (let itm in day.summary) {
            if (getItemCategory(itm) === cat) {
                if (!catHeaderPrinted) {
                    itemsHtml += `<div class="report-category-header">${cat}</div>`;
                    catHeaderPrinted = true;
                }
                let wStr = ((day.summary[itm] * getItemWeight(itm)) / 1000).toFixed(2);
                itemsHtml += `<div class="report-row"><span>&nbsp;&nbsp;${itm.toUpperCase()}</span><span>x${day.summary[itm]} (${wStr} KG)</span></div>`;
            }
        }
    });
    
    const timeRangeTitle = (day.startTime && day.endTime) ? `${day.startTime} TO ${day.endTime}` : 'SHIFT REPORT';
    reportDiv.innerHTML = `
        <div class="brand-main">AHMED HANIF RAJPUT</div>
        <div class="report-title">SHIFT ANALYSIS METRICS</div>
        <div class="meta-line">DATE: ${normalizeToSystemDate(day.date)}</div>
        <div class="meta-line">SHIFT BLOCK: ${timeRangeTitle}</div>
        <div class="pos-divider"></div>
        <div class="report-row"><span>GROSS EMITTED:</span><span>${day.grossItems || day.totalItems} Units</span></div>
        <div class="report-row"><span>VOIDED EXECUTIONS:</span><span>${day.refundedItems || 0} Units</span></div>
        <div class="report-row" style="border-top:2px solid #000000 !important; padding-top:4px;"><span>NET INVENTORY TOTAL:</span><span>${day.totalItems} Units</span></div>
        <div class="pos-divider-thin"></div>
        <div style="font-size:11px; font-weight:900; margin-bottom:4px; text-align:center; text-transform:uppercase;">Dynamic Net Mass Quantization</div>
        ${itemsHtml}
        <div class="pos-divider-thin" style="margin-top:6px;"></div>
        <div class="highlight-box">
            <div style="font-size: 11px; font-weight: 900;">MAX ACCUMULATED VOLUME</div>
            <div style="font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 2px 0;">${topItem}</div>
            <div style="font-size: 12px; font-weight: 900;">Units count: ${maxQty}</div>
        </div>
        <div class="pos-divider"></div>
    `;
    printArea.appendChild(reportDiv);
    setTimeout(() => { window.print(); printArea.innerHTML = ''; }, 50);
}

function printTokens() {
    if (Object.keys(currentCart).length === 0) return;
    openCustomerModal();
}

function executeTokenPrinting(customerName) {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;
    printArea.innerHTML = ''; 
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateStr = getFormattedSystemDate(now);

    if (!shiftStartTime) {
        shiftStartTime = timeStr;
        localStorage.setItem('shiftStartTime', shiftStartTime);
    }

    for (let item in currentCart) {
        const qty = currentCart[item];
        currentDayLog.push({ time: timeStr, item: item, qty: qty, customer: customerName });
        
        const token = document.createElement('div');
        token.className = 'pos-token';
        token.innerHTML = `
            <div class="brand-main">AHMED HANIF RAJPUT</div>
            <div class="pos-divider"></div>
            <div class="item-container">
                <div class="pos-item">${item}</div>
                <div class="pos-qty">UNITS COUNT: [ ${qty} ]</div>
            </div>
            <div class="pos-divider"></div>
            <div class="meta-line">DATE: ${dateStr} &nbsp;&nbsp;&nbsp;&nbsp; TIME: ${timeStr}</div>
            <div style="font-size:12px; font-weight:900; margin-top:4px; text-transform:uppercase;">ACCOUNT MAPPING: ${customerName}</div>
        `;
        printArea.appendChild(token);
    }
    localStorage.setItem('currentDayLog', JSON.stringify(currentDayLog));
    setTimeout(() => { 
        window.print(); 
        currentCart = {}; 
        renderCart(); 
        renderLogs(); 
    }, 50);
}

function deleteHistoryItem(index) {
    if (!confirm("Permanently drop selected ledger sequence index container?")) return;
    
    if (typeof openPinModal === "function") {
        openPinModal("Management authentication validation parameters active.", "admin", function() {
            allTimeHistory.splice(index, 1);
            localStorage.setItem('allTimeHistory', JSON.stringify(allTimeHistory));
            renderLogs();
        });
    } else {
        allTimeHistory.splice(index, 1);
        localStorage.setItem('allTimeHistory', JSON.stringify(allTimeHistory));
        renderLogs();
    }
}

function clearAllHistory() {
    if (!confirm("Purge entire core relational historical index architecture? Warning: Action is terminal.")) return;
    
    if (typeof openPinModal === "function") {
        openPinModal("Administrative security credentials requested.", "admin", function() {
            allTimeHistory = [];
            localStorage.setItem('allTimeHistory', JSON.stringify(allTimeHistory));
            renderLogs();
        });
    } else {
        allTimeHistory = [];
        localStorage.setItem('allTimeHistory', JSON.stringify(allTimeHistory));
        renderLogs();
    }
}

function attemptStartNewDay() {
    if (typeof openPinModal === "function") {
        openPinModal("Enter Mandatory Master Access Code to Open New Day Block", "admin", function() {
            startNewDay();
            alert("New operational tracking register open.");
        });
    } else {
        startNewDay();
    }
}

function startNewDay() {
    currentDayLog = []; 
    currentRefundLog = []; 
    shiftStartTime = null;
    
    localStorage.removeItem('currentDayLog'); 
    localStorage.removeItem('currentRefundLog'); 
    localStorage.removeItem('shiftStartTime');
    
    currentCart = {}; 
    renderCart(); 
    renderLogs(); 
    if (typeof switchView === "function") switchView('pos-tab');
}

function endDay() {
    if (currentDayLog.length === 0 && currentRefundLog.length === 0) {
        return alert("System state queue registry matrices isolated as null.");
    }
    if (!confirm("Terminate current operational runtime cycle window parameters and shift dataset structures?")) return;
    
    if (typeof openPinModal === "function") {
        openPinModal("Administrative security checkpoint logic verified execution keys.", "admin", function() {
            processEndDay();
        });
    } else {
        processEndDay();
    }
}

function processEndDay() {
    let netItems = 0; 
    let grossItemsCount = 0; 
    let summary = {}; 
    let detailedTimeline = [];

    currentDayLog.forEach(log => { 
        netItems += log.qty; 
        grossItemsCount += log.qty;
        summary[log.item] = (summary[log.item] || 0) + log.qty; 
        detailedTimeline.push({time: log.time, type: 'SALE', item: log.item, qty: log.qty, customer: log.customer});
    });
    
    currentRefundLog.forEach(log => {
        grossItemsCount += log.qty;
        detailedTimeline.push({time: log.time, type: 'REFUND', item: log.item, qty: log.qty, customer: log.customer || "Walk-In"});
    });
    
    detailedTimeline.sort((a, b) => b.time.localeCompare(a.time));
    
    const shiftClosingTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const shiftOpeningTime = shiftStartTime || (currentDayLog.length > 0 ? currentDayLog[0].time : shiftClosingTime);
    const shiftClosingTimestamp = getFormattedSystemDate();
    
    const dayRecord = { 
        date: shiftClosingTimestamp, 
        startTime: shiftOpeningTime,
        endTime: shiftClosingTime,
        totalItems: netItems, 
        grossItems: grossItemsCount,
        refundedItems: currentRefundLog.length, 
        summary: summary, 
        detailedTimeline: detailedTimeline
    };
    allTimeHistory.push(dayRecord);
    localStorage.setItem('allTimeHistory', JSON.stringify(allTimeHistory));
    
    currentDayLog = []; 
    currentRefundLog = []; 
    shiftStartTime = null;
    
    localStorage.removeItem('currentDayLog'); 
    localStorage.removeItem('currentRefundLog'); 
    localStorage.removeItem('shiftStartTime');
    
    renderLogs();
    if (typeof switchView === "function") switchView('history-tab');
}

function getAllConsumptionData() {
    const rows = [];
    const liveLabel = getFormattedSystemDate();
    
    currentDayLog.forEach(l => {
        rows.push({ date: liveLabel, shiftId: "LIVE", time: l.time, customer: l.customer || "Walk-In", item: l.item, qty: l.qty, type: "SALE" });
    });
    currentRefundLog.forEach(r => {
        rows.push({ date: liveLabel, shiftId: "LIVE", time: r.time, customer: r.customer || "Walk-In", item: r.item, qty: r.qty, type: "REFUND" });
    });
    allTimeHistory.forEach((day, idx) => {
        if (day.detailedTimeline) {
            day.detailedTimeline.forEach(t => {
                const rangeStr = (day.startTime && day.endTime) ? ` [${day.startTime}-${day.endTime}]` : '';
                rows.push({ date: normalizeToSystemDate(day.date) + rangeStr, shiftId: `SHIFT-${idx}`, time: t.time, customer: t.customer || "Walk-In", item: t.item, qty: t.qty, type: t.type });
            });
        }
    });
    return rows;
}

function populateFilterOptions() {
    const data = getAllConsumptionData();
    const customers = new Set(); 
    const items = new Set(); 
    const dates = new Set();
    
    data.forEach(r => {
        if (r.customer) customers.add(r.customer);
        if (r.item) items.add(r.item);
        if (r.date) dates.add(r.date);
    });
    
    const custSel = document.getElementById('filter-cust');
    const itemSel = document.getElementById('filter-item');
    const dateSel = document.getElementById('filter-date');
    
    if (custSel) {
        custSel.innerHTML = '<option value="ALL">-- All Registry Profiles --</option>';
        customers.forEach(c => custSel.innerHTML += `<option value="${c}">${c}</option>`);
    }
    if (itemSel) {
        itemSel.innerHTML = '<option value="ALL">-- All Menu Labels --</option>';
        items.forEach(i => itemSel.innerHTML += `<option value="${i}">${i}</option>`);
    }
    if (dateSel) {
        dateSel.innerHTML = '<option value="ALL">-- All Epoch Shifts --</option>';
        dates.forEach(d => dateSel.innerHTML += `<option value="${d}">${d}</option>`);
    }
}

function populateShiftSelectorOptions() {
    const selector = document.getElementById('rule-shift-selector');
    if (!selector) return;
    const currentSelection = selector.value;
    
    const liveRange = shiftStartTime ? ` (Opened: ${shiftStartTime})` : ' (Matrix structural space null)';
    selector.innerHTML = `<option value="LIVE">Active Operational Runtime Engine Segment${liveRange}</option>`;
    
    allTimeHistory.forEach((day, idx) => {
        const label = normalizeToSystemDate(day.date);
        const timeStr = (day.startTime && day.endTime) ? ` (${day.startTime} to ${day.endTime})` : '';
        selector.innerHTML += `<option value="SHIFT-${idx}">Ledger Segment: ${label}${timeStr}</option>`;
    });

    if (currentSelection && selector.querySelector(`option[value="${currentSelection}"]`)) {
        selector.value = currentSelection;
    } else {
        selector.value = "LIVE";
    }
}

function calculateHighConsumptionMatrix(data) {
    const shiftSelector = document.getElementById('rule-shift-selector');
    const tbody = document.getElementById('high-consumption-tbody');
    if (!shiftSelector || !tbody) return;

    const selectedShift = shiftSelector.value;
    const riceVal = document.getElementById('rule-rice-limit').value.trim();
    const curryVal = document.getElementById('rule-curry-limit').value.trim();
    const breadVal = document.getElementById('rule-bread-limit').value.trim();

    const riceLimit = riceVal !== "" ? parseInt(riceVal, 10) : null;
    const curryLimit = curryVal !== "" ? parseInt(curryVal, 10) : null;
    const breadLimit = breadVal !== "" ? parseInt(breadVal, 10) : null;

    const aggregation = {};
    
    data.forEach(r => {
        if (r.shiftId !== selectedShift) return;
        if (r.type !== 'SALE' || r.customer === 'Walk-In') return;
        
        const cat = getItemCategory(r.item);
        const key = `${r.customer}||${r.item}||${cat}`;
        aggregation[key] = (aggregation[key] || 0) + r.qty;
    });
    
    tbody.innerHTML = '';
    let anomaliesFound = false;

    for (let key in aggregation) {
        const [customer, item, category] = key.split('||');
        const totalQty = aggregation[key];
        let shouldFlag = false; 
        let alertMsg = "";
        const calculatedW = ((totalQty * getItemWeight(item)) / 1000).toFixed(2);

        if (category === "Rice" && riceLimit !== null && totalQty >= riceLimit) {
            shouldFlag = true;
            alertMsg = `Rice Limit Breach Alert (≥ ${riceLimit} Units)`;
        } else if (category === "Curry" && curryLimit !== null && totalQty >= curryLimit) {
            shouldFlag = true;
            alertMsg = `Curry Threshold Flagged Trigger (≥ ${curryLimit} Orders)`;
        } else if (category === "Bread" && breadLimit !== null && totalQty >= breadLimit) {
            shouldFlag = true;
            alertMsg = `Bulk Unit Bread Overflow Logic (≥ ${breadLimit} Pieces)`;
        }
        
        if (shouldFlag) {
            anomaliesFound = true;
            const tr = `<tr>
                <td style="font-weight:700; color:var(--text-main);">${customer}</td>
                <td>${item}</td>
                <td style="font-weight:600; color:var(--primary);">${category}</td>
                <td style="text-align:right; font-weight:800; color:var(--danger);">x${totalQty}</td>
                <td style="text-align:right; font-weight:800;">${calculatedW} KG</td>
                <td><span class="flag-pill flag-high">⚠️ ${alertMsg}</span></td>
            </tr>`;
            tbody.insertAdjacentHTML('beforeend', tr);
        }
    }
    if (!anomaliesFound) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px; font-size:13px;">No critical boundary tracking triggers flagged. System context baseline stable.</td></tr>`;
    }
}

function renderConsumptionReport() {
    const data = getAllConsumptionData();
    calculateHighConsumptionMatrix(data);
    
    const custFilter = document.getElementById('filter-cust');
    const itemFilter = document.getElementById('filter-item');
    const dateFilter = document.getElementById('filter-date');
    const tbody = document.getElementById('consumption-report-tbody');
    
    if (!custFilter || !itemFilter || !dateFilter || !tbody) return;
    
    const fCust = custFilter.value;
    const fItem = itemFilter.value;
    const fDate = dateFilter.value;
    tbody.innerHTML = '';

    const filtered = data.filter(r => {
        if (fCust !== "ALL" && r.customer !== fCust) return false;
        if (fItem !== "ALL" && r.item !== fItem) return false;
        if (fDate !== "ALL" && r.date !== fDate) return false;
        return true;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px; font-size:13px;">No ledger entries matched filter constraint attributes.</td></tr>`;
        return;
    }
    
    filtered.forEach(r => {
        const statusStyle = r.type === 'REFUND' ? 'color:var(--danger); font-weight:700; background:#fee2e2; padding:4px 8px; border-radius:4px;' : 'color:var(--accent); font-weight:700; background:#dcfce7; padding:4px 8px; border-radius:4px;';
        const qtyStyle = r.type === 'REFUND' ? 'color:var(--danger); font-weight:700; text-align:right;' : 'font-weight:700; text-align:right;';
        const displayQty = r.type === 'REFUND' ? `-${r.qty}` : r.qty;
        const calcWeightKg = ((r.qty * getItemWeight(r.item)) / 1000).toFixed(2);
        const displayWeight = r.type === 'REFUND' ? `-${calcWeightKg}` : calcWeightKg;
        const dateTimeDisplay = `${r.date}, ${r.time || 'N/A'}`;

        const tr = `<tr>
            <td style="font-weight: 500; color: var(--text-muted);">${dateTimeDisplay}</td>
            <td style="font-weight:600;">${r.customer}</td>
            <td>${r.item}</td>
            <td style="${qtyStyle}">${displayQty}</td>
            <td style="text-align:right; font-weight:600;">${displayWeight} KG</td>
            <td><span style="${statusStyle}">${r.type}</span></td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', tr);
    });
}

function handleCustomerSearchFilter() {
    const searchInput = document.getElementById('customer-search-input');
    if (!searchInput) return;
    activeCustomerSearchQuery = searchInput.value.trim().toLowerCase();
    if (typeof renderCustomerManagement === "function") renderCustomerManagement();
}

function clearConsumptionFilters() {
    const custFilter = document.getElementById('filter-cust');
    const itemFilter = document.getElementById('filter-item');
    const dateFilter = document.getElementById('filter-date');
    
    if (custFilter) custFilter.value = "ALL";
    if (itemFilter) itemFilter.value = "ALL";
    if (dateFilter) dateFilter.value = "ALL";
    
    renderConsumptionReport();
}

function exportConsumptionToCSV() {
    const data = getAllConsumptionData();
    if (data.length === 0) return alert("Structural target storage layer empty.");
    
    let csvContent = "data:text/csv;charset=utf-8,Timestamp Block Node,Profile Mapping ID,Menu Label,Quantity Scalar,Retroactive Weight Metric(KG),State Vector\n";
    data.forEach(r => {
        const val = r.type === 'REFUND' ? `-${r.qty}` : r.qty;
        const wVal = ((r.qty * getItemWeight(r.item)) / 1000).toFixed(2);
        const wStr = r.type === 'REFUND' ? `-${wVal}` : wVal;
        csvContent += `"${r.date}, ${r.time || 'N/A'}","${r.customer}","${r.item}",${val},${wStr},"${r.type}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shift_Matrix_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Operational DOM Global Event Key Bindings UI Hooks Initialization Block
document.addEventListener("DOMContentLoaded", () => {
    const modalPinInput = document.getElementById('modal-pin-input');
    if (modalPinInput) {
        modalPinInput.addEventListener('keypress', function(e) { 
            if (e.key === 'Enter' && typeof submitPinModal === "function") submitPinModal(); 
        });
    }

    const custModalInput = document.getElementById('cust-modal-name-input');
    if (custModalInput) {
        custModalInput.addEventListener('keypress', function(e) { 
            if (e.key === 'Enter') submitCustomerModal(); 
        });
    }

    const manualCustomerInput = document.getElementById('new-manual-customer');
    if (manualCustomerInput) {
        manualCustomerInput.addEventListener('keypress', function(e) { 
            if (e.key === 'Enter') addCustomerManually(); 
        });
    }

    // Bootstrap Initial Runtime Startup Sequence Loop Triggers
    renderCategoryFilters();
    renderMenu();
    renderLogs();
    
    if (typeof populateCustomerDatalist === "function") populateCustomerDatalist();
});
