package main

import (
	"context"
	"fmt"
	"os"
	"sync"

	"golang.design/x/clipboard"
)

func main() {
	fmt.Fprintln(os.Stderr, "go clipboard monitor started")
	err := clipboard.Init()
	var wg sync.WaitGroup
	if err != nil {
		panic(err)
	}

	textCh := clipboard.Watch(context.TODO(), clipboard.FmtText)
	wg.Add(1)
	go func() {
		for range textCh {
			fmt.Println("TEXT_CHANGED")
		}
	}()
	imageCh := clipboard.Watch(context.TODO(), clipboard.FmtImage)
	wg.Add(1)
	go func() {
		for range imageCh {
			fmt.Println("IMAGE_CHANGED")
		}
	}()
	wg.Wait()
}
