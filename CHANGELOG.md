# changelog

## Unreleased

* Encode debug information in the response in case the user agent can not connect to Friendly Captcha at all.

## 0.1.30

* Add a specific error code that represents the widget being unreachable.

## 0.1.29

* Localize placeholder texts and error messages.

## 0.1.28

* Improve fallback message after all retries failed.

## 0.1.27

* Add fallback message after all retries failed.
* Decrease agent and widget timeouts.

## 0.1.26

* Fix a bug that caused the SDK to fail to load on some older browsers.

## 0.1.25

* Correctly position the banner for right-to-left languages.

## 0.1.24

* Localize iframe title when the widget language changes.

## 0.1.23

* Increase banner text contrast ratio.

## 0.1.22

* Increase agent and widget timeouts.

## 0.1.21

* Improve performance by throttling stack trace generation.

## 0.1.20

* Add a `title` attribute to the widget iframe for accessibility.
* Limits the size of an internal queue to prevent a memory leak which became an issue when calling certain functions on every frame or browser event.

## 0.1.19

* Make agent and widget iframe retry timeouts exponential

## 0.1.18

* Defer initialization of `document.body` event listeners until DOM is ready.

## 0.1.17

* Fixed a regression that broken configuring widget API endpoints in the SDK constructor.

## 0.1.16

* Fixed a bug that sometimes caused widget timeout errors when using the `eu` API endpoint.

## 0.1.15

* Allowed disabling of the `window.eval` patching using `disableEvalPatching` when creating the SDK.

## 0.1.14

* Removed debug message printed to console when a message was ignored from a non-Friendly Captcha iframe source.

## 0.1.13

* Remove patching of `Promise.prototype.constructor` to avoid issues with Angular and other libraries that extend or overwrite `Promise`.

## 0.1.12

* Change how we patch Promise to avoid issues with libraries that extend/overwrite it (Angular with zones in particular).

## 0.1.11

* Fix wrapping of Promise constructor, which lead to issues in Chrome <= 45 (released September 2015) and Firefox <= 40.

## 0.1.10

* Fix use of ES features in non-compat build, which caused Safari 11.1 and 12.1 to fail to load the SDK.
* The minified bundle size has been reduced (4%).

## 0.1.9

* Fix `deviceorientation` and `devicemotion` deprecation warnings in Firefox browsers on desktop.
* Fix a bug that was breaking the `toString()` method of some browser built-ins.

## 0.1.8
**Date**: 2024-06-20

* The root element the widget is mounted to is no longer deleted when `Destroy()` is called.

## 0.1.7
**Date**: 2024-04-19

* Use `frcWidget` property instead of `data-attached` attribute to check if the widget has been attached

## 0.1.6
**Date**: 2024-04-09

* Added `title` attribute to widget error data

## 0.1.5
**Date**: 2024-01-22

* Fix for shorthands (`"eu"`, `"global"`) `api-endpoint` not working on widget HTML elements.
* Internal changes around storage (prefering `SessionStorage` over anything persistent between sessions).

## 0.1.4
**Date**: 2024-01-16

* Compatibility improvements for Internet Explorer 11 and Safari 10.1 (and older).

## 0.1.3
**Date**: 2024-01-02

* Fixed documentation generation.

## 0.1.2
**Date**: 2023-12-13

* Removed some unused typings, renamed some things to save on bundle size a bit.

## 0.1.1
**Date**: 2023-12-12

* Library and built script files are no longer in the `dist` folder, so you can remove `/dist` from import/script paths.

## 0.1.0
**Date**: 2023-12-08

Initial release.
