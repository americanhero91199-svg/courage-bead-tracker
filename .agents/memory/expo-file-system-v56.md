---
name: expo-file-system v56 API change
description: expo-file-system@56 (Expo SDK 54) dropped the legacy top-level API; cacheDirectory and readAsStringAsync no longer exist on the default import
---

In expo-file-system@56 (installed alongside expo@54), the legacy top-level API is gone. These properties do NOT exist on `import * as FileSystem from 'expo-file-system'`:
- `FileSystem.cacheDirectory`
- `FileSystem.readAsStringAsync`
- `FileSystem.writeAsStringAsync`
- `FileSystem.EncodingType`

**Why:** The package was rewritten to use a class-based "next" API (`File`, `Directory` from `expo-file-system/next`).

**How to apply:**
- For reading picked files (from expo-document-picker with `copyToCacheDirectory: true`): use `fetch(uri).then(r => r.text())` instead of `FileSystem.readAsStringAsync`
- For sharing/exporting text content: use React Native's `Share.share({ message: content })` instead of writing to a temp file
- For web export: create a Blob and trigger a download with a DOM anchor element
- If you need the file-based API on native, check `expo-file-system/next` for the `File` and `Directory` classes
