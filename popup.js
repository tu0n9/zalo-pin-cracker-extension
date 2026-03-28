// Các thành phần UI
const toggleManualBtn = document.getElementById('toggleManualBtn');
const manualInputArea = document.getElementById('manualInputArea');
const resultDiv = document.getElementById('result');
const pinDisplay = document.getElementById('pinDisplay');
const pinBoxes = [
    document.getElementById('pin0'),
    document.getElementById('pin1'),
    document.getElementById('pin2'),
    document.getElementById('pin3')
];

// Nút bật/tắt chế độ nhập tay
toggleManualBtn.addEventListener('click', () => {
    if (manualInputArea.style.display === 'none' || manualInputArea.style.display === '') {
        manualInputArea.style.display = 'block';
        toggleManualBtn.innerText = '> hide_manual_mode';
    } else {
        manualInputArea.style.display = 'none';
        toggleManualBtn.innerText = '> manual_input_mode';
    }
});

// Hàm dùng chung để xử lý logic Brute-force
// Đã thêm tham số targetKey để nhận tên Key từ localStorage
function startCracking(targetHash, targetKey = "manual_input") {
    pinDisplay.style.display = 'none'; 

    const startTime = performance.now();

    for (let i = 0; i < 10000; i++) {
        let pin = i.toString().padStart(4, '0');
        
        try {
            if (md5(pin) === targetHash) {
                const endTime = performance.now();
                
                // Xây dựng bảng kết quả hiển thị TẤT CẢ thông tin khi hoàn thành
                let finalHTML = `<span class="success-text">SUCCESS</span> <span class="laser-tick">✔</span><br>`;
                
                // Căn lề trái cho giống Terminal log
                finalHTML += `<div style="text-align: left; margin-top: 10px; font-size: 11px; color: #00ff00; line-height: 1.5; border-top: 1px dashed #333; padding-top: 5px;">`;
                
                if (targetKey !== "manual_input") {
                    finalHTML += `TARGET_KEY : [${targetKey}]<br>`;
                } else {
                    finalHTML += `MODE       : [MANUAL_ENTRY]<br>`;
                }
                
                // Hiển thị nguyên vẹn 32 ký tự của Hash thay vì cắt bớt, vì đằng nào nó cũng nằm ở cuối
                finalHTML += `TARGET_HASH: <br><span style="color:#00ffff">${targetHash}</span><br>`;
                finalHTML += `CRACK_TIME : ${(endTime - startTime).toFixed(2)} ms`;
                finalHTML += `</div>`;
                
                resultDiv.innerHTML = finalHTML;
                
                // Cắt 4 số ném vào 4 ô vuông và cho hiển thị
                pinDisplay.style.display = 'flex';
                for (let j = 0; j < 4; j++) {
                    pinBoxes[j].innerText = pin[j];
                }
                return;
            }
        } catch (error) {
            resultDiv.style.color = "#ff3333";
            resultDiv.innerText = "[-] Error: Library md5.js is missing!";
            console.error(error);
            return;
        }
    }
    
    resultDiv.style.color = "#ff3333";
    resultDiv.innerText = "[-] FAILED: Hash does not match any 4-digit PIN.";
}

// Xử lý khi ấn nút "execute_brute_force" (Nhập tay)
document.getElementById('crackBtn').addEventListener('click', () => {
    const targetHash = document.getElementById('hashInput').value.trim().toLowerCase();
    if (targetHash.length !== 32) {
        resultDiv.style.color = "#ff3333";
        resultDiv.innerText = "[-] Error: Target must be 32 chars.";
        return;
    }
    resultDiv.style.color = "#00ffff";
    resultDiv.innerText = "[*] Executing manual payload...";
    
    // Tạo độ trễ nhỏ để giao diện kịp render chữ Executing
    setTimeout(() => {
        startCracking(targetHash);
    }, 100);
});

// Xử lý khi ấn nút "auto_extract_hash"
document.getElementById('autoGetBtn').addEventListener('click', async () => {
    manualInputArea.style.display = 'none';
    toggleManualBtn.innerText = '> manual_input_mode';

    resultDiv.style.color = "#00ffff";
    resultDiv.innerText = "[*] Injecting script & scanning storage...";
    pinDisplay.style.display = 'none';

    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getHashFromLocalStorage,
        }, (results) => {
            if (results && results[0] && results[0].result) {
                let targetData = results[0].result;
                let foundKey = targetData.key;
                let foundHash = targetData.value;
                
                // Rút ngắn thời gian delay xuống, vì đằng nào kết quả cuối cũng in ra Key/Hash
                setTimeout(() => {
                    // Truyền thêm foundKey vào hàm để in ra bảng kết quả
                    startCracking(foundHash, foundKey);
                }, 300);
                
            } else {
                resultDiv.style.color = "#ff3333";
                resultDiv.innerText = "[-] No valid target (32-char MD5) found in current tab.";
                pinDisplay.style.display = 'none';
            }
        });
    } catch (err) {
        resultDiv.style.color = "#ff3333";
        resultDiv.innerText = "[-] Error accessing tab. Target must be a real webpage.";
    }
});

// Hàm chạy ngầm dưới website
function getHashFromLocalStorage() {
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        if (value && value.length === 32) {
            return { key: key, value: value }; 
        }
    }
    return null; 
}