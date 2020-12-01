# 台灣天氣開放資料抓取

透過 nodejs 連接 api 後寫入 mysql

## 環境

xampp : https://www.apachefriends.org/zh_tw/download.html

## 初次運行

```
git clone https://github.com/ni-null/taiwan_opendata_weather.git

cd  taiwan_opendata_weather

npm i
```

## 設置

創建 api_key.txt 並於裡面填入你的 api key

/json/con_mysql_info.json 下修改成你的資料庫資訊

## 運行

```
npm  start
```

透過 port 127.0.0.1:5000 + 英文名可以獲取整理後的資料

例如獲取 桃園市 taoyuan

[http://127.0.0.1:5000/taoyuan](http://127.0.0.1:5000/taoyuan)
