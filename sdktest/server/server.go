// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package server

import (
	"fmt"
	"net/http"

	"github.com/friendlycaptcha/friendly-captcha/web/captchav2/friendly-captcha-sdk/sdktest/render"
	"github.com/gorilla/mux"
	"github.com/knadh/koanf/v2"
)

type SDKTestServer struct {
	router   *mux.Router
	renderer *render.TestCaseHandler
}

func NewSDKTestServer(k *koanf.Koanf) *SDKTestServer {
	r := mux.NewRouter()
	h := render.NewRenderHandler(k)

	distFileServer := http.FileServer(http.Dir("../dist"))
	publicFileServer := http.FileServer(http.Dir("./public"))
	r.PathPrefix("/static/dist/").Handler(http.StripPrefix("/static/dist/", distFileServer))
	r.PathPrefix("/static/public/").Handler(http.StripPrefix("/static/public/", publicFileServer))

	r.HandleFunc("/scripts/sdktestlib.js", h.HandleSDKTestLibScript)
	r.HandleFunc("/test/", h.HandleTestCaseListing)
	r.HandleFunc("/test/{name}/", h.HandleTestCasePage)
	r.HandleFunc("/test/{name}/{asset_path:.*}", h.HandleTestAsset)
	r.Handle("/", http.RedirectHandler("/test/", http.StatusTemporaryRedirect))

	return &SDKTestServer{
		router:   r,
		renderer: h,
	}
}

func (s *SDKTestServer) Start(port uint) error {
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), s.router)
	return err
}
