# lr-conan-monolith
### build
`npm run build;  Get-Content .\dist\my-lib.js | %{ $_.Replace("void 0", "undefined") } | Set-Content .\dist\index.js`
### deploy
Copy `.\dist\index.js` into let's role script
