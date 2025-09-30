# 個人短網址系統

一個完全免費、私人使用的短網址服務,基於 Cloudflare Workers、Google Sheets 和 Chrome 擴充功能。

Created by Vivi

## 特色

- **零成本**: 使用 Cloudflare 和 Google 的免費方案
- **三種建立方式**: 
  - Chrome 擴充功能:一鍵建立
  - Google Sheets:批次管理
  - Web App:手機友善介面
- **安全保護**: API Secret 驗證,防止濫用
- **完全掌控**: 資料存在你自己的 Cloudflare KV,不依賴第三方服務

## 系統架構

使用者
├─ Chrome 擴充 ─┐
├─ Google Sheets ├─> Cloudflare Worker ─> KV 儲存
└─ Web App ──────┘         ↓
轉址服務


## 系統需求

- Cloudflare 帳號(免費方案)
- Google 帳號
- 自己的網域(需要設定 DNS)
- Chrome 瀏覽器(使用擴充功能)

## 快速開始

詳細的部署教學請參考 [SETUP.md](./SETUP.md)

基本步驟:
1. 部署 Cloudflare Worker
2. 設定 DNS 和路由
3. 建立 Google Sheets 後台
4. 安裝 Chrome 擴充功能

## 功能說明

### 短網址建立
- 自動產生隨機短碼
- 支援自訂別名
- 保留字保護
- 重複檢查

### 管理功能
- Google Sheets 視覺化管理
- 操作記錄(Log)
- 設定中心(可調整別名規則、保留字等)

### 安全機制
- API Secret 驗證
- CORS 白名單
- 保留字規則
- (可選)Cloudflare Access 保護

## 安全警告

**這是為私人使用設計的系統,請注意:**

- 不要公開你的 API Secret
- 不要分享你的 Worker 網址給不信任的人
- 定期檢查 Cloudflare 流量,確保沒有異常
- 建議定期更換 API Secret

詳細安全建議請參考 [SECURITY.md](./SECURITY.md)

## 專案結構

personal-url-shortener/
├── cloudflare-worker/     # Cloudflare Worker 程式碼
├── chrome-extension/      # Chrome 擴充功能
├── google-apps-script/    # Google Sheets 整合
└── docs/                  # 說明文件

## 授權

MIT License - 詳見 [LICENSE](./LICENSE)

## 貢獻

歡迎提交 Issue 或 Pull Request!
詳見 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 常見問題

**Q: 免費方案的限制是什麼?**
A: Cloudflare 免費方案限制:
- Workers: 每天 100,000 次請求
- KV 讀取: 每天 100,000 次
- KV 寫入: 每天 1,000 次

對個人使用綽綽有餘。注意:建立短網址會消耗 1 次寫入配額,訪問短網址會消耗 1 次讀取配額。

**Q: 可以多人使用嗎?**
A: 系統設計為單人使用。如果要多人使用,需要修改驗證機制。

**Q: 短網址會過期嗎?**
A: 預設永久有效,但可以在 Settings 中設定 TTL。

**Q: 資料會遺失嗎?**
A: 資料存在 Cloudflare KV 中,建議定期備份到 Google Sheets。

## 致謝

感謝 Cloudflare Workers、Google Apps Script 和所有開源專案的貢獻。
