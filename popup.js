document.getElementById('crackBtn').addEventListener('click', () => {
    const targetHash = document.getElementById('hashInput').value.trim().toLowerCase();
    const resultDiv = document.getElementById('result');
    
    // Kiểm tra độ dài cơ bản của MD5
    if (targetHash.length !== 32) {
        resultDiv.style.color = "red";
        resultDiv.innerText = "Lỗi: Vui lòng nhập mã MD5 hợp lệ (32 ký tự).";
        return;
    }

    resultDiv.style.color = "blue";
    resultDiv.innerText = "[*] Đang quét cạn kiệt...";
    
    // Đo thời gian thực thi trên trình duyệt
    const startTime = performance.now();

    // Vòng lặp Brute-force
    for (let i = 0; i < 10000; i++) {
        // Ép kiểu số thành chuỗi và thêm số 0 cho đủ 4 ký tự (VD: 1 -> "0001")
        let pin = i.toString().padStart(4, '0');
        
        // Gọi hàm md5 từ file md5.js đã import ở HTML
        let hashedPin = md5(pin); 

        if (hashedPin === targetHash) {
            const endTime = performance.now();
            resultDiv.style.color = "green";
            resultDiv.innerText = `[+] THÀNH CÔNG!\nMã PIN gốc: ${pin}\nThời gian: ${(endTime - startTime).toFixed(2)} ms`;
            return;
        }
    }
    
    resultDiv.style.color = "red";
    resultDiv.innerText = "[-] Không tìm thấy mã PIN nào khớp trong khoảng 0000-9999.";
});