#!/usr/bin/env perl

# ABOUT: when run, this executable updates the src file with the pomodoro development files

use warnings;
use strict;
use File::Slurp;

# Pomodoro.css
my $css_file_contents=read_file('./pomodoro.css');
open(FH, '>', '../../src/pomodoro.css');
my $pomodoro_css="/*! Copied from developing/pomodoro/pomodoro.css */\n\n$css_file_contents";
print FH $pomodoro_css;

# Pomodoro.html
my $file_contents=read_file("./index.html");
$file_contents =~ /<!-- BEGIN Focus HTML -->(.*)<!-- END Focus HTML -->/s;
my $pomodoro_html="<!--! Copied from developing/pomodoro/index.html's <div id=\"focus__focus-app\"> tag -->\n\n$1";
open(FH, '>', '../../src/pomodoro.html');
print FH $pomodoro_html;

# Pomodoro.js
open(FH, '>', '../../src/pomodoro.js');
$file_contents =~ /<script>(.*)<\/script>/s;
my $pomodoro_js="//! Copied from developing/pomodoro/index.html's <script> tags\n\n$1";
print FH $pomodoro_js;
