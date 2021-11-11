// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"live-streaming-example/router"
	"live-streaming-example/utils"
	"live-streaming-example/ws"
	"time"
)

func cleanUpHubs(hs *ws.Hubs) {
	for {
		targets := []string{}
		for channel, hub := range *hs {
			if hub.GetNumClients() == 0 {
				targets = append(targets, channel)
			}
		}

		for _, target := range targets {
			hs.Delete(target)
		}
		time.Sleep(time.Minute * 10)
	}
}

func main() {
	utils.LoadEnv()

	var hubs = ws.Hubs{}
	go cleanUpHubs(&hubs)

	router := router.SetupRouter(&hubs)
	router.Run(":8080")
}
