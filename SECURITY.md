# 安全建議

本系統設計為私人使用,以下是重要的安全建議和最佳實踐。

## 核心安全原則

### 1. 保護你的 API Secret

**最重要的安全措施**

- ✅ 使用強密碼(32+ 字元,包含大小寫、數字、符號)
- ✅ 定期更換(建議每 3-6 個月)
- ✅ 使用環境變數或 Script Properties,不要寫死在程式碼
- ❌ 不要在 GitHub commit 中包含真實的 Secret
- ❌ 不要在截圖或文件中露出 Secret
- ❌ 不要分享給任何人

**如果 API Secret 洩漏:**
1. 立即在 Cloudflare Worker 更換新的 Secret
2. 更新所有使用該 Secret 的地方(Chrome 擴充、Google Sheets)
3. 檢查 Cloudflare 日誌,確認是否有異常流量

### 2. 保護你的 Worker 網址

**風險:**
如果有人知道你的短網址網域(如 `go.yourdomain.com`),他們可能猜測 API 端點存在。

**防護措施:**
- Worker 已有 API Secret 驗證,即使知道網址也無法濫用
- 避免在公開場合分享你的短網址網域
- 考慮使用不明顯的子網域名稱

### 3. 限制存取權限

**Google Sheets:**
- 不要分享給其他人(即使只是檢視權限)
- 如果需要分享,使用者複製後看不到 Script Properties
- 但能看到 Apps Script 程式碼結構

**Chrome 擴充:**
- 不要分享 `.crx` 安裝檔給他人
- 不要將包含真實 Secret 的版本上傳到 Chrome 商店

**Web App:**
- 部署時選擇「僅限我自己」
- 不要分享 Web App URL

---

## 監控與應對

### 定期檢查

**每週檢查一次:**
1. Cloudflare Dashboard → Workers → 查看請求數量
2. 確認沒有異常的流量峰值
3. 檢查 Google Sheets Log 表,確認所有記錄都是你建立的

**異常指標:**
- 短時間內大量 API 請求
- Log 中出現不認識的短網址
- Cloudflare 顯示來自陌生 IP 的大量請求

### 應對措施

**如果發現異常:**

1. **立即更換 API Secret**
   - Cloudflare: Workers → 設定 → 環境變數
   - Google Sheets: Script Properties
   - Chrome 擴充: 修改 `popup.js`

2. **檢查 KV 資料**
   - Cloudflare Dashboard → KV → 查看 `url-shortener-links`
   - 刪除可疑的短網址

3. **暫時停用 Worker**
   - 如果流量失控,可以暫時移除 Workers 路由

---

## Cloudflare 免費方案限制

**配額:**
- 每天 100,000 次請求
- KV 讀取:每天 100,000 次
- KV 寫入:每天 1,000 次

**如果超出配額:**
- Worker 會暫時停止服務
- 隔天自動恢復
- 考慮升級到付費方案($5/月)

---

## 資料備份

**重要:** KV 資料不會自動備份

**建議做法:**

### 方案 1: 手動導出(簡單)
定期在 Cloudflare Dashboard 手動匯出 KV 資料。

### 方案 2: 定期同步到 Google Sheets(進階)
可以建立一個 Apps Script 定時任務:
- 每天從 Worker API 讀取所有短網址
- 更新到 Google Sheets
- Google Sheets 有版本歷史,可以還原

### 方案 3: 導出為 JSON(最安全)
```javascript
// 在 Apps Script 中執行
function backupToJSON() {
  // 讀取 KV 所有資料
  // 存成 JSON 檔案到 Google Drive
}

## 最佳實踐清單

部署時:

- API Secret 使用強密碼
- 不要在程式碼中寫死 Secret
- 確認 .gitignore 包含敏感檔案
- 上傳 GitHub 前檢查沒有洩漏資訊

日常使用:

- 不分享試算表給他人 
- 不公開 Web App URL
- 定期檢查 Cloudflare 流量
- 定期備份 KV 資料

長期維護:

- 每 3-6 個月更換 API Secret
- 關注 Cloudflare 安全公告
- 更新 Worker 程式碼以修補已知漏洞


已知限制

1. CORS 設定
目前 CORS 只允許 Google 網域,但這可以被繞過(用後端程式直接呼叫)。主要防護還是 API Secret。

2. Rate Limiting
目前沒有實作 Rate Limiting。如果 API Secret 洩漏,攻擊者可以在短時間內大量建立短網址。
改進建議: 在 Worker 中加入 Rate Limiting,限制每個 IP 每小時的請求數。

3. 轉址沒有驗證
/:code 轉址端點是公開的,任何人都能訪問。這是設計如此(短網址本來就要公開),但意味著:

任何人都能透過暴力猜測找出你的短網址
考慮使用較長的隨機碼(6 位元已有 360 億種組合)


## 回報安全問題

如果你發現安全漏洞,請:

1. 不要在公開 Issue 中描述
2. 透過 GitHub 的 Security Advisory 功能私下回報
3. 或直接聯繫專案維護者

感謝你幫助改善專案安全性!