# LINE風チャット

リアルタイムコミュニケーション機能を備えた、LINE風のチャットアプリケーションです。

## 主な機能

- ✨ **リアルタイムメッセージング** - WebSocketを使用した双方向通信
- 👥 **マルチユーザー対応** - 複数のユーザーが同時にチャット可能
- ⌨️ **タイピング表示** - 相手がタイプ中であることを表示
- 🔐 **ルーム機能** - プライベートなチャットルームの作成
- 📱 **レスポンシブデザイン** - モバイルとデスクトップに対応

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/koike0324/laughing-carnival.git
cd laughing-carnival

# 依存パッケージをインストール
npm install
```

## 使用方法

### 開発モード

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### 本番モード

```bash
npm start
```

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Node.js, Express.js
- **リアルタイム通信**: Socket.IO

## ファイル構成

```
.
├── server.js                  # メインサーバーファイル
├── package.json              # 依存パッケージの定義
├── public/
│   ├── index.html           # ホームページ
│   ├── chat.html            # チャットページ
│   ├── styles/
│   │   ├── home.css         # ホームページのスタイル
│   │   └── chat.css         # チャットページのスタイル
│   └── js/
│       ├── home.js          # ホームページのスクリプト
│       └── chat.js          # チャットのロジック
├── .gitignore
└── README.md
```

## API仕様

### Socket.IO イベント

#### クライアント → サーバー

- `join` - ルームに参加
  ```javascript
  socket.emit('join', { username: 'ユーザー名', room: 'ルーム名' })
  ```

- `sendMessage` - メッセージを送信
  ```javascript
  socket.emit('sendMessage', { message: 'メッセージ内容' })
  ```

- `typing` - タイピング中を通知
  ```javascript
  socket.emit('typing')
  ```

- `stopTyping` - タイピング終了を通知
  ```javascript
  socket.emit('stopTyping')
  ```

#### サーバー → クライアント

- `receiveMessage` - メッセージ受信
  ```javascript
  { username, message, timestamp, socketId }
  ```

- `userJoined` - ユーザーが参加
  ```javascript
  { username, message, timestamp }
  ```

- `userLeft` - ユーザーが退出
  ```javascript
  { username, message, timestamp }
  ```

- `userTyping` - ユーザーがタイプ中
  ```javascript
  { username }
  ```

- `userStopTyping` - ユーザーがタイプ終了

- `onlineCount` - オンラインユーザー数
  ```javascript
  count
  ```

## ライセンス

MIT

## 作成者

koike0324
