package lib

import (
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

func WindowsPowershellWriteImage(imgBuf []byte) error {
	ex, err := os.Executable()
	if err != nil {
		return err
	}
	exDir := filepath.Dir(ex)
	scriptPath := filepath.Join(exDir, "..", "scripts", "win", "write_image.ps1")
	scriptPath, err = filepath.Abs(scriptPath)
	println(scriptPath)

	tempDir, err := os.MkdirTemp("", "crosscopy-img-")
	if err != nil {
		return err
	}
	println(tempDir)

	defer os.RemoveAll(tempDir)
	file, err := os.CreateTemp(tempDir, "screenshot-1.png")
	if err != nil {
		return err
	}
	defer os.Remove(file.Name())
	if _, err := file.Write(imgBuf); err != nil {
		log.Fatal(err)
	}
	cmd := exec.Command("powershell", scriptPath, "-imagePath", file.Name())
	out, err := cmd.CombinedOutput()
	println(string(out))
	println(err)
	//if err := cmd.Run(); err != nil {
	//	return err
	//}
	return nil
}
