#!/usr/bin/env perl

# ABOUT: when run, this executable updates the src file with the pomodoro development files

use warnings;
use strict;
use File::Slurp;

# Pomodoro.css
my $pomodoro_css_contents=read_file('./pomodoro.css');
open(FH, '>', '../../src/do_not_edit/pomodoro.css');
my $pomodoro_css="/*! Copied from developing/pomodoro/pomodoro.css */\n\n$pomodoro_css_contents";
print FH $pomodoro_css;

# Focus.css
my $focus_css_contents=read_file('./focus.css');
open(FH, '>', '../../src/do_not_edit/focus.css');
my $focus_css="/*! Copied from developing/pomodoro/focus.css */\n\n$focus_css_contents";
print FH $focus_css;

# Pomodoro.html
my $file_contents=read_file("./index.html");
$file_contents =~ /<!-- BEGIN Focus HTML -->(.*)<!-- END Focus HTML -->/s;
my $pomodoro_html="<!--! Copied from developing/pomodoro/index.html's <div id=\"focus__app\"> tag -->\n\n$1";
open(FH, '>', '../../src/do_not_edit/pomodoro.html');
print FH $pomodoro_html;

# Pomodoro.js
open(FH, '>', '../../src/do_not_edit/pomodoro.js');
$file_contents =~ /<script>(.*)<\/script>/s;
my $pomodoro_js="//! Copied from developing/pomodoro/index.html's <script> tags\n\n$1";
print FH $pomodoro_js;
