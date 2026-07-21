# Copernicus Marine Toolbox setup

## Error seen on Windows

```text
copernicusmarine : The term 'copernicusmarine' is not recognized
```

Then:

```text
No module named copernicusmarine.__main__; 'copernicusmarine' is a package and cannot be directly executed
```

## Cause

- The Copernicus Marine Toolbox was not installed in the Python environment used by PowerShell.
- `copernicusmarine` is a command-line tool after installation. It does not support `python -m copernicusmarine` because the package has no `__main__` entry point.

## Correct setup

Run these commands from the repository root in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install copernicusmarine
.\.venv\Scripts\copernicusmarine.exe --version
.\.venv\Scripts\copernicusmarine.exe login
```

Enter Copernicus credentials only in the local login prompt. Do not add credentials to source files, commits, chat, or project notes.

## Prevention rule

Before giving a command for a new Python command-line package:

1. Verify the package's official install and invocation documentation.
2. Check whether it supports `python -m <package>` before suggesting that form.
3. Prefer a project virtual environment and its explicit executable on Windows when PATH may be incomplete.

## Sources

- [Copernicus Marine Toolbox installation](https://help.marine.copernicus.eu/en/articles/7970514-copernicus-marine-toolbox-installation)
- [Copernicus Marine Toolbox credentials](https://help.marine.copernicus.eu/en/articles/8185007-copernicus-marine-toolbox-credentials-configuration)
