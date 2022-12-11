package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net"
	"sync"

	"golang.design/x/clipboard"
)

func main() {
	err := clipboard.Init()
	con, err := net.Dial("tcp", "localhost:8090")

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
			fmt.Println("TEXT_CHANGED") // write TEXT_CHANGED to stdout for parent process to detect clipboard text update
			// cbText := clipboard.Read(clipboard.FmtText)
			payload := "TEXT_CHANGED:" + base64.StdEncoding.EncodeToString(data)
			con.Write([]byte(payload))
		}

	}()
	wg.Add(1)
	go func() {
		for data := range imgCh {
			fmt.Println("IMAGE_CHANGED") // write TEXT_CHANGED to stdout for parent process to detect clipboard text update
			base64Img := base64.StdEncoding.EncodeToString(data)
			payload := "IMAGE_CHANGED:" + base64Img
			con.Write([]byte(payload))
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
