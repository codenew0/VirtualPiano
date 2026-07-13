# Virtual Piano

ブラウザだけで演奏できるシンプルなバーチャルピアノです。  
キーボード、マウス、タッチ操作に対応し、複数の音色と鍵盤範囲を選択できます。

## 使い方

1. VS CodeのLive Serverなどで、このフォルダをローカルサーバーとして開きます。
2. 楽器と鍵盤範囲を選びます。
3. 画面の鍵盤をクリック／タップするか、表示されたキーをキーボードで押します。

通常キーはC3〜C6、`Shift + キー`は低音側、`Space + キー`は高音側を演奏します。
たとえば低音側の先頭は `!`, `"`, `#`、高音側は `Space+E` 以降です。

公開済みファイルを使う場合、追加のインストールやビルドは不要です。初回演奏時のみ、Signal Factory Soundの読み込みにインターネット接続が必要です。AudioWorkletを使用するため、`file://` でHTMLを直接開く方法ではなく、`http://localhost` または `http://127.0.0.1` から開いてください。

## フォルダ構成

```text
piano/
├── index.html
├── README.md
├── .gitignore
├── package.json
├── scripts/
│   └── copy-worklet.mjs
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── audio.js
    ├── audio-source.js
    ├── worklets/
    │   └── spessasynth_processor.min.js
    ├── instruments.js
    ├── interaction.js
    ├── music.js
    ├── piano-ui.js
    └── range-controls.js
```

## ファイルの役割

- `audio-source.js`: SoundFont音源処理のソースコード
- `audio.js`: ブラウザ向けにビルドされた音源処理
- `music.js`: 音名、キー割り当て、楽器データ
- `instruments.js`: 楽器選択
- `range-controls.js`: 鍵盤範囲の設定
- `piano-ui.js`: 鍵盤の描画
- `interaction.js`: キーボード、マウス、タッチ操作
- `app.js`: アプリの初期化

## 対応環境

Web Audio APIに対応した最新のブラウザを使用してください。

## 音源

楽器音には、[signal](https://github.com/ryohey/signal) と同じ
`A320U.sf2 (Signal Factory Sound)` を実行時に読み込みます。音源はGNU GPL v2、
再生エンジンのSpessaSynthはApache License 2.0で提供されています。

音源処理を変更した場合は、次のコマンドでブラウザ用ファイルを再生成します。

```bash
npm install
npm run build
```

## Cloudflare Pagesへのデプロイ

公開用ファイルを生成し、Cloudflare Pagesへアップロードします。

```bash
npm run build
npx wrangler pages deploy
```

## ライセンス

[MIT License](LICENSE) のもとで公開しています。
