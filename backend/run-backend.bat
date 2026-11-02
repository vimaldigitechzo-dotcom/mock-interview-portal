@echo off
set "JAVA_HOME=D:\program-files-my\java"
set "PATH=%JAVA_HOME%\bin;C:\Users\Hp\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin;%PATH%"
echo Starting Spring Boot backend using Java at %JAVA_HOME%...
mvn spring-boot:run
