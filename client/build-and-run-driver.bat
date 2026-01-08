@echo off
echo Opening Inex Driver app in Android Studio...
echo.
echo Once Android Studio opens:
echo 1. Wait for Gradle sync to complete
echo 2. Make sure your phone (RZCY60D7GRB) appears in the device dropdown
echo 3. Click the green "Run" button (or Shift+F10)
echo.
echo The app will build and install automatically!
echo.
start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "%~dp0android-driver"
timeout /t 3
