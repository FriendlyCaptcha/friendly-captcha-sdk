# Friendly Captcha SDK

[![NPM Version badge](https://img.shields.io/npm/v/%40friendlycaptcha/sdk)](https://www.npmjs.com/package/@friendlycaptcha/sdk)

The SDK that is used to integrate Friendly Captcha into your website.

This is the code that runs on your website, inserting the captcha widget.

> ⚠️☝️ This is the SDK for **Friendly Captcha V2 only**, which is currently in preview only. You likely want to use the [SDK for Friendly Captcha v1](https://github.com/friendlycaptcha/friendly-challenge) instead.

## Installation

```shell
# using npm
npm install @friendlycaptcha/sdk

# using yarn
yarn add @friendlycaptcha/sdk
```

You can then use it in your library.

```js
import { FriendlyCaptchaSDK } from "@friendlycaptcha/sdk"

// Re-use this SDK if you are creating multiple widgets.
const sdk = new FriendlyCaptchaSDK();
```

```js
// HTML element that you want to mount the widget under.
const mount = document.querySelector("#my-widget-mount");

// Create the widget
const widget = sdk.createWidget({
    element: mount,
    sitekey: "<your sitekey>"
});
```

## Documentation

The documentation can be found in our [developer hub](https://developer.friendlycaptcha.com/docs/sdk/).

## Development

If you want to develop this SDK itself the following commands are useful

```shell
# install dependencies 
npm install

# minimal build
npm run build

# build for distribution (also builds docs)
npm run build:dist

# run the basic unit tests
npm run test
```

### sdktest
We include more proper end-to-end tests in the [**sdktest**](./sdktest/) tool folder.

### Updating the docusaurus SDK reference docs
We automatically generate markdown docs and translate these into files that are in a format that works for Docusaurus. You will then need to update the docs manually by deleting the old files and adding the new ones. Something like this:

```shell
 rm -rf ../friendly-docs/docs/sdk/reference && mkdir ../friendly-docs/docs/sdk/reference && cp -r ./build/docs/docusaurus/ ../friendly-docs/docs/sdk/reference/
```

### Adding license headers

```shell
# print those files that would be changed
npm run license-check-and-add -- check

# add the headers
npm run license-check-and-add -- add
```

## License
This is free software; you can redistribute it and/or modify it under the terms of the [Mozilla Public License Version 2.0](./LICENSE.md).

## Contributing
Contributions are welcome.

Prior to us being able to accept your contribution you will need to sign our CLA (Contributor License Agreement).
