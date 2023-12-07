// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package template

import (
	"embed"
	"io"
	"text/template"
)

//go:embed *.tmpl.html
var embedFS embed.FS

var templates *template.Template = template.Must(template.New("").ParseFS(embedFS, "*.tmpl.*"))

type TestCaseTemplateData struct {
	Title string
	Name  string

	HTMLLang                   string
	FriendlyCaptchaAPIEndpoint string

	Head []byte
	Body []byte
}

type TestCaseListingTemplateData struct {
	TestCases []string
}

func RenderTestCasePage(w io.Writer, data TestCaseTemplateData) error {
	return templates.ExecuteTemplate(w, "test.tmpl.html", data)
}

func RenderTestListing(w io.Writer, data TestCaseListingTemplateData) error {
	return templates.ExecuteTemplate(w, "test_listing.tmpl.html", data)
}
