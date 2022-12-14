package main

import (
	"bufio"
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/CrossCopy/clipboard/go-clipboard/lib"
	"golang.design/x/clipboard"
)

// All possible ways to call this program
// 1. client				(set up TCP socket client to connect to default port 19559)
// 2. client 9999			(set up TCP socket client to connect to custom port 9999)
// 3. client READ_TEXT		(Read Text from clipboard and output to stdout)
// 4. client READ_IMAGE		(Read Image from clipboard and output to stdout in base64 encoding, whoever is reading this must decode it into bytes)
// 5. client WRITE_TEXT		(Write Text to clipboard, data passed in through stdin, in base64 format (since there may be '\n' in raw data, base64 makes sure this doesn't exist))
// 6. client WRITE_IMAGE	(Write Image to clipboard, data passed in through stdin, read as string, in base64 format. Have to decode into buffer before saving to clipboard)
func main() {
	err := clipboard.Init()
	var port = "19559"
	if len(os.Args) == 2 {
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
			time.Sleep(100 * time.Millisecond)
			return
		}

		// This works with base64 string
		if os.Args[1] == "WRITE_IMAGE" {
			reader := bufio.NewReader(os.Stdin)
			data, _ := reader.ReadString('\n') // string in base64
			imgBuf, _ := base64.StdEncoding.DecodeString(data)

			// imgBuf := []byte(strings.TrimSpace(data))
			os_ := runtime.GOOS
			switch os_ {
			case "linux":
				lib.XclipWriteImage(imgBuf)
			default:
				clipboard.Write(clipboard.FmtText, imgBuf)
			}
			time.Sleep(100 * time.Millisecond)
			// imgBuf, _ := base64.StdEncoding.DecodeString(data)
			// clipboard.Write(clipboard.FmtImage, imgBuf)
			return
		}
		// If none of the above are true, then parent process is calling me for setting up a TCP socket connection
		// for bidirectional communication (for clipboard listening)
		// So, the second command line arg is port
		port = os.Args[1]
	}

	// The rest of the code is for clipboard watching
	// connect TCP socket to server
	address := fmt.Sprintf("localhost:%s", port)
	// setup a long connection, but not used to transfer clipboard data, only for message notifications
	con, err := net.Dial("tcp", address)
	checkErr(err)
	defer con.Close()

	// since we continuously watch clipboard update, use wait group keep go routines running
	var wg sync.WaitGroup
	// * this is how to write send message to parent process using stdout
	msg := "connection from go"
	_, err = con.Write([]byte(msg))
	checkErr(err)

	textCh := clipboard.Watch(context.TODO(), clipboard.FmtText)
	imgCh := clipboard.Watch(context.TODO(), clipboard.FmtImage)

	// the text and image clipboard listeners will send message using separate socket connection
	// because closing socket channel is required for the socket server to know when to wrap up received data
	// large data chunks have to be sent in multiple TCP packages which have a size limit
	// the socket server keeps getting data, accumulating data by concatenating packets received, but when to stop?
	// socket server wraps up the data chunks received upon connection close
	// this is why we use short socket connections to send data
	// con (the long socket connection) is only used for sending notifications instead of data
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

	// this is used to receive data from socket server / parent process
	// doesn't need to be large, no massive data will be sent
	reply := make([]byte, 1024)
	wg.Add(1)
	go func() {
		for {
			_, err = con.Read(reply)
			checkErr(err)
			data := string(reply)
			fmt.Println(data)
		}
	}()
	wg.Wait()
}

func checkErr(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
