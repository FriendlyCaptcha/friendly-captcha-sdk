// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package render

import (
	"fmt"
	"net/http"

	"github.com/evanw/esbuild/pkg/api"
)

func (r *TestCaseHandler) HandleSDKTestLibScript(res http.ResponseWriter, req *http.Request) {
	result := api.Build(api.BuildOptions{
		EntryPoints: []string{
			"./sdktestlib/main.ts",
		},
		Bundle:  true,
		Target:  api.ES2015,
		Format:  api.FormatIIFE,
		Outfile: "out.js",
		Write:   false,
	})

	if len(result.Errors) != 0 {
		panic(fmt.Errorf("errors building SDKTestLib JS code:\n%+v", result.Errors))
	}

	res.Header().Add("Content-Type", "application/javascript")
	res.Write(result.OutputFiles[0].Contents)

}
