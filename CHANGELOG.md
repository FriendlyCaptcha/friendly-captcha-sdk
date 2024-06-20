# changelog

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
