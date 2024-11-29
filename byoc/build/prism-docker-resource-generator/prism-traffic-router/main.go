package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

// waitForPrismPort waits until the specified port is available
func waitForPrismPort(port string, timeout time.Duration) {
	start := time.Now()
	for {
		conn, err := net.Dial("tcp", fmt.Sprintf("localhost:%s", port))
		if err == nil {
			conn.Close()
			return
		}
		if time.Since(start) > timeout {
			log.Fatalf("Timed out waiting for Prism mock server start")
			os.Exit(1)
		}
		time.Sleep(100 * time.Millisecond)
	}
}

func main() {
	if len(os.Args) < 4 || len(os.Args)%3 != 1 {
		log.Fatalf("Usage: %s <port1> <basePath1> <openApiSpecPath1> [<port2> <basePath2> <openApiSpecPath2> ...]", os.Args[0])
	}

	portMap := make(map[string][]struct {
		basePath        string
		openApiSpecPath string
		prismPort       string
	})

	prismPortCounter := 4015

	for i := 1; i < len(os.Args); i += 3 {
		port := os.Args[i]
		basePath := os.Args[i+1]
		openApiSpecPath := os.Args[i+2]
		prismPort := fmt.Sprintf("%d", prismPortCounter)
		prismPortCounter++

		portMap[port] = append(portMap[port], struct {
			basePath        string
			openApiSpecPath string
			prismPort       string
		}{basePath, openApiSpecPath, prismPort})
	}

	var wg sync.WaitGroup
	startedChan := make(chan bool, len(portMap)) // channel to signal when a proxy starts

	for port, configs := range portMap {
		wg.Add(1)
		go func(port string, configs []struct {
			basePath        string
			openApiSpecPath string
			prismPort       string
		}) {
			defer wg.Done()
			mux := http.NewServeMux()
			for _, config := range configs {
				// Wait for the Prism mock server to be ready by checking port availability
				waitForPrismPort(config.prismPort, 5*time.Minute)

				target, err := url.Parse(fmt.Sprintf("http://localhost:%s", config.prismPort))
				if err != nil {
					fmt.Printf("Failed to parse target URL for Prism mock server on port %s with basePath %s: %v\n",
						config.prismPort, config.basePath, err)
					return
				}

				// Add mux handler for the base path with the reverse proxy to the Prism mock server
				proxy := httputil.NewSingleHostReverseProxy(target)
				basePathHandler := config.basePath
				if !strings.HasSuffix(config.basePath, "/") {
					basePathHandler = fmt.Sprintf("%s/", basePathHandler)
				}
				mux.HandleFunc(basePathHandler, func(w http.ResponseWriter, r *http.Request) {
					r.URL.Path = strings.Replace(r.URL.Path, config.basePath, "", 1)
					// Add a mock Auth header to solve: https://github.com/wso2-enterprise/choreo/issues/31218
					r.Header.Add("Authorization", "Bearer x-choreo-mock-token")
					proxy.ServeHTTP(w, r)
				})
			}

			// Start the HTTP server
			for _, config := range configs {
				fmt.Printf("Started Prism mock server with base path: %s\n", config.basePath)
			}

			// Signal that the proxy has started
			startedChan <- true

			if err := http.ListenAndServe(fmt.Sprintf(":%s", port), mux); err != nil {
				fmt.Printf("Failed to start HTTP server on port %s: %v\n", port, err)
			}
		}(port, configs)
	}

	// Wait for all proxies to signal that they've started
	for i := 0; i < len(portMap); i++ {
		<-startedChan
	}

	// Once all proxies have started, write "ready" to the output file
	file, err := os.Create("/tmp/readiness")
	if err != nil {
		log.Fatalf("Failed to init capturing prism mock server initiation status: %v", err)
	}
	defer file.Close()

	_, err = file.WriteString("ready")
	if err != nil {
		log.Fatalf("Failed to capture prism mock server initiation status: %v", err)
	}

	wg.Wait()
}
