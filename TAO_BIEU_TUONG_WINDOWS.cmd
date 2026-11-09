@echo off
setlocal
cd /d "%~dp0"
where dotnet >nul 2>&1
if errorlevel 1 (
  echo Chua co .NET SDK. Ban co the lay .exe tu GitHub Actions sau khi push code.
  pause
  exit /b 1
)
if not exist "tools\tinh-tam-launcher\desktop\WinLauncher\TinhTamOnlineOpen.csproj" (
  echo Khong tim thay ma nguon bo mo Windows.
  pause
  exit /b 2
)
dotnet publish "tools\tinh-tam-launcher\desktop\WinLauncher\TinhTamOnlineOpen.csproj" -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:PublishTrimmed=false -p:DebugType=None -o ".tinh-tam-build"
if errorlevel 1 (
  echo Khong dong goi duoc .exe.
  pause
  exit /b 3
)
copy /Y ".tinh-tam-build\TINH_TAM_ONLINE.exe" "TINH_TAM_ONLINE.exe" >nul
if errorlevel 1 (
  echo Khong chep duoc .exe.
  pause
  exit /b 4
)
echo DA TAO TINH_TAM_ONLINE.exe. Lan sau chi can nhap dup file .exe nay.
pause
