# Build Process for Node.js Executable (app.exe)

This document details the exact steps, commands, and rationale for building `app.exe` from your Node.js source code so you can replicate this on other systems.

---

## Overview

The goal is to **hide source code** by packaging your Node.js application into a Windows executable (`.exe`) that users cannot easily inspect or modify.

### What We Built
- **app.exe** — A standalone Windows executable containing your entire Node.js app (no source code visible).
- **index.obf.js** — An obfuscated JavaScript bundle (alternative, if exe fails).

### Why This Approach?
- **pkg** tool bundles Node.js + your code into a single exe file.
- **Obfuscation** (via `javascript-obfuscator`) makes source code unreadable if you ship JS instead of exe.
- Users cannot easily extract or read your source — they just run the exe.

---

## Prerequisites

Before you start, ensure you have:
1. **Node.js** (v16 or higher) installed on your system.
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Windows** (for building .exe files)
   - pkg creates Windows exe files; you need to build on Windows to create Windows executables.

3. **Not on OneDrive/cloud sync** (Important!)
   - If your project folder is on OneDrive, Google Drive, or Dropbox, **move it to a local path** (e.g., `C:\projects\`) first.
   - Cloud sync folders can cause permission/lock issues during build.

---

## Step-by-Step Build Instructions

### **Step 1: Prepare Your Project (First Time Only)**

Move your project to a local folder (not in OneDrive if possible):

```powershell
# Create a local projects directory
New-Item -ItemType Directory -Path 'C:\projects' -Force

# Move your project (example):
# Move-Item -Path 'C:\Users\YourUser\OneDrive\Desktop\nodejs' -Destination 'C:\projects\nodejs'
# OR robocopy if move fails:
robocopy "C:\Users\YourUser\OneDrive\Desktop\nodejs" "C:\projects\nodejs" /MIR /ETA
```

**Why?** OneDrive can lock files during build, causing "spawn UNKNOWN" errors in pkg.

---

### **Step 2: Install Dependencies**

Navigate to your project folder and install all npm packages:

```powershell
cd 'C:\projects\nodejs'
npm install
```

This installs production dependencies from your `package.json`.

---

### **Step 3: Add Build Tools (DevDependencies)**

Install the tools needed to create the exe:

```powershell
npm install --save-dev pkg nodemon @vercel/ncc javascript-obfuscator
```

**What each does:**
- **pkg** — Bundles Node.js and your code into an exe.
- **nodemon** — Auto-restarts your app during development (optional).
- **@vercel/ncc** — Bundles JS into a single file.
- **javascript-obfuscator** — Makes source code unreadable.

---

### **Step 4: Update package.json**

Ensure your `package.json` has:

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "description": "Your app description",
  "main": "server.js",
  "bin": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "pkg . --targets node16-win-x64 --output dist/app.exe",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "pkg": "^5.8.0",
    "@vercel/ncc": "^0.38.4",
    "javascript-obfuscator": "^4.1.0"
  }
}
```

**Key fields:**
- `"main"` — Your entry point (e.g., `server.js`)
- `"bin"` — Same as main (required by pkg)
- `"build"` script — The command to create the exe

---

### **Step 5: Create `dist` Directory**

Create an output folder for build artifacts:

```powershell
New-Item -ItemType Directory -Path 'C:\projects\nodejs\dist' -Force
```

---

### **Step 6: Build the Executable Using pkg**

Run the build command:

```powershell
cd 'C:\projects\nodejs'
npm run build
```

Or directly:

```powershell
npx pkg . --targets node16-win-x64 --output dist/app.exe
```

**What happens:**
- pkg downloads Node.js v16 binaries.
- It packages your code + dependencies + Node.js into a single exe.
- Output: `C:\projects\nodejs\dist\app.exe`

**Troubleshooting:**
- If build fails with "spawn UNKNOWN" → Your project is on a synced folder (OneDrive, etc.). Move it to a local path (step 1).
- If no exe is produced → Check that `main` and `bin` in `package.json` match your entry point.
- If exe won't run → Try a different Node version target (e.g., `node14-win-x64` or `node16-win-x64`).

---

### **Step 7 (Alternative): Bundle & Obfuscate JavaScript**

If the exe fails or you prefer shipping obfuscated JS instead:

```powershell
cd 'C:\projects\nodejs'

# Bundle all dependencies into a single file
npx ncc build server.js -o dist

# Obfuscate the bundle to hide source code
npx javascript-obfuscator dist/index.js --output dist/index.obf.js --compact true --control-flow-flattening true --string-array true --string-array-encoding rc4
```

**Output:**
- `dist/index.js` — Combined bundle (human-readable)
- `dist/index.obf.js` — Obfuscated bundle (hard to read)

**To run the obfuscated bundle:**
```powershell
node dist/index.obf.js
```

---

### **Step 8: Test the Executable**

Run the exe to verify it works:

```powershell
& 'C:\projects\nodejs\dist\app.exe'
```

**Expected output:**
```
Server running on port 5000
```

**Test HTTP access:**
```powershell
# Wait a moment for server to start, then:
Invoke-WebRequest -Uri 'http://localhost:5000/api/items' -Method Get -Headers @{ Authorization = "Bearer your-jwt-token" }
```

---

### **Step 9: Distribute the Executable**

Copy the exe to your target system:

```powershell
# From your build machine to a destination:
Copy-Item 'C:\projects\nodejs\dist\app.exe' -Destination 'C:\Destination\' -Force

# OR on target system, run directly:
& 'C:\path\to\app.exe'
```

**Notes:**
- The exe is **standalone** — no Node.js installation required on the target machine.
- The exe is **self-contained** — all dependencies are bundled inside.
- The exe is **Windows-only** — build on Windows to create Windows exe files (can't create ARM64 exe on x64, for example).

---

## Complete Command Reference

### One-Liner Build Script (for quick rebuilds)

```powershell
# Full build from scratch
cd 'C:\projects\nodejs' ; `
npm install ; `
npm run build ; `
Write-Output "✓ Exe created at: C:\projects\nodejs\dist\app.exe"
```

### Build with Obfuscation Fallback

```powershell
cd 'C:\projects\nodejs'

# Try exe build
try { npm run build } catch { Write-Output "Exe build failed, building obfuscated bundle instead..." }

# If exe build fails, create bundle
npx ncc build server.js -o dist
npx javascript-obfuscator dist/index.js --output dist/index.obf.js --compact true --control-flow-flattening true --string-array true
```

---

## Replicating on Another System

To build the exe on a **different Windows machine**:

1. **Install Node.js** (v16+)
   - Download from https://nodejs.org/
   - Verify: `node --version`

2. **Copy your project folder** to a local path (e.g., `C:\projects\nodejs`)
   - Do NOT put it on OneDrive/Dropbox

3. **Open PowerShell** in that folder

4. **Run the build:**
   ```powershell
   npm install
   npm run build
   ```

5. **Find the exe:**
   ```powershell
   Get-ChildItem .\dist\app.exe
   ```

6. **Run it:**
   ```powershell
   .\dist\app.exe
   ```

---

## Security Notes & Limitations

### What This Protects Against
- ✅ Casual inspection (users can't easily read source code).
- ✅ Accidental modification (exe is compiled, not editable text).
- ✅ Quick reverse-engineering (requires decompiling tools).

### What This Does NOT Protect Against
- ❌ Determined reverse-engineering (decompilers and unpacker tools exist).
- ❌ Memory inspection (running exe can be inspected in memory).
- ❌ Man-in-the-middle attacks (run HTTPS, not HTTP, for sensitive data).

### For Stronger Protection
- Host your app on a **private server** you control (best security).
- Use **code signing** (sign the exe with a certificate to prevent tampering).
- Use **commercial obfuscation** (VM-based obfuscation is harder to reverse than simple obfuscation).
- Implement **API authentication** (use tokens, JWT, OAuth).

---

## Troubleshooting

### "The specified executable is not a valid application for this OS platform"
- **Cause:** exe was corrupted during build or built for wrong platform.
- **Solution:** Delete `dist/app.exe` and rebuild; ensure you're on Windows x64.

### "Cannot find module 'xyz'"
- **Cause:** A dependency is missing from `package.json`.
- **Solution:** Run `npm install xyz --save` to add it.

### "Port 5000 is already in use"
- **Cause:** Another app is using port 5000.
- **Solution:** Change the port in your code or stop the other app:
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 | Stop-Process
  ```

### Build is slow
- **Cause:** pkg is downloading Node.js binaries and bundling dependencies.
- **Solution:** First build is slow; subsequent builds are faster.

---

## Summary

| Step | Command | Output |
|------|---------|--------|
| 1    | `npm install` | node_modules folder |
| 2    | `npm install --save-dev pkg ...` | devDependencies added |
| 3    | Update `package.json` | Updated file with build scripts |
| 4    | `npm run build` | `dist/app.exe` created |
| 5    | `.\dist\app.exe` | App running on port 5000 |

---

## Questions & Support

If the build fails:
1. **Check Node.js version:** `node --version` (should be v14+)
2. **Move project to local path:** Not on OneDrive/cloud sync
3. **Update package.json:** Ensure `main` and `bin` fields match your entry point
4. **Rebuild:** Delete `dist/` and retry `npm run build`

For advanced scenarios (ARM64, macOS, Linux builds), consult the pkg documentation:
https://github.com/vercel/pkg

---

**Document Version:** 1.0  
**Date:** December 2025  
**Node.js version tested:** v16.16.0  
**Platform:** Windows 11 Home (x64)
