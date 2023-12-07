# sdktest

**sdktest** is a tool for testing our SDK in all kinds of scenario's, end-to-end, in different browsers.

**sdktest** is not designed to be beautiful, fast or elegant, it only has to do its job well.


## Getting Started
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
