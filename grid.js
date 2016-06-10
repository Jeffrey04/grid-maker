(function() {

function block_size(context, options) {
    return Math.floor(Math.min(((options.width.call(context) - block_gutter_size(options, true)) / options.column) - 1,
                               ((options.height.call(context) - block_gutter_size(options, false)) / options.row)) - 1)
}

function block_gutter_size(options, is_column) {
    return (options.margin_px + options.border_px) * (is_column ? options.column : options.row)
}

function block_init(_event, context, options, col_idx, size) {
    $(this)
        .trigger('board:block:init:pre', [context, options])
        .addClass('block')
        .addClass(options.classes.block)
        .width(size)
        .height(size)
        .data('column', col_idx)
        .css({
            'float': 'left',
            'margin-right': options.margin_px + 'px',
            'margin-bottom': options.margin_px + 'px',
            'border-width': options.border_px + 'px',
            'border-style': 'solid',
            'border-color': options.border_color
        })
        .trigger('board:block:init:post', [context, options])
}

function block_resize(_event, context, options, size) {
    $(this)
        .trigger('board:block:resize:pre', [context, options])
        .width(size).height(size)
        .trigger('board:block:resize:post', [context, options])
}

function board_get_block(_event, col_idx, row_idx, callback) {
    callback.call($('.block', $('.row', this).get(row_idx)).get(col_idx))
}

function board_list_block(_event, list, callback) {
    callback.call(
        $.map(list,
              (function(context) {
                  return function(coordinates) {
                      return $('.block', $('.row', context).get(_.last(coordinates)))
                          .get(_.first(coordinates))
                  }
              })(this)))
}

function board_init(_event, context, options) {
    $(this)
        .trigger('board:init:pre', [context, options])
        .append(
            $.map(
                _.range(options.row),
                function(row_idx) {
                    return $(document.createElement('div'))
                        .on('board:row:init', row_init)
                        .on('board:row:resize', row_resize)
                        .trigger('board:row:init', [context,
                                                    options,
                                                    row_idx,
                                                    block_size(context, options)])
                }))
        .append($.parseHTML('<br style="clear: both;" />'))
        .trigger('board:init:post', [context, options])
}

function board_resize(_event, context, options) {
    $('.row', this)
        .trigger('board:resize:pre', [context, options])
        .trigger('board:row:resize', [this, options, block_size(this, options)])
        .trigger('board:resize:post', [context, options])
}

function row_init(_event, context, options, row_idx, size) {
    $(this)
        .trigger('board:row:init:pre', [context, options])
        .addClass('row')
        .addClass(options.classes.row)
        .width(options.width.call(context))
        .css({
            'float': 'left',
            'clear': 'left'
        })
        .data('row', row_idx)
        .append(
            $.map(
                _.range(options.column),
                function(col_idx) {
                    return $(document.createElement('div'))
                        .on('board:block:init', block_init)
                        .on('board:block:resize', block_resize)
                        .trigger('board:block:init', [context, options, col_idx, size])
                }
            ))
        .trigger('board:row:init:post', [context, options])
}

function row_resize(_event, context, options, size) {
    $(this)
        .trigger('board:row:resize:pre', [context, options])
        .width(options.width.call(context))
        .find('.block')
        .trigger('board:block:resize', [context, options, size])
        .trigger('board:row:resize:post', [context, options])
}

$.fn.grid = function(_options) {
    var options = $.extend({
        width: function() { return $(window).width() },
        height: function() { return $(window).height() },
        row: 10,
        column: 10,
        margin_px: 1,
        border_px: 1,
        border_color: '#CCC',
        classes: {row: '',
                  block: ''}
    }, _options)

    $(this).on('board:init', board_init)
        .on('board:resize', board_resize)
        .on('board:block:get', board_get_block)
        .on('board:block:list', board_list_block)
        .trigger('board:init', [this, options])

    $(window).resize(
            this,
            _.debounce(function(_event) {
                            $(_event.data)
                                .trigger('board:resize', [_event.datk, options])
                       },
                       500))
}

})()
