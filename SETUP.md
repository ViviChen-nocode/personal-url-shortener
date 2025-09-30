# 部署教學

完整的部署步驟說明,從零開始建立你的個人短網址系統。

## 前置準備

### 1. 註冊必要帳號

- [Cloudflare 帳號](https://dash.cloudflare.com/sign-up)(免費)
- Google 帳號
- 擁有一個網域(需要能修改 DNS 設定)

### 2. 決定你的短網址網域

例如: `go.yourdomain.com`

---

## 第一部分:Cloudflare Workers 設定

### 步驟 1: 建立 Worker

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左側選單點選「Workers 和 Pages」
3. 點「建立應用程式」→「建立 Worker」
4. Worker 名稱輸入:`url-shortener`
5. 點「部署」

### 步驟 2: 更新 Worker 程式碼

1. 點「編輯程式碼」
2. 刪除預設程式碼
3. 複製 `cloudflare-worker/worker.js` 的內容並貼上
4. **重要**: 將程式碼中的 `go.yourdomain.com` 改成你的實際網域
5. 點「儲存並部署」

### 步驟 3: 建立 KV 命名空間

1. 回到 Workers 主頁
2. 左側選單點「KV」
3. 點「建立命名空間」
4. 名稱輸入:`url-shortener-links`
5. 點「新增」

### 步驟 4: 綁定 KV 到 Worker

1. 回到你的 Worker(`url-shortener`)
2. 點「設定」分頁
3. 找到「變數和機密資料」區塊
4. 點「新增繫結」
5. 設定:
   - 變數名稱:`LINKS`
   - KV 命名空間:選擇 `url-shortener-links`
6. 點「儲存」

### 步驟 5: 設定 API Secret

1. 在「變數和機密資料」區塊
2. 點「新增變數」
3. 設定:
   - 變數名稱:`API_SECRET`
   - 類型:選擇「機密」
   - 值:輸入一個複雜的密碼(建議 32+ 字元,包含大小寫、數字、符號)
   - 例如:`MySecure_API_Key_2024_8x9mP3nQ`
4. 點「儲存」
5. **重要**: 記下這個 API Secret,後續會用到

---

## 第二部分:DNS 和路由設定

### 步驟 6: 新增 DNS 記錄

1. 在 Cloudflare Dashboard,點選你的網域
2. 左側選單點「DNS」
3. 點「新增記錄」
4. 設定:
   - 類型:`AAAA`
   - 名稱:`go`(或你想要的子網域名稱)
   - IPv6 位址:`100::`
   - Proxy 狀態:橘色雲朵(已啟用)
5. 點「儲存」

### 步驟 7: 設定 Workers 路由

1. 在網域設定頁面,點「Workers 路由」
2. 點「新增路由」
3. 設定:
   - 路由:`go.yourdomain.com/*`(替換成你的網域)
   - Worker:選擇 `url-shortener`
4. 點「儲存」

### 步驟 8: 測試 Worker

在瀏覽器訪問 `https://go.yourdomain.com/`

應該會看到:`URL Shortener API`

如果看到這個訊息,表示 Worker 部署成功!

---

## 第三部分:Google Sheets 設定

### 步驟 9: 建立試算表

1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新試算表,命名為:`URL Shortener Manager`
3. 建立三個工作表分頁:
   - `Settings`
   - `Links`
   - `Log`

### 步驟 10: 設定 Settings 工作表

在 Settings 表建立兩欄:

| Key | Value |
|-----|-------|
| alias_min_length | 4 |
| alias_max_length | 12 |
| default_alias_length | 6 |
| allow_uppercase | FALSE |
| case_sensitive | FALSE |
| allowed_chars | abcdefghijklmnopqrstuvwxyz0123456789- |
| reserved_aliases | api,admin,login,logout,config,healthz,qr,p,preview |
| allow_custom_alias | TRUE |
| default_ttl_days | 0 |
| enable_preview | TRUE |

### 步驟 11: 設定 Links 工作表

第一列標題:

| Long URL | Alias | 觸發 | Short URL | Status | Created At | Source |

第三欄「觸發」設為核取方塊格式。

### 步驟 12: 設定 Log 工作表

第一列標題:

| Timestamp | Action | Code | Details | Source |

### 步驟 13: 新增 Apps Script

1. 試算表上方選單:「擴充功能」→「Apps Script」
2. 刪除預設程式碼
3. 複製 `google-apps-script/Code.gs` 的內容並貼上
4. **重要**: 將程式碼中的 `https://go.yourdomain.com` 改成你的實際網域
5. 點「新增檔案」→「HTML」
6. 檔案名稱:`Index`
7. 複製 `google-apps-script/Index.html` 的內容並貼上
8. **重要**: 同樣替換網域
9. 儲存(專案名稱:`URL Shortener Manager`)

### 步驟 14: 設定 Script Properties

1. Apps Script 左側點「專案設定」(齒輪圖示)
2. 找到「指令碼屬性」
3. 點「新增指令碼屬性」
4. 設定:
   - 屬性:`API_SECRET`
   - 值:貼上步驟 5 的 API Secret
5. 點「儲存」

### 步驟 15: 設定觸發器

1. Apps Script 左側點「觸發條件」(時鐘圖示)
2. 點「新增觸發條件」
3. 設定:
   - 選擇要執行的函式:`onEditTrigger`
   - 選擇活動來源:`來自試算表`
   - 選擇活動類型:`編輯時`
4. 點「儲存」
5. 授權存取權(選擇你的 Google 帳號 → 允許)

### 步驟 16: 部署 Web App

1. Apps Script 右上角點「部署」→「新增部署作業」
2. 點齒輪圖示,選擇「網頁應用程式」
3. 設定:
   - 說明:`短網址產生器 v1`
   - 執行身分:`我`
   - 具有存取權的使用者:`僅限我自己`
4. 點「部署」
5. 授權後,複製「網頁應用程式 URL」
6. **重要**: 儲存這個 URL,手機使用時會用到

### 步驟 17: 測試 Google Sheets

1. 在試算表上方選單,應該會看到「短網址工具」
2. 點「同步設定到 Worker」,應該顯示成功
3. 在 Links 表填入一個網址
4. 勾選該列的「觸發」核取方塊
5. 應該會自動建立短網址並填入結果

---

## 第四部分:Chrome 擴充功能設定

### 步驟 18: 準備擴充檔案

1. 建立資料夾:`url-shortener-extension`
2. 複製以下檔案到資料夾:
   - `chrome-extension/manifest.json`
   - `chrome-extension/popup.html`
   - `chrome-extension/popup.js`
3. **重要**: 修改 `popup.js`:
   - 將 `const API_BASE` 改成你的網域
   - 將 `const API_SECRET` 改成你的 API Secret

### 步驟 19: 準備圖標

建立三個圖標檔案(PNG 格式):
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

放在擴充資料夾中。

### 步驟 20: 安裝擴充

1. 開啟 Chrome,訪問 `chrome://extensions/`
2. 開啟右上角「開發人員模式」
3. 點「載入未封裝項目」
4. 選擇你的 `url-shortener-extension` 資料夾
5. 擴充安裝完成

### 步驟 21: 測試擴充

1. 開啟任何網頁
2. 點擊擴充圖示
3. 應該顯示當前網址
4. 點「建立短網址」
5. 成功後短網址會自動複製到剪貼簿

---

## 完成!

現在你有三種方式建立短網址:

1. **Chrome 擴充**: 一鍵建立
2. **Google Sheets**: 勾選核取方塊
3. **Web App**: 手機友善介面(用步驟 16 的 URL)

## 疑難排解

### Worker 無法訪問
- 檢查 DNS 記錄是否正確
- 確認 Workers 路由設定
- 等待 DNS 傳播(最多 24 小時)

### API 回傳 401 錯誤
- 檢查 API Secret 是否一致
- 確認 Worker 環境變數已設定
- 確認 Script Properties 已設定

### Google Sheets 核取方塊無效
- 確認觸發器已正確設定
- 檢查是否已授權

### Chrome 擴充無法建立
- 確認 API Secret 和網域已正確修改
- 檢查瀏覽器 Console 是否有錯誤訊息

需要更多協助?請提交 [Issue](../../issues)。