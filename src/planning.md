# Focus for Google Docs
Extension that only shows text, not any controls. Adds a Pomodoro timer.

```js
// Pseudocode for Injected Code

$("#docs-chrome").display='none'; //header
$("#kix-horizontal-ruler-container").display='none'; //horizontal ruler
$("#kix-vertical-ruler-container").display='none'; //vertical ruler
$(".left-sidebar-container-content").display='none'; //TOC widget
$(".docs-explore-widget").display='none'; //explore icon
$('.kix-appview-editor')
    .height='100vh'; //make app fullscreen
    .backgroundColor='#fff'; //whatever background color


// TODO: Add a pomodoro timer widget in the top right

```