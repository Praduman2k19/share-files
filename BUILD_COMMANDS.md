# Quick Build Commands

Copy-paste these commands in PowerShell to build the exe.

---

## First Time Setup (One-Time Only)

```powershell
cd 'C:\projects\nodejs'
npm install
npm install --save-dev pkg nodemon @vercel/ncc javascript-obfuscator
```

---

## Build the EXE (Run This Every Time)

```powershell
cd 'C:\projects\nodejs'
npm run build
```

---

## Run the EXE

```powershell
& '.\dist\app.exe'
```

---

## Build with Obfuscation (If EXE Fails)

```powershell
cd 'C:\projects\nodejs'
npx ncc build server.js -o dist
npx javascript-obfuscator dist/index.js --output dist/index.obf.js --compact true --control-flow-flattening true --string-array true
```

---

## Run Obfuscated JS

```powershell
cd 'C:\projects\nodejs'
node dist/index.obf.js
```

---

## Clean Build (Delete Old Files First)

```powershell
cd 'C:\projects\nodejs'
Remove-Item dist\app.exe -Force -ErrorAction SilentlyContinue
npm run build
```

---

## That's It!

After `npm run build`, your `app.exe` will be in: `C:\projects\nodejs\dist\app.exe`
