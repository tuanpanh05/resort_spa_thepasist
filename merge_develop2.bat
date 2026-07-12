@echo off
echo =====================================================================
echo                NGU SON RESORT - DEVELOP2 MERGER
echo =====================================================================
echo.

:: 1. Save uncommitted changes
echo [*] Stashing any local changes...
git stash

:: 2. Fetch origin
echo [*] Fetching updates from remote repository...
git fetch origin

:: 3. Merge branch develop2
echo [*] Merging origin/develop2 into current branch...
git merge origin/develop2

:: 4. Resolve Windows casing issues (if any)
echo [*] Resolving potential Windows folder casing conflicts (Backend/ vs backend/)...
git rm --cached -r Backend/ 2>nul
git add backend/ 2>nul

:: 5. Pop stash
echo [*] Restoring local stashed changes...
git stash pop

echo.
echo =====================================================================
echo [FINISHED] Please check the output above for any conflicts or status.
echo =====================================================================
pause
