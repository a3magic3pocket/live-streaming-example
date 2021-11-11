package utils

import (
	"fmt"
	"log"
	"path/filepath"
	"runtime"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	var (
		_, b, _, _   = runtime.Caller(0)
		utilsDirPath = filepath.Dir(filepath.Dir(b))
	)

	envPath := fmt.Sprintf("%s/.env", utilsDirPath)
	err := godotenv.Load(envPath)
	if err != nil {
		log.Fatalln("failed to load .env file, error: " + err.Error())
	}
}
