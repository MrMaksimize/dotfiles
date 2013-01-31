#!/bin/bash
export REPO_PATH="/Users/mpecherskiy/.dotfiles_repo/"
export HOME_DIR_PATH="/Users/mpecherskiy/"
export BAK_PREFIX="old_"

for file in .{bash_profile,bashrc,extra,bash_prompt,exports,gitconfig,aliases,functions,paths,git-completion.sh}; do
	echo "$HOME_DIR_PATH$file";
	mv "$HOME_DIR_PATH$file" "$HOME_DIR_PATH$BAK_PREFIX$file";
	ln -s "$REPO_PATH$file" "$HOME_DIR_PATH$file";
done