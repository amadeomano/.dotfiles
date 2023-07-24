# A segment to use gitmux

run_segment() {
	gitmux $(tmux list-panes -F '#{pane_current_path}')
}
