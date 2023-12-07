// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package autotest

import (
	"fmt"
	"io/fs"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/fatih/color"
	"github.com/knadh/koanf/v2"
	"github.com/xxjwxc/gowp/workpool"
)

func getConcurrency(k *koanf.Koanf) int {
	con := k.Int("autotest.concurrency")

	if con < 0 {
		log.Fatal("Concurrency must be positive, or zero for number of cores")
	}

	if con == 0 {
		con = runtime.NumCPU()
	}

	return con
}

func findTests(k *koanf.Koanf) []string {
	tfs := os.DirFS(k.MustString("test_folder"))
	// The test names are simply the names of the folders in the root folder.
	names := make([]string, 0)
	err := fs.WalkDir(tfs, ".", func(path string, d fs.DirEntry, err error) error {
		if path == "." {
			return nil
		}
		if d.IsDir() {
			names = append(names, d.Name())
		}
		return nil
	})
	if err != nil {
		panic(err)
	}

	return names
}

func Start(k *koanf.Koanf) {
	testNames := findTests(k)

	if len(testNames) == 0 {
		log.Printf("No test files found")
		os.Exit(0)
	}

	runner := NewTestRunner(k)

	hadError := false
	start := time.Now()

	wp := workpool.New(getConcurrency(k))
	for _, p := range testNames {
		name := p
		wp.Do(func() error {
			result := runner.runTest(name)
			if result.Status == "FAIL" {
				hadError = true
			}

			runner.PrintTestResult(result)
			return nil
		})
	}
	wp.Wait()
	runner.cancelCtx()

	timing := color.HiBlackString(fmt.Sprintf("(%s)", time.Since(start)))
	if hadError {
		fmt.Fprintf(color.Output, "\n%s %s\n", color.RedString("Done testing, one or more tests failed"), timing)
	} else {
		fmt.Fprintf(color.Output, "\n%s %s\n", color.CyanString("Done testing"), timing)
	}

	if k.Bool("autotest.serve") {
		done := make(chan bool)
		<-done
	}

	if hadError {
		os.Exit(1)
	}
}
