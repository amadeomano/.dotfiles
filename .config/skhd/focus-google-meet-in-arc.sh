#!/bin/bash

osascript -e 'tell application "Arc"
	tell first window
		set tabIndex to 1
		repeat with t in tabs
			if (URL of t contains "meet.google.com") then
				tell tab tabIndex to select
				activate
				return
			end if
			set tabIndex to tabIndex + 1
		end repeat
	end tell
end tell'
