# Virtual Piano

ブラウザだけで演奏できるシンプルなバーチャルピアノです。  
キーボード、マウス、タッチ操作に対応し、複数の音色と鍵盤範囲を選択できます。

## 使い方

1. `index.html` をブラウザで開きます。
2. 楽器と鍵盤範囲を選びます。
3. 画面の鍵盤をクリック／タップするか、表示されたキーをキーボードで押します。

追加のインストールやビルドは不要です。

## フォルダ構成

```text
piano/
├── index.html
├── README.md
├── .gitignore
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── audio.js
    ├── instruments.js
    ├── interaction.js
    ├── music.js
    ├── piano-ui.js
    └── range-controls.js
```

## ファイルの役割

- `audio.js`: Web Audio APIによる各楽器の音源生成
- `music.js`: 音名、キー割り当て、楽器データ
- `instruments.js`: 楽器選択
- `range-controls.js`: 鍵盤範囲の設定
- `piano-ui.js`: 鍵盤の描画
- `interaction.js`: キーボード、マウス、タッチ操作
- `app.js`: アプリの初期化

## 対応環境

Web Audio APIに対応した最新のブラウザを使用してください。

## ライセンス

個人利用・改変は自由です。

