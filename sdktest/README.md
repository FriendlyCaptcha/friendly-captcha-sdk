# sdktest

**sdktest** is a tool for testing our SDK in all kinds of scenarios, end-to-end, in different browsers.

**sdktest** is not designed to be beautiful, fast or elegant, it only has to do its job well.

## Getting Started

* Ensure you've built the SDK (in the parent folder, `npm run build`)
* Install Go for your device (`brew install go`)
* Create a config file in the root of this folder called `sdktest.yaml`, [`sdktest.example.yaml`](./sdktest.example.yaml) should provide a good starting point.
* Run `go run main.go server` and point your browser at [`localhost:8912`](http://localhost:8912).

## Running autotest

Autotest allows one to run all the tests from the commandline using an instrumented browser.

```shell
go run main.go autotest
# Or with serve, to keep the server alive too for headful debugging.
go run main.go autotest --serve
```

## A note on widget interactivity

By default, widgets require the web user to click the checkbox in order to complete. This means
that the test cases that expect a widget to complete will---under the default conditions---fail with a `TimeoutError` unless you manually click the checkbox. This is expected behavior, and you can make the tests pass by clicking the checkboxes.

There is a way to make the tests pass without requiring manual clicking, and it involves using a sitekey for an application whose widget mode is set to `noninteractive`. Widgets with that mode can complete without any additional interaction from the web user.
