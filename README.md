# 知恵こねWeb Worker

本リポジトリは、

- 「[技術書典4 ～知恵をこねたもの～](https://techbookfest.org/event/tbf04)」にて頒布する、
    - 「[構造化と性能の間をGolangで攻める技術(+WebWorker活用技術)](https://techbookfest.org/event/tbf04/circle/12750004)」の中の、
        - 「第2部 Web Worker」内で使用している性能測定ツール用のリポジトリ

である。

リポジトリ名は頒布イベントの副題から取った。

## 頒布物とのgitタグの対応関係

- 技術書典4での物理頒布バージョン
    - v1.0

## 構成

### 7.2_DataTransferForWorker

性能測定ツール。Web Workerへのデータ転送時間測定を目的とする。

比較できるものは以下の3ケース。

- stringをそのままオブジェクトとしてWeb Workerへ転送
- Float32ArrayをTransferableとしてWeb Workerへ転送
- SharedArrayBufferをWeb Workerへ転送

#### 前提パッケージ

- python 3.x系 : ローカルサーバ立ち上げに必要。ブラウザ上でhtmlを見るのに別の方法を用いるなら不要。
    - ```$ python```で動作するようにpathを設定しておくこと

#### ツール使用方法


### 7.2_Main

性能測定ツール



