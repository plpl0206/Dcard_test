## 題目
- 每個IP每分鐘僅能接受60個requests  
- 在首頁顯示目前的request量，超過限制的話則顯示“Error”，例如在一分鐘內第30個request則顯示30，第61個
request 則顯示 Error

## 實作

利用Express框架實作rate limit(fixed window counter) function當作middleware, 並使用Redis來紀錄請求數跟限制時間  
使用 Mocha 做簡單的測試

## 技術棧
- Backend: ExpressJS  
- Database: Redis

## Setup
### step 1  
安裝相關套件  
```
$ npm install
```

### step 2
運行 server
```
$ npm start
```
查看 localhost:3000 可以看到符合上述 spec 的畫面

## 運行測試
```
$ npm test
```
