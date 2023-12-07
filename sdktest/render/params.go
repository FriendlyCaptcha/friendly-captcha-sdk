// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package render

import (
	"bytes"
	"net/http"
	"os"
	"path/filepath"
	gotexttemplate "text/template"

	"github.com/friendlycaptcha/friendly-captcha/web/captchav2/friendly-captcha-sdk/sdktest/config"
	"github.com/gorilla/mux"
	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/providers/rawbytes"
)

func (r *TestCaseHandler) getTestCaseParams(res http.ResponseWriter, req *http.Request) TestCaseParameters {
	v := mux.Vars(req)
	testCaseName := v["name"]
	// Clone the global sdktest config
	k := r.k.Copy()

	// Load the additional config.yaml from the testcase folder into it (to allow overwriting)

	filepathTemplateYaml := filepath.Join(r.testFolder, testCaseName, "config.tmpl.yaml")
	if _, err := os.Stat(filepathTemplateYaml); err == nil || os.IsExist(err) { // Render the yaml template

		var globalConf config.Config
		k.Unmarshal("", &globalConf)

		tpl, err := gotexttemplate.ParseFiles(filepathTemplateYaml)
		if err != nil {
			panic("Failed to load yaml template: " + err.Error())
		}

		var buf bytes.Buffer
		err = tpl.Execute(&buf, TestCaseRenderData{
			Name:       testCaseName,
			SiteJSPath: "",
			Config:     globalConf,
		})
		if err != nil {
			panic("Failed to render yaml template: " + err.Error())
		}

		k.Load(rawbytes.Provider(buf.Bytes()), yaml.Parser())
	} else { // Load the yaml file as is
		k.Load(file.Provider(filepath.Join(r.testFolder, testCaseName, "config.yaml")), yaml.Parser())
	}

	var conf config.Config
	k.Unmarshal("", &conf)

	params := TestCaseParameters{
		Name:      testCaseName,
		Config:    conf,
		Compat:    req.URL.Query().Has("compat"),
		Min:       req.URL.Query().Has("min"),
		AssetPath: v["asset_path"],
	}

	return params
}
