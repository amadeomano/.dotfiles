#!/bin/bash

arc_main_window_id=$(yabai -m query --windows | jq '.[] | select(.app=="Arc" and .subrole == "AXStandardWindow") | .id' | head -n 1)

if [ -n "$arc_main_window_id" ]; then
  yabai -m window --focus "$arc_main_window_id"
else
  open -a '/Applications/Arc.app' --args --force-prefers-no-reduced-motion
fi

