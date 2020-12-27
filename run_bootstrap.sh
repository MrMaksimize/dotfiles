#!/usr/bin/env bash

ln -sf ~/Code/dotfiles/.bashrc ~/.bashrc;
ln -sf ~/Code/dotfiles/.aliases ~/.aliases;
ln -sf ~/Code/dotfiles/.bash_profile ~/.bash_profile
ln -sf ~/Code/dotfiles/.bash_prompt_pop ~/.bash_prompt
ln -sf ~/Code/dotfiles/.curlrc ~/.curlrc
ln -sf ~/Code/dotfiles/.editorconfig ~/.editorconfig
ln -sf ~/Code/dotfiles/.exports ~/.exports
ln -sf ~/Code/dotfiles/.gitattributes ~/.gitattributes
ln -sf ~/Code/dotfiles/.gitconfig ~/.gitconfig
ln -sf ~/Code/dotfiles/.gitignore ~/.gitignore
ln -sf ~/Code/dotfiles/.gvimrc ~/.gvimrc
ln -sf ~/Code/dotfiles/.hgignore ~/.hgignore
ln -sf ~/Code/dotfiles/.hushlogin ~/.hushlogin
ln -sf ~/Code/dotfiles/.wgetrc ~/.wgetrc
ln -sf ~/Code/dotfiles/.tmux.conf ~/.tmux.conf

source ~/.bashrc
