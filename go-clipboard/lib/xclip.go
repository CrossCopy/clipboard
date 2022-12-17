package lib

import (
	"fmt"
	"log"
	"os"

	"github.com/ZacJoffe/clipboard/xclip"
	"golang.design/x/clipboard"
)

type ImageType int

const (
	Base64 ImageType = iota
	Buffer
)

// sampleBase64Img := "iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAtdEVYdENyZWF0aW9uIFRpbWUAVHVlIDEzIERlYyAyMDIyIDA0OjM5OjI1IFBNIEVTVH9UhTgAAAIhSURBVEiJrZQxaBNhFMd/d7leYprGWEMkldIONta4xFAHqWiEYMHBpRktCkWHUoJOcexsF8EO6iA4KE4O0jgIgk6iUrDadrKobW3TJhgSm6S5kPscUhQbcvkS+qbHvXe/7//e979TwuGwYE8c6Du691HDmJqI/80TicR/NVWa0kZYwAV9wW1OHqobbH/gJ6Ip7t/5xqPrWcKe1g+xXIsQgK1K4EyGu1PrXB0wUfYHrvLqQT+Tjw+yVADFXWQ8vsGoX34Ca+WGxvxbH/FpL58KoHYWuXElR4+kfCm37Kx4mE46MAQ4j+e43C+nXh2PTBILRQm4dIs2hbX3bj5XAbXCULAipUr9svULvXuI8+FLHLM3ntfM63zPAQj8vgo2GfiHpWe8XF5H6AMM+lyN3SAUSkatatcl1wIm+XyKklBw6M6WrNYUrmsOHA4nuiLYKRdp/3usD+1a5GYtEwVyRWt4q1Nps3NPd1OD3/lq407VpNNRO7psyP3vtPXsilSjerhMwA2g8HNTw0LGv3d0zzAjp8cY6fdb2EsQPJdnUAXMDj4udGDKwGOnztKr51hOpRqoEXhDaW5HDWwKbC96eLEqt31tczXJ/I9FMpX6q+zqKXDxQpaxSAmvDcx8JzNP3GxKWkp7/XWhQclkOLbBrVCNVMm4uDdzhNktec9ozRrMos67N908THaxXJLmNoMrzD3vZXTLTtpoDSoFT6/Z26Puxh8ZKK5kzvJifAAAAABJRU5ErkJggg=="
// sampleImgBuf, _ := base64.StdEncoding.DecodeString(sampleBase64Img)
func XclipWriteImage(imgBuf []byte) error {

	if err := clipboard.Init(); err != nil {
		return err
	}

	tempDir, err := os.MkdirTemp("", "crosscopy-img-")
	if err != nil {
		return err
	}
	defer os.RemoveAll(tempDir)

	file, err := os.CreateTemp(tempDir, "screenshot-*.png")
	if err != nil {
		return err
	}
	defer os.Remove(file.Name())

	if _, err := file.Write(imgBuf); err != nil {
		fmt.Println(err)
	}

	image, err := os.Open(file.Name())
	if err != nil {
		return err
	}

	if err := xclip.WriteImage(image); err != nil {
		log.Fatal(err)
	}
	return nil
}

// sample code
// func main() {
// 	sampleBase64Img := "iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAtdEVYdENyZWF0aW9uIFRpbWUAVHVlIDEzIERlYyAyMDIyIDA0OjM5OjI1IFBNIEVTVH9UhTgAAAIhSURBVEiJrZQxaBNhFMd/d7leYprGWEMkldIONta4xFAHqWiEYMHBpRktCkWHUoJOcexsF8EO6iA4KE4O0jgIgk6iUrDadrKobW3TJhgSm6S5kPscUhQbcvkS+qbHvXe/7//e979TwuGwYE8c6Du691HDmJqI/80TicR/NVWa0kZYwAV9wW1OHqobbH/gJ6Ip7t/5xqPrWcKe1g+xXIsQgK1K4EyGu1PrXB0wUfYHrvLqQT+Tjw+yVADFXWQ8vsGoX34Ca+WGxvxbH/FpL58KoHYWuXElR4+kfCm37Kx4mE46MAQ4j+e43C+nXh2PTBILRQm4dIs2hbX3bj5XAbXCULAipUr9svULvXuI8+FLHLM3ntfM63zPAQj8vgo2GfiHpWe8XF5H6AMM+lyN3SAUSkatatcl1wIm+XyKklBw6M6WrNYUrmsOHA4nuiLYKRdp/3usD+1a5GYtEwVyRWt4q1Nps3NPd1OD3/lq407VpNNRO7psyP3vtPXsilSjerhMwA2g8HNTw0LGv3d0zzAjp8cY6fdb2EsQPJdnUAXMDj4udGDKwGOnztKr51hOpRqoEXhDaW5HDWwKbC96eLEqt31tczXJ/I9FMpX6q+zqKXDxQpaxSAmvDcx8JzNP3GxKWkp7/XWhQclkOLbBrVCNVMm4uDdzhNktec9ozRrMos67N908THaxXJLmNoMrzD3vZXTLTtpoDSoFT6/Z26Puxh8ZKK5kzvJifAAAAABJRU5ErkJggg=="
// 	sampleImgBuf, _ := base64.StdEncoding.DecodeString(sampleBase64Img)
// 	lib.XclipWriteImage(sampleImgBuf)
// }
