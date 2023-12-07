// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package config

type Config struct {
	Sitekey     string            `koanf:"sitekey"`
	APIEndpoint string            `koanf:"api_endpoint"`
	Language    string            `koanf:"language"`
	Port        string            `koanf:"port"`
	Headers     map[string]string `koanf:"headers"`
}
