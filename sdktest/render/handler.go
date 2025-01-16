// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package render

import (
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"

	gotexttemplate "text/template"

	"github.com/friendlycaptcha/friendly-captcha/web/captchav2/friendly-captcha-sdk/sdktest/template"
	"github.com/knadh/koanf/v2"
)

// Renders (templated) testcases and their files
type TestCaseHandler struct {
	testFolder string
	fs         fs.FS
	k          *koanf.Koanf
}

func NewRenderHandler(k *koanf.Koanf) *TestCaseHandler {
	return &TestCaseHandler{
		testFolder: k.MustString("test_folder"),
		fs:         os.DirFS(k.MustString("test_folder")),
		k:          k,
	}
}

func (r *TestCaseHandler) HandleTestCaseListing(res http.ResponseWriter, req *http.Request) {
	// The test names are simply the names of the folders in the root folder.
	names := make([]string, 0)
	err := fs.WalkDir(r.fs, ".", func(path string, d fs.DirEntry, err error) error {
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

	err = template.RenderTestListing(res, template.TestCaseListingTemplateData{
		TestCases: names,
	})
	if err != nil {
		panic(err)
	}
}

func (r *TestCaseHandler) HandleTestCasePage(res http.ResponseWriter, req *http.Request) {
	params := r.getTestCaseParams(res, req)

	rd, err := r.renderTestCase(params)
	if err != nil {
		panic(err)
	}

	for k, v := range params.Config.Headers {
		res.Header().Set(k, v)
	}

	err = template.RenderTestCasePage(res, template.TestCaseTemplateData{
		Name:  params.Name,
		Title: fmt.Sprintf("%s | sdktest", params.Name),

		HTMLLang: params.Config.Language,

		Head: rd.Head,
		Body: rd.Body,
	})

	if err != nil {
		panic(err)
	}
}

func (r *TestCaseHandler) HandleTestAsset(res http.ResponseWriter, req *http.Request) {
	params := r.getTestCaseParams(res, req)

	templates, err := gotexttemplate.ParseFS(r.fs, filepath.Join(params.Name, "*.tmpl.*"))
	if err != nil {
		panic(fmt.Sprintf("Failed to parse template FS: %v", err))
	}

	renderData := TestCaseRenderData{
		Name:                      params.Name,
		Config:                    params.Config,
		SiteJSPath:                getSiteJSPath("site", params.Compat, params.Min),
		ReCAPTCHACompatSiteJSPath: getSiteJSPath("recaptcha-site", params.Compat, params.Min),
		HCaptchaCompatSiteJSPath:  getSiteJSPath("hcaptcha-site", params.Compat, params.Min),
		TestCaseDirFilepath:       filepath.Join(r.testFolder, params.Name),
	}

	ext := filepath.Ext(params.AssetPath)
	if ext == "js" || ext == ".ts" {
		scriptBytes, err := r.loadAndBuildScript(templates, params.AssetPath, renderData)
		if err != nil {
			panic(fmt.Sprintf("Failed to load and build script: %v", err))
		}

		res.Header().Add("Content-Type", "application/javascript")
		_, err = res.Write(scriptBytes)
		if err != nil {
			panic(err)
		}

		return
	}

	panic("Failed to serve unexpected path: " + params.AssetPath)
}
