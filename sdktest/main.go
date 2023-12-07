// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package main

import (
	"fmt"
	"log"

	"github.com/alecthomas/kong"
	"github.com/fatih/color"
	"github.com/friendlycaptcha/friendly-captcha/web/captchav2/friendly-captcha-sdk/sdktest/autotest"
	"github.com/friendlycaptcha/friendly-captcha/web/captchav2/friendly-captcha-sdk/sdktest/server"
	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
)

var CLI struct {
	Autotest struct {
		Serve bool `help:"Serve the test pages so you can open them in a browser."`
	} `cmd:"" help:"Run the tests with an instrumented (headless) browser."`

	Server struct {
	} `cmd:"" help:"Serve tests in a webserver."`
}

func main() {
	var k = koanf.New(".")
	if err := k.Load(file.Provider("sdktest.yaml"), yaml.Parser()); err != nil {
		log.Fatalf("error loading config: %v", err)
	}

	s := server.NewSDKTestServer(k)
	port := uint(k.MustInt("port"))

	ctx := kong.Parse(&CLI)
	switch ctx.Command() {
	case "autotest":
		go s.Start(port)
		fmt.Fprintf(color.Output, "%s", color.HiBlueString("Running autotest"))
		if CLI.Autotest.Serve || k.Bool("autotest.serve") {
			fmt.Fprintf(color.Output, "%s", color.BlackString(fmt.Sprintf(" (serving on http://localhost:%d)", port)))
		}
		fmt.Print("\n\n")
		autotest.Start(k)
	case "server":
		log.Printf("Starting sdktest server: http://localhost:%d\n", port)
		err := s.Start(port)

		if err != nil {
			fmt.Fprintf(color.Output, "%s", color.RedString(fmt.Sprintf("Failed to start server: %v\n", err)))

		}
	default:
		panic(ctx.Command())
	}
}
