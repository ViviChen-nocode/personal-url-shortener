# Chrome 擴充功能

## 圖標準備

需要準備三個尺寸的圖標檔案 (PNG 格式)：
- `icon16.png` (16x16 像素)
- `icon48.png` (48x48 像素)  
- `icon128.png` (128x128 像素)

可以使用任何圖片編輯軟體製作，或使用線上工具如：
- [Canva](https://www.canva.com)
- [Figma](https://www.figma.com)
- macOS 內建的「預覽程式」

建議使用簡單的圖示，如連結符號、箭頭等。

## 安裝前設定

### 1. 編輯 `popup.js`

替換以下兩行：

```javascript
const API_BASE = 'https://go.yourdomain.com';
const API_SECRET = 'YOUR_API_SECRET_HERE';
```

### 2. 編輯 `manifest.json`

替換網域設定：

```json
"host_permissions": [
  "https://go.yourdomain.com/*"
]
```

## 安裝步驟

1. Chrome 訪問 `chrome://extensions/`
2. 開啟「開發人員模式」
3. 點「載入未封裝項目」
4. 選擇此資料夾

## 使用方式

1. 開啟任何網頁
2. 點擊擴充圖示
3. 選填自訂別名
4. 點「建立短網址」
5. 短網址自動複製到剪貼簿