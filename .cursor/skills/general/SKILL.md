---
name: general
description: Project overview (structure & stack) for arc-command
alwaysApply: true
---

# Overview

このリポジトリは **WXT** を使って開発されているブラウザ拡張（TypeScript）です。UI は `entrypoints/popup/` 配下の **React** で実装されています。

## ディレクトリ構造（要点）
- **`entrypoints/`**: 拡張の各エントリポイント
  - **方針（WXTの推奨運用）**: 各エントリポイントは **ディレクトリを切って `index.{ext}` を入口にする**（例: `entrypoints/background/index.ts`）
    - 目的: 同一エントリポイントに紐づく補助ファイル（`style.css` や分割した `*.ts`）を同じディレクトリに置いても、WXT に別エントリポイントとして誤認されにくくする
    - 制約: `entrypoints/` 配下は **0〜1階層**まで（深いネストのエントリポイントは不可）
    - 命名: エントリポイント種別は名前で決まる。content script は `NAME.content` 形式を使う（例: `entrypoints/youtube.content/index.ts`）
  - **`background/`**: background / service worker 相当（`index.ts` がエントリ）
  - **`*.content/`**: content script（例: `youtube.content/`。`index.ts` がエントリ）
  - **`popup/`**: ポップアップ UI（React）
    - `index.html` がエントリ（例: `main.tsx`, `App.tsx`, `*.css` を同居させる）
- **`components/`**: 再利用コンポーネント
  - **`components/ui/`**: **shadcn/ui** 由来の UI プリミティブ（例: `button.tsx`）
- **`lib/`**: 汎用ユーティリティ（例: `lib/utils.ts`）
- **`styles/`**: グローバルスタイル（例: `styles/globals.css`）
- **`public/`**: 静的アセット

## 採用技術 / ツール（把握しておく前提）
- **TypeScript**: 全体の実装言語
- **WXT**: 拡張のビルド/開発基盤（設定: `wxt.config.ts`）
- **React**: ポップアップ UI（`entrypoints/popup/`）
- **shadcn/ui**: UIコンポーネントの導入方式（設定: `components.json`、実体: `components/ui/`）
- **Tailwind CSS**: スタイリング（設定は `components.json` 参照、CSS は `styles/globals.css`）
- **Radix UI / CVA / class utilities**: shadcn/ui を支える基盤（例: `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`）
- **Biome**: フォーマット/リント（設定: `biome.json`）
- **Vitest**: テスト（設定: `vitest.config.ts`）

## 変更時の基本姿勢（概要）
- 変更対象はまず **どのエントリポイントか**（`background`/`content`/`popup`）を切り分けてから作業する
- UI 変更は `entrypoints/popup/` と `components/` を中心に行い、汎用処理は `lib/` に寄せる
- 設定系の変更は対応する設定ファイル（`wxt.config.ts`, `tsconfig.json`, `biome.json`）を起点に確認する
