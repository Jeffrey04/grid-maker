# Grid Maker

A library to make responsive grid boxes for whatever purposes.

## Pre-requisites

* jQuery
* Underscore.js

## Usage

### Initialization

```
$('#element').grid({
        width: function() { return $(window).width() },
        height: function() { return $(window).height() },
        row: 10,
        column: 10,
        margin_px: 1,
        border_px: 1,
        border_color: '#CCC',
        classes: {row: '',
                  block: ''}
})
```

All the options are optional
* `width`: a function to calculate the width of the row, the context (keyword `this`) is the raw / undecorated element, default takes the width of the `window`
* `height`: a function to calculate the total height of the grid, the context (keyword `this`) is the raw / undecorated element, default takes the height of the `window`
* `row`: number of rows, default `10`
* `column`: number of columns, default `10`
* `margin_px`: number of pixels between blocks, default `1`
* `border_px`: the width of border, in pixels, default `1`
* `border_color`: the color of the border, default `#CCC`,
* `classes.row`: the values to put into `$('.row', $('#element')).addClass`, default empty string
* `classes.block`: the values to put into `$('.block', $('#element')).addClass`, default empty string

### Events

The plugin is event-based, therefore custom event handlers can be bounded to them for extensibility.

#### board:init

This event is triggered whenever the board is initializing to generate a list of rows. Custom event handlers can be bounded to `board:init:pre` and/or `board:init:post` (before and after event respectively). The event handler can be attached as follows:

```
$('#element').grid()
             .trigger('board:init:pre', // or 'board:init:post'
                      function(_event, context, options) {
                      })
```

The event handler is defined as follows
* `_event`: the jQuery event object
* `context`: the element that called `.grid()`
* `options`: complete options for the grid
* `this`: refers to the element that called `.grid()`

#### board:resize

This event is triggered whenever a `window.resize` event is fired to resize the rows and blocks. Custom event handlers can be bounded to `board:resize:pre` and/or `board:resize:post`, with the same event handler as defined in the `board:init` section.

#### board:row:init

This event is fired by the event handler of `board:init` to generate a list of blocks. Custom event handlers can be bounded to `board:row:init:pre` and/or `board:row:init:post`, with the same event handler as defined in the `board:init` section. However `this` in the event handler refers to the `row` element.

#### board:row:resize

This event is fired by the event handler of `board:resize` to resize the row width. Custom event handlers can be bounded to `board:row:resize:pre` and/or `board:row:resize:post`, with the same event handler as defined in the `board:init` section. However `this` in the event handler refers to the `row` element. However `this` in the event handler refers to the `row` element.

#### board:block:init

The event is fired by the event handler of `board:row:init` to resize the initialize the block. Custom event handlers can be bounded to `board:block:init:pre` and/or `board:block:init:post`, with the same event handler as defined in the `board:init` section. However `this` in the event handler refers to the `block` element.

#### board:block:resize

The event is fired by the event handler of `board:row:resize` to resize the block. Custom event handlers can be bounded to `board:block:resize:pre` and/or `board:block:resize:post`, with the same event handler as defined in the `board:init` section. However, `this` in the event handler refers to the `block` element.

#### board:block:get

Users can fire this event to get a block by `x`, `y` (`column`, `row`) coordinates. The found block is to be used as the context (`this` keyword) of the supplied `callback` function.

```
var x = 0, y = 0,
    callback = function() { var found_block = this }

$('#element`).grid()
             .trigger('board:block:get', [x, y, callback])
```

The arguments to the event handler are

* `x`: the index of row
* `y`: the index of column
* `callback`: a function to be called, where its `this` refers to the found block

#### board:block:list

Users can fire this event to get a list of blocks by `x`, `y` (`column`, `row`) coordinates. The resulting array of blocks is then to be used as the context (`this` keyword) of the supplied callback function.

```
var list = [[0, 0], [0, 1]],
    callback = function() { var found_blocks = this }

$('#element`).grid()
             .trigger('board:block:get', [x, y, callback])
```

The arguments to the event handler are

* `list`: An array of coordinates, in the sequence of `x`, `y` (or `column`, `row`).
* `callback`: a function to be called, where its `this` refers to the list of found blocks
