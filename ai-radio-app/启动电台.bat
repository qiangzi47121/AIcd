@echo off
chcp 65001 >nul
echo.
echo  ========================================
echo    AI 个人电台 - 正在启动...
echo  ========================================
echo.

REM 检测 Python
set PYTHON=
where python >nul 2>&1 && set PYTHON=python
if "%PYTHON%"=="" where python3 >nul 2>&1 && set PYTHON=python3
if "%PYTHON%"=="" (
    set PYTHON=C:\Users\Administrator\.workbuddy\binaries\python\versions\3.13.12\python.exe
)

echo  使用 Python: %PYTHON%
echo  服务地址: http://localhost:8080
echo.
echo  [提示] 手机连同一WiFi后访问:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    echo         http:%%a:8080
    goto :found
)
:found
echo.
echo  按 Ctrl+C 停止服务
echo  ========================================
echo.

%PYTHON% server_py.py
pause
