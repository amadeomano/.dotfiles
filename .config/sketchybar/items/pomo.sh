#!/usr/bin/env sh

sketchybar --add item     pomo right                   \
           --set pomo     update_freq=1                \
                          label.width=110              \
                          label.color=$BLACK           \
                          label.drawing=on             \
                          align=center                 \
                          script="$PLUGIN_DIR/pomo.sh" \
                          background.color=0xffb8c0e0  \
                          background.height=26         \
                          background.corner_radius=11



                          # label.padding_right=15       \
                          # icon=🍅                      \
                          # icon.padding_left=10         \
                          # icon.align=left              \
