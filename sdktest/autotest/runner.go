// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package autotest

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/chromedp"
	"github.com/knadh/koanf/v2"
)

type TestStatus string

const (
	TestStatusUnstarted TestStatus = "unstarted"
	TestStatusRunning   TestStatus = "running"
	TestStatusFail      TestStatus = "fail"
	TestStatusPass      TestStatus = "pass"
	TestStatusSkip      TestStatus = "skip"
)

type JSError struct {
	Message      string `json:"message"`
	Stack        string `json:"stack"`
	LineNumber   int    `json:"lineNumber"`
	ColumnNumber int    `json:"columnNumber"`
	FileName     string `json:"fileName"`

	ErrorType string `json:"__error__"`
}

type TestResult struct {
	Name string
	URL  string

	// "PASS"" | "FAIL" | "SKIP"
	Status  TestStatus
	Message string

	Timing        time.Duration
	InternalError error
}

type sdkTestResult struct {
	State     TestStatus `json:"status"`
	RawErrors []JSError  `json:"rawErrors"`
	Errors    []string   `json:"errors"`
}

type sdkTestSuiteResult struct {
	State   TestStatus      `json:"status"`
	Results []sdkTestResult `json:"results"`
}

type TestRunner struct {
	ctx context.Context
	k   *koanf.Koanf

	cancelCtx context.CancelFunc
}

func NewTestRunner(k *koanf.Koanf) *TestRunner {
	opts := defaultAllocatorOptions[:]

	if k.Bool("autotest.headless") {
		opts = append(opts, chromedp.Headless)
	}
	execPath := k.String("autotest.browser_exec_path")
	if execPath != "" {
		opts = append(opts, chromedp.ExecPath(execPath))
	}

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	taskCtx, _ := chromedp.NewContext(allocCtx)

	// ensure the first tab is created (this way the browser doesn't keep getting closed)
	if err := chromedp.Run(taskCtx); err != nil {
		panic(err)
	}

	return &TestRunner{
		ctx:       taskCtx,
		cancelCtx: cancel,
		k:         k,
	}
}

func (r *TestRunner) runTest(name string) *TestResult {
	taskCtx, cancel := chromedp.NewContext(r.ctx)
	defer cancel()

	timeout := r.k.MustDuration("autotest.timeout")
	targetURL := fmt.Sprintf("http://localhost:%d/test/%s/", r.k.MustInt("port"), name)

	ctx, cancel := context.WithTimeout(taskCtx, timeout)
	defer cancel()

	tr := &TestResult{
		URL:    targetURL,
		Name:   name,
		Status: "FAIL", // We overwrite it in the other cases
	}
	defer func(t time.Time) {
		tr.Timing = time.Since(t)
	}(time.Now())

	err := chromedp.Run(ctx, chromedp.Navigate(targetURL))
	if err != nil {
		tr.InternalError = err
		tr.Message = "waiting for browser to open page"
		return tr
	}

	if err := chromedp.Run(ctx, chromedp.WaitReady("body")); err != nil {
		tr.InternalError = err
		tr.Message = "waiting for body"
		return tr
	}

	if err := chromedp.Run(ctx, chromedp.WaitReady(".sdktest-start")); err != nil {
		tr.InternalError = err
		tr.Message = "waiting to start"
		return tr
	}

	// We click so that the browser is focused, otherwise the focus event doesn't work in some cases for form elements.
	chromedp.Run(ctx, chromedp.MouseClickXY(0, 0))

	var testResult sdkTestSuiteResult
	if err := chromedp.Run(ctx, chromedp.Evaluate("window.sdktest.run()", &testResult, func(p *runtime.EvaluateParams) *runtime.EvaluateParams {
		return p.WithAwaitPromise(true)
	})); err != nil {
		tr.InternalError = err
		tr.Message = "retrieving test result from browser"
		return tr
	}

	tr.Status = testResult.State

	errMsg := ""
	for _, r := range testResult.Results {
		errMsg += strings.Join(r.Errors, "\n")
	}
	tr.Message = errMsg

	return tr
}
