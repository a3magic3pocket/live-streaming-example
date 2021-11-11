package router

import (
	"fmt"
	"html/template"
	"live-streaming-example/ws"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter : 라우터 세팅
func SetupRouter(hubs *ws.Hubs) *gin.Engine {
	router := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowHeaders = []string{
		"Authorization",
		"Content-type",
	}
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{
		"GET", "POST",
	}
	router.Use(cors.New(corsConfig))

	// 정적 파일 로드
	var (
		_, b, _, _     = runtime.Caller(0)
		workingDirPath = filepath.Dir(filepath.Dir(b))
	)
	router.LoadHTMLGlob(fmt.Sprintf("%s/views/*", workingDirPath))
	router.StaticFS("/public", http.Dir(fmt.Sprintf("%s/public", workingDirPath)))
	router.GET("favicon.ico", func(c *gin.Context) {
		c.File("public/images/favicon.ico")
	})

	// Route
	router.GET("/", func(c *gin.Context) {
		rtmpURL := os.Getenv("rtmpURL")
		hlsURL := os.Getenv("hlsURL")
		apiURL := os.Getenv("apiURL")
		fmt.Println("rtmpURL", rtmpURL)
		c.HTML(http.StatusOK, "home.html", gin.H{
			"rtmpURL": template.URL(rtmpURL),
			"hlsURL":  template.URL(hlsURL),
			"apiURL":  template.URL(apiURL),
		})
	})
	router.GET("/ws", func(c *gin.Context) {
		channel := c.Request.URL.Query().Get("channel")
		if channel == "" {
			channel = "default"
		}

		var hub *ws.Hub
		cachedHub, exists := hubs.Get(channel)
		if exists {
			hub = cachedHub
		} else {
			hub = ws.NewHub()
			hubs.Set(channel, hub)
			go hub.Run()
		}

		ws.ServeWs(hub, c.Writer, c.Request)
	})

	return router
}
