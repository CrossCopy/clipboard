build:
	GOOS=darwin GORACH=arm64 go build -o binaries/go-clipboard-darwin-arm64
	GOOS=darwin GORACH=amd64 go build -o binaries/go-clipboard-darwin-x64
	GOOS=linux GORACH=386 go build -o binaries/go-clipboard-linux-386
	GOOS=linux GORACH=arm go build -o binaries/go-clipboard-linux-arm
	GOOS=linux GORACH=arm64 go build -o binaries/go-clipboard-linux-arm64
	GOOS=linux GORACH=amd64 go build -o binaries/go-clipboard-linux-x64
	GOOS=windows GORACH=amd64 go build -o binaries/go-clipboard-win32-x64.exe
