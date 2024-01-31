@echo off
SET ROOT_DIR=%~dp0
echo Current directory: %ROOT_DIR%
echo Changing to Backend directory...
cd %ROOT_DIR%Backend
if %errorlevel% neq 0 pause

echo Installing Backend dependencies...
call npm install
if %errorlevel% neq 0 pause

echo Starting Backend server...
start "Backend Server" cmd /k node server.js

cd %ROOT_DIR%Backend\predict_py
if %errorlevel% neq 0 pause

echo Installing Python dependencies...
call pip install -r requirements.txt
if %errorlevel% neq 0 pause

echo Starting Python script...
start "Python Predict Script" cmd /k python predict.py

cd %ROOT_DIR%Frontend
if %errorlevel% neq 0 pause

echo Installing Frontend dependencies...
call npm install
if %errorlevel% neq 0 pause

echo Starting Frontend...
start "Frontend Dev Server" cmd /k npm run dev
