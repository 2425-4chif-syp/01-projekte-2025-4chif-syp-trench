#!/bin/bash
# Run HTTP YAC Integration Tests

# Change to the script directory
cd "$(dirname "$0")"

# Run the PowerShell script (assuming pwsh is installed for cross-platform PowerShell)
if command -v pwsh &> /dev/null; then
    pwsh -NoLogo -NoProfile -Command "& '$PWD/run-tests.ps1'; exit \$LASTEXITCODE"
    exit $?
else
    echo "[ERROR] PowerShell (pwsh) is not installed. Please install PowerShell Core."
    echo "Visit: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-linux"
    exit 1
fi
