package main

import (
	"bufio"
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net"
	"os"
	"sync"

	"golang.design/x/clipboard"
)

func main() {
	err := clipboard.Init()
	var port = "8090"
	if len(os.Args) == 2 {
		port = os.Args[1]
	}

	if os.Args[1] == "READ_TEXT" {
		cbText := clipboard.Read(clipboard.FmtText)
		fmt.Print(base64.StdEncoding.EncodeToString(cbText))
		return
	}

	if os.Args[1] == "READ_IMAGE" {
		cbImage := clipboard.Read(clipboard.FmtImage)
		fmt.Println(base64.StdEncoding.EncodeToString(cbImage))
		return
	}

	if os.Args[1] == "WRITE_TEXT" {
		reader := bufio.NewReader(os.Stdin)
		text, _ := reader.ReadString('\n')
		clipboard.Write(clipboard.FmtText, []byte(text))
		return
	}

	// This works with base64 string
	if os.Args[1] == "WRITE_IMAGE" {
		reader := bufio.NewReader(os.Stdin)
		data, _ := reader.ReadString('\n')
		imgBuf, _ := base64.StdEncoding.DecodeString(data)
		clipboard.Write(clipboard.FmtImage, imgBuf)
		return
	}

	address := fmt.Sprintf("localhost:%s", port)
	fmt.Printf("Client Started, Connecting to %s", address)

	con, err := net.Dial("tcp", address)
	checkErr(err)
	var wg sync.WaitGroup

	defer con.Close()

	msg := "connection from go"

	_, err = con.Write([]byte(msg))

	checkErr(err)

	reply := make([]byte, 1024)
	textCh := clipboard.Watch(context.TODO(), clipboard.FmtText)
	imgCh := clipboard.Watch(context.TODO(), clipboard.FmtImage)

	wg.Add(1)
	go func() {
		for data := range textCh {
			textCon, err := net.Dial("tcp", address)
			checkErr(err)
			// fmt.Println("TEXT_CHANGED") // write TEXT_CHANGED to stdout for parent process to detect clipboard text update
			// cbText := clipboard.Read(clipboard.FmtText)
			payload := "TEXT_CHANGED:" + base64.StdEncoding.EncodeToString(data)
			textCon.Write([]byte(payload))
			textCon.Close()
		}

	}()
	wg.Add(1)
	go func() {
		for data := range imgCh {
			imgCon, err := net.Dial("tcp", address)
			checkErr(err)
			fmt.Println("IMAGE_CHANGED") // write TEXT_CHANGED to stdout for parent process to detect clipboard text update
			base64Img := base64.StdEncoding.EncodeToString(data)
			payload := "IMAGE_CHANGED:" + base64Img
			log.Println(len(payload))
			imgCon.Write([]byte(payload))
			imgCon.Close()
		}
	}()

	wg.Add(1)
	go func() {
		for {
			_, err = con.Read(reply)
			checkErr(err)
			fmt.Println(string(reply))
		}
	}()
	wg.Wait()
}

func checkErr(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
