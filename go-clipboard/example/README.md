# Example for IPC between Golang and Nodejs on the context of Clipboard Update Listening

To run this example, within this folder

```bash
go build client.go && node server
```

Then copy some text or take a screenshot and see what's printed to stdout and image saved to disk.

The screenshot image is updated for every screenshot you take.
