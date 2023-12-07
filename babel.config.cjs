/*
Copyright (c) Friendly Captcha GmbH 2023.
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        exclude: ["transform-regenerator", "transform-async-to-generator"],
        targets: {
          browsers: ["since 2011", "not dead", "not ie <= 10", "not ie_mob <= 11"],
        },
        modules: "auto",
        useBuiltIns: false,
      },
    ],
  ],
};
