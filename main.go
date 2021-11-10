// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"errors"
	"flag"
	"fmt"
	"live-streaming-example/ws"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
)

var addr = flag.String("addr", ":8080", "http service address")

func checkDirs(workingDirPath string) {
	dirNames := []string{"public", "public/css", "public/js", "views"}

	for _, name := range dirNames {
		path := workingDirPath + "/" + name
		if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
			log.Fatalf("%s is exists", path)
		}
	}
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	http.ServeFile(w, r, "views/home.html")
}

func main() {
	flag.Parse()

	hub := ws.NewHub()
	go hub.Run()

	var (
		_, b, _, _     = runtime.Caller(0)
		workingDirPath = filepath.Dir(b)
	)
	checkDirs(workingDirPath)

	// Route
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.ServeWs(hub, w, r)
	})

	// Load static dir
	staticDirPath := fmt.Sprintf("%s/public", workingDirPath)
	fmt.Println("workingDirPath", workingDirPath)

	fs := http.FileServer(http.Dir(staticDirPath))
	http.Handle("/public/", http.StripPrefix("/public/", fs))

	// Serve
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
