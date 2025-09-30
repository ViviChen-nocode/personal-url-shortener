const API_BASE = 'https://go.yourdomain.com';
const API_SECRET = 'YOUR_API_SECRET_HERE'; // 替換成你剛才設定的值

// 取得當前分頁 URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentUrl = tabs[0].url;
  document.getElementById('currentUrl').textContent = currentUrl;
  
  // 儲存到全域變數供後續使用
  window.currentPageUrl = currentUrl;
});

// 建立短網址
document.getElementById('createBtn').addEventListener('click', async () => {
  const btn = document.getElementById('createBtn');
  const aliasInput = document.getElementById('alias');
  const resultDiv = document.getElementById('result');
  
  const longUrl = window.currentPageUrl;
  const alias = aliasInput.value.trim();
  
  if (!longUrl) {
    showResult('無法取得當前頁面網址', 'error');
    return;
  }
  
  // 停用按鈕
  btn.disabled = true;
  btn.textContent = '建立中...';
  resultDiv.style.display = 'none';
  
  try {
    const payload = { longUrl };
    if (alias) payload.alias = alias;
    
    const response = await fetch(`${API_BASE}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': API_SECRET
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // 成功 - 複製到剪貼簿
      await navigator.clipboard.writeText(result.shortUrl);
      showResult(`短網址已建立並複製到剪貼簿！<div class="short-url">${result.shortUrl}</div>`, 'success');
      
      // 清空輸入框
      aliasInput.value = '';
    } else {
      showResult(`建立失敗: ${result.error}`, 'error');
    }
    
  } catch (error) {
    showResult(`錯誤: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '建立短網址';
  }
});

// 顯示結果
function showResult(message, type) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = message;
  resultDiv.className = `result ${type}`;
  resultDiv.style.display = 'block';
}

// Enter 鍵快速建立
document.getElementById('alias').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('createBtn').click();
  }
});