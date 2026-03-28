// ==========================================
// 1. PHẦN MỚI: TỰ ĐỘNG HÚT HASH TỪ TRANG WEB
// ==========================================
document.getElementById('autoGetBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getHashFromLocalStorage,
    }, (results) => {
        const resultDiv = document.getElementById('result');
        if (results && results[0] && results[0].result) {
            let foundHash = results[0].result;
            
            document.getElementById('hashInput').value = foundHash;
            resultDiv.style.color = "blue";
            resultDiv.innerText = `[+] Đã hút được hash: ${foundHash}\n[*] Đang tự động giải mã...`;
            
            // Kích hoạt nút "Bắt đầu quét" sau 0.5 giây
            setTimeout(() => {
                document.getElementById('crackBtn').click();
            }, 500);
            
        } else {
            resultDiv.style.color = "red";
            resultDiv.innerText = "[-] Không tìm thấy mã MD5 nào (32 ký tự) trong localStorage của trang này.";
        }
    });
});

function getHashFromLocalStorage() {
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        if (value && value.length === 32) {
            return value; 
        }
    }
    return null; 
}

// ==========================================
// 2. PHẦN CŨ: VÒNG LẶP BRUTE-FORCE 0000-9999
// ==========================================
document.getElementById('crackBtn').addEventListener('click', () => {
    const targetHash = document.getElementById('hashInput').value.trim().toLowerCase();
    const resultDiv = document.getElementById('result');
    
    if (targetHash.length !== 32) {
        resultDiv.style.color = "red";
        resultDiv.innerText = "Lỗi: Vui lòng nhập mã MD5 hợp lệ (32 ký tự).";
        return;
    }

    // Nếu chạy đến đây thì dòng chữ trên giao diện phải đổi
    resultDiv.style.color = "blue";
    resultDiv.innerText = "[*] Đang quét cạn kiệt...";
    
    const startTime = performance.now();

    for (let i = 0; i < 10000; i++) {
        let pin = i.toString().padStart(4, '0');
        
        try {
            let hashedPin = md5(pin); 

            if (hashedPin === targetHash) {
                const endTime = performance.now();
                resultDiv.style.color = "green";
                resultDiv.innerText = `[+] THÀNH CÔNG!\nMã PIN gốc: ${pin}\nThời gian: ${(endTime - startTime).toFixed(2)} ms`;
                return;
            }
        } catch (error) {
            // Bắt lỗi nếu file md5.js chưa được nạp thành công
            resultDiv.style.color = "red";
            resultDiv.innerText = "[-] Lỗi nghiêm trọng: Hàm md5() không tồn tại. Hãy kiểm tra lại file md5.js và thứ tự thẻ script trong popup.html!";
            console.error(error);
            return;
        }
    }
    
    resultDiv.style.color = "red";
    resultDiv.innerText = "[-] Thất bại: Không tìm thấy mã PIN nào khớp.";
});