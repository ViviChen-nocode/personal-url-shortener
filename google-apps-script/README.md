# Google Apps Script

Google Sheets 整合和 Web App 介面。

## 檔案說明

- `Code.gs`: 主程式，包含 Google Sheets 功能和 Web App 後端
- `Index.html`: Web App 前端介面

## 部署前設定

### 1. 修改網域

編輯 `Code.gs`，替換：

```javascript
const API_BASE = 'https://go.yourdomain.com';
```

### 2. 設定 Script Properties

在 Apps Script 編輯器：

1. 專案設定 → 指令碼屬性
2. 新增屬性：
   - 屬性名稱：`API_SECRET`
   - 值：你的 API Secret

### 3. 設定觸發器

Apps Script 左側「觸發條件」：

- 函式：`onEditTrigger`
- 事件來源：來自試算表
- 事件類型：編輯時

### 4. 部署 Web App

1. 部署 → 新增部署作業
2. 類型：網頁應用程式
3. 執行身分：我
4. 存取權：僅限我自己

## Google Sheets 結構

### Settings 表
系統設定，用於控制短網址規則。

### Links 表
| Long URL | Alias | 觸發 | Short URL | Status | Created At | Source |
|----------|-------|------|-----------|--------|------------|--------|

第三欄「觸發」為核取方塊，勾選後自動建立短網址。

### Log 表
| Timestamp | Action | Code | Details | Source |
|-----------|--------|------|---------|--------|

記錄所有操作。

## 使用方式

### 方式 1: 核取方塊

1. 在 Links 表填入長網址
2. 勾選該列的「觸發」核取方塊
3. 自動建立短網址

### 方式 2: Web App

1. 開啟部署後的 Web App URL
2. 輸入長網址
3. 點「建立短網址」

## 疑難排解

### 核取方塊無效

- 確認觸發器已設定
- 確認已授權權限

### API 錯誤

- 檢查 Script Properties 中的 `API_SECRET`
- 確認網域設定正確

### Web App 無法訪問

- 重新部署並選擇「新版本」
- 確認部署設定為「僅限我自己」