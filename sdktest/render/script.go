// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package render

import (
	"fmt"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
)

func (r *TestCaseHandler) loadAndBuildScript(
	templates *template.Template,
	path string,
	renderData TestCaseRenderData,
) ([]byte, error) {
	scriptEntry, err := executeTemplateIfExists(templates, path, renderData)
	if err != nil {
		return nil, err
	}

	scriptEntryOut, err := r.buildScript(scriptEntry, renderData)
	if err != nil {
		return nil, fmt.Errorf("failed to build %s: %w", path, err)
	}
	return scriptEntryOut, nil
}

func (r *TestCaseHandler) buildScript(script []byte, renderData TestCaseRenderData) ([]byte, error) {
	result := api.Build(api.BuildOptions{
		Stdin: &api.StdinOptions{
			Contents:   string(script),
			ResolveDir: renderData.TestCaseDirFilepath,
			Loader:     api.LoaderTS,
		},

		Bundle:  true,
		Target:  api.ES2015,
		Format:  api.FormatIIFE,
		Outfile: "out.js",
		Write:   false,
	})

	if len(result.Errors) != 0 {
		return nil, fmt.Errorf("errors building JS code:\n%+v", result.Errors)
	}
	return result.OutputFiles[0].Contents, nil
}
