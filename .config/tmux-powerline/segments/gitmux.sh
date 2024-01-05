# A segment to use gitmux

run_segment() {
	gitmux -cfg $HOME/.config/tmux-powerline/gitmux.config $(tmux list-panes -F '#{pane_current_path}')
}
