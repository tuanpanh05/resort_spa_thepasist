@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-24"
set "MAVEN_HOME=C:\Users\Administrator\Videos\FontendFor_SWP391\03.SourceCode\maven-extracted\apache-maven-3.9.6"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"
echo ==========================================================
echo  Module 1 - Auth Unit Test Runner
echo ==========================================================
echo  JAVA_HOME  = %JAVA_HOME%
echo  MAVEN_HOME = %MAVEN_HOME%
echo ==========================================================
echo.
"%JAVA_HOME%\bin\java.exe" -version
echo.
echo Running unit tests: AuthModule1ServiceTest
echo.
"%MAVEN_HOME%\bin\mvn.cmd" test -Dtest=AuthModule1ServiceTest --no-transfer-progress
echo.
echo ============================
echo  Maven exit code: %ERRORLEVEL%
echo ============================
