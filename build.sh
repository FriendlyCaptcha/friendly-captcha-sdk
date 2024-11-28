#!/bin/bash
# Copyright (c) Friendly Captcha GmbH 2023.
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

set -euo pipefail

rm -rf dist/*
rm -rf build/*

mkdir -p dist
mkdir -p build
mkdir -p build/bundle/contrib

version=$(node -p "require('./package.json').version")
# echo "Building version $version"

# Build site and library entry
esbuild src/entry/sdk.ts --bundle --outfile=build/bundle/sdk.js --format=esm --target=es6 --define:SDK_VERSION=\"$version\" --legal-comments=eof

esbuild src/entry/site.ts --bundle --outfile=build/bundle/site.js --target=es6 --define:SDK_VERSION=\"$version\" --legal-comments=eof
esbuild src/entry/recaptcha-site.ts --bundle --outfile=build/bundle/contrib/recaptcha-site.js --target=es6 --define:SDK_VERSION=\"$version\" --legal-comments=eof
esbuild src/entry/hcaptcha-site.ts --bundle --outfile=build/bundle/contrib/hcaptcha-site.js --target=es6 --define:SDK_VERSION=\"$version\" --legal-comments=eof

# Babelize the site bundle

if [ -z "${SKIP_BABEL:-}" ]; then
    echo "Running babel"
    babel build/bundle/site.js -o build/bundle/site.compat.nopolyfill.js --config-file ./babel.config.cjs
    babel build/bundle/contrib/recaptcha-site.js -o build/bundle/contrib/recaptcha-site.compat.nopolyfill.js --config-file ./babel.config.cjs
    babel build/bundle/contrib/hcaptcha-site.js -o build/bundle/contrib/hcaptcha-site.compat.nopolyfill.js --config-file ./babel.config.cjs
else
    echo "Skipping babel"
    cp build/bundle/site.js build/bundle/site.compat.nopolyfill.js
    cp build/bundle/contrib/recaptcha-site.js build/bundle/contrib/recaptcha-site.compat.nopolyfill.js
    cp build/bundle/contrib/hcaptcha-site.js build/bundle/contrib/hcaptcha-site.compat.nopolyfill.js
fi

# Add polyfills
cat src/polyfill/polyfills.min.js build/bundle/site.compat.nopolyfill.js > build/bundle/site.compat.js
cat src/polyfill/polyfills.min.js build/bundle/contrib/recaptcha-site.compat.nopolyfill.js > build/bundle/contrib/recaptcha-site.compat.js
cat src/polyfill/polyfills.min.js build/bundle/contrib/hcaptcha-site.compat.nopolyfill.js > build/bundle/contrib/hcaptcha-site.compat.js

echo "Minifying"

# Minify
terser build/bundle/site.js -o build/bundle/site.min.js --config-file ./terser.json
terser build/bundle/contrib/recaptcha-site.js -o build/bundle/contrib/recaptcha-site.min.js --config-file ./terser.json
terser build/bundle/contrib/hcaptcha-site.js -o build/bundle/contrib/hcaptcha-site.min.js --config-file ./terser.json

terser build/bundle/site.compat.js -o build/bundle/site.compat.min.js --config-file ./terser.json
terser build/bundle/contrib/recaptcha-site.compat.js -o build/bundle/contrib/recaptcha-site.compat.min.js --config-file ./terser.json
terser build/bundle/contrib/hcaptcha-site.compat.js -o build/bundle/contrib/hcaptcha-site.compat.min.js --config-file ./terser.json

############## Remove nopolyfill versions of recaptcha and hcaptcha compat builds.
# I don't think nopolyfill version makes sense for site.js.. Users that really want it can minify it themselves.
rm build/bundle/contrib/recaptcha-site.compat.nopolyfill.js
rm build/bundle/contrib/hcaptcha-site.compat.nopolyfill.js

terser build/bundle/site.compat.nopolyfill.js -o build/bundle/site.compat.nopolyfill.min.js --config-file ./terser.json

echo "Copying to dist"

cp src/polyfill/polyfills.min.js build/bundle/polyfills.min.js

cp -r build/bundle/* dist

# Print stats
ls -l dist/

echo "Build finished"