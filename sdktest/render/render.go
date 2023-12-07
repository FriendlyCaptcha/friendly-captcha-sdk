// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package render

import (
	"bytes"
	"errors"
	"fmt"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/friendlycaptcha/friendly-captcha/web/captchav2/friendly-captcha-sdk/sdktest/config"
)

var ErrTemplateNotFound = errors.New("template not found")

type TestCaseParameters struct {
	// Test case name
	Name      string
	Config    config.Config
	AssetPath string

	// Use compatiblity / polyfill scripts
	Compat bool
	// Use minified distribution
	Min bool
}

// Data that is available in the testcase's templates
type TestCaseRenderData struct {
	// Test case name
	Name                      string
	SiteJSPath                string
	ReCAPTCHACompatSiteJSPath string
	HCaptchaCompatSiteJSPath  string
	Config                    config.Config
	TestCaseDirFilepath       string
}

type TestCaseRenderResult struct {
	Body []byte
	Head []byte
}

// Basename is `site`, or `recaptcha-site`, or `hcaptcha-site`
func getSiteJSPath(basename string, compat bool, min bool) string {
	path := fmt.Sprintf("/static/dist/%s.js", basename)
	if compat {
		path = strings.ReplaceAll(path, ".js", ".compat.js")
	}
	if min {
		path = strings.ReplaceAll(path, ".js", ".min.js")
	}
	return path
}

func executeTemplateIfExists(t *template.Template, filename string, data TestCaseRenderData) ([]byte, error) {
	templ := t.Lookup(filename)
	if templ == nil {
		return nil, ErrTemplateNotFound
	}
	var buf bytes.Buffer
	err := templ.Execute(&buf, data)

	if err != nil {
		return nil, fmt.Errorf("template error: failed to render %s/%s: %v", data.Name, filename, err)
	}
	return buf.Bytes(), nil
}

func (r *TestCaseHandler) renderTestCase(params TestCaseParameters) (TestCaseRenderResult, error) {
	renderData := TestCaseRenderData{
		Name:                      params.Name,
		Config:                    params.Config,
		SiteJSPath:                getSiteJSPath("site", params.Compat, params.Min),
		ReCAPTCHACompatSiteJSPath: getSiteJSPath("recaptcha-site", params.Compat, params.Min),
		HCaptchaCompatSiteJSPath:  getSiteJSPath("hcaptcha-site", params.Compat, params.Min),
		TestCaseDirFilepath:       filepath.Join(r.testFolder, params.Name),
	}

	templates, err := template.ParseFS(r.fs, filepath.Join(params.Name, "*.tmpl.*"))
	if err != nil {
		return TestCaseRenderResult{}, fmt.Errorf("failed to parse templates in %s: %v", params.Name, err)
	}

	body, err := executeTemplateIfExists(templates, "body.tmpl.html", renderData)
	if err != nil {
		return TestCaseRenderResult{}, err
	}

	return TestCaseRenderResult{
		Body: body,
	}, nil
}
