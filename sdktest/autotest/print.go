// Copyright (c) Friendly Captcha GmbH 2023.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
package autotest

import (
	"context"
	"errors"
	"fmt"

	"github.com/fatih/color"
)

func (r *TestRunner) PrintTestResult(tr *TestResult) {
	timing := color.HiBlackString(fmt.Sprintf("(%s)", tr.Timing))

	switch tr.Status {
	case "fail":
		// In serve mode we display a link to click for quick debugging
		serveMsg := ""
		if r.k.Bool("autotest.serve") {
			serveMsg = fmt.Sprintf("%s %s\n", color.HiBlackString("^^^^"), color.HiBlackString(tr.URL))
		}

		if errors.Is(tr.InternalError, context.DeadlineExceeded) { // Timeout in waiting for the notebook to load or run
			fmt.Fprintf(
				color.Output,
				"%s %s %s %s\n%s",
				color.HiRedString("FAIL"),
				tr.Name,
				color.YellowString((fmt.Sprintf("Timeout exceeded (%s)", r.k.MustDuration("autotest.timeout")))),
				tr.Message,
				serveMsg,
			)
		} else if tr.InternalError != nil { // Something else went wrong talking to the browser
			fmt.Fprintf(
				color.Output,
				"%s %s %s %s %s\n%s",
				color.HiRedString("FAIL"),
				tr.Name,
				color.YellowString((fmt.Sprintf("AUTOTEST ERROR: %s", tr.InternalError.Error()))),
				tr.Message,
				timing,
				serveMsg,
			)
		} else { // Ordinary fail (something was thrown in the notebook)
			fmt.Fprintf(color.Output, "%s %s %s %s\n%s", color.HiRedString("FAIL"), tr.Name, color.RedString(tr.Message), timing, serveMsg)
		}
	case "pass":
		fmt.Fprintf(color.Output, "%s %s %s\n", color.GreenString("PASS"), tr.Name, timing)
	case "skip":
		fmt.Fprintf(color.Output, "%s %s %s\n", color.YellowString("SKIP"), color.HiBlackString(tr.Name), timing)
	default: // Should never happen
		fmt.Fprintf(color.Output, "%s %s %s\n", color.HiRedString("ERROR Invalid Test Result status: "), tr.Name, timing)
	}
}
