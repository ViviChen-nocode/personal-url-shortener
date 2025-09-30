# 貢獻指南

感謝你對本專案的興趣!

## 如何貢獻

### 回報問題

如果發現 bug 或有功能建議,請:
1. 先搜尋現有 [Issues](../../issues) 確認是否已被提出
2. 如果沒有,建立新的 Issue
3. 使用對應的 Issue 模板(Bug Report 或 Feature Request)
4. 提供清楚的描述和重現步驟

### 提交程式碼

1. Fork 本專案
2. 建立新的分支 (`git checkout -b feature/your-feature`)
3. 進行修改
4. 確認沒有包含敏感資訊(API Secret、網域等)
5. Commit 你的更改 (`git commit -m 'Add some feature'`)
6. Push 到分支 (`git push origin feature/your-feature`)
7. 開啟 Pull Request

### Pull Request 指南

- 清楚描述你的更改
- 如果修復 bug,請引用相關 Issue
- 確保程式碼可以正常運作
- 遵循現有的程式碼風格

## 程式碼風格

- JavaScript: 使用 2 空格縮排
- 變數命名: camelCase
- 函數命名: 清楚描述功能
- 註解: 對複雜邏輯加上說明

## 注意事項

### 安全

- 不要在 commit 中包含真實的 API Secret
- 使用 `YOUR_API_SECRET` 等佔位符
- 確認 `.gitignore` 正確設定

### 測試

在提交前請測試:
- Worker 能正常部署
- Google Sheets 功能正常
- Chrome 擴充可以載入

## 需要幫助?

有任何問題歡迎:
- 開 Issue 詢問
- 在現有 Issue 中留言
- 查看 [SETUP.md](./SETUP.md) 了解部署流程

再次感謝你的貢獻!