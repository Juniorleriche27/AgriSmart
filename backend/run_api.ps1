$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$python = 'C:\Users\DELL WORKSTATION\anaconda3\envs\myfiance\python.exe'

Set-Location $projectRoot
& $python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8010
