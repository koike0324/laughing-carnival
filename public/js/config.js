// API Configuration
// ローカル開発用と本番環境用の設定を切り替え

const isProduction = window.location.hostname !== 'localhost';

const API_CONFIG = {
  // Render上のバックエンドURL（本番環境）
  // デプロイ後、以下のURLを実際のRenderアプリのURLに置き換えてください
  SOCKET_URL: isProduction 
    ? 'https://laughing-carnival-api.onrender.com'  // 本番環境
    : 'http://localhost:3000',                       // ローカル開発
  
  // GitHub PagesでのホームページURL
  HOME_URL: 'https://koike0324.github.io/laughing-carnival/',
  
  // チャットページのURL
  CHAT_URL: 'https://koike0324.github.io/laughing-carnival/chat.html'
};

// デバッグ用ログ
console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('API URL:', API_CONFIG.SOCKET_URL);
