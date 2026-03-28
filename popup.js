// Sự kiện khi bấm nút "Tự động lấy Hash"
document.getElementById('autoGetBtn').addEventListener('click', async () => {
    // 1. Xác định tab trang web bạn đang mở
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. Tiêm hàm getHashFromLocalStorage vào trang web đó để chạy
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getHashFromLocalStorage,
    }, (results) => {
        // 3. Nhận kết quả trả về từ trang web
        const resultDiv = document.getElementById('result');
        if (results && results[0] && results[0].result) {
            let foundHash = results[0].result;
            
            // Điền luôn vào ô input
            document.getElementById('hashInput').value = foundHash;
            
            resultDiv.style.color = "blue";
            resultDiv.innerText = `[+] Đã hút được hash: ${foundHash}\n[*] Đang tự động giải mã...`;
            
            // Tự động kích hoạt luôn nút "Bắt đầu quét" (đoạn code bạn viết lúc trước)
            setTimeout(() => {
                document.getElementById('crackBtn').click();
            }, 500);
            
        } else {
            resultDiv.style.color = "red";
            resultDiv.innerText = "[-] Không tìm thấy mã MD5 nào (32 ký tự) trong localStorage của trang này.";
        }
    });
});

// Hàm này sẽ được "tiêm" vào ngữ cảnh của trang web (Web Context)
// Nó không được phép gọi các hàm bên ngoài popup.js
function getHashFromLocalStorage() {
    // Quét toàn bộ localStorage
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        
        // Logic nhận diện: Giả sử cứ chuỗi nào dài đúng 32 ký tự thì nghi ngờ là MD5 hash
        if (value && value.length === 32) {
            return value; // Gửi chuỗi này về cho Extension
        }
    }
    return null; // Không tìm thấy
}