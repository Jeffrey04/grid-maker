import {
	debounce,
	first,
	last,
	range,
} from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

function block_size(context, options) {
	return Math.floor(
		Math.min(
			(options.width.call(context) - block_gutter_size(options, true)) /
				options.column -
				1,
			(options.height.call(context) - block_gutter_size(options, false)) /
				options.row,
		) - 1,
	);
}

function block_gutter_size(options, is_column) {
	return (
		(options.margin_px + options.border_px) *
		(is_column ? options.column : options.row)
	);
}

function block_init(event) {
	const { context, options, col_idx, size } = event.detail;

	event.target.dispatchEvent(
		new CustomEvent("board:row:init:pre", { detail: { context, options } }),
	);

	event.target.style.width = `${size}px`;
	event.target.style.height = `${size}px`;
	event.target.dataset.column = col_idx;
	event.target.style.float = "left";
	event.target.style.marginRight = `${options.margin_px}px`;
	event.target.style.marginBottom = `${options.margin_px}px`;
	event.target.style.borderWidth = `${options.border_px}px`;
	event.target.style.borderStyle = "solid";
	event.target.style.borderColor = options.border_color;
	event.target.classList.add("block");
	if (options.classes.block) {
		event.target.classList.add(options.classes.block);
	}

	event.target.dispatchEvent(
		new CustomEvent("board:row:init:post", { detail: { context, options } }),
	);
}

function block_resize(event) {
	const { context, options, size } = event.detail;

	event.target.dispatchEvent(
		new CustomEvent("board:block:resize:pre", { detail: { context, options } }),
	);

	event.target.style.width = `${size}px`;
	event.target.style.height = `${size}px`;

	event.target.dispatchEvent(
		new CustomEvent("board:block:resize:post", {
			detail: { context, options },
		}),
	);
}

function row_init(event) {
	const { context, options, row_idx, size } = event.detail;

	event.target.dispatchEvent(
		new CustomEvent("board:row:init:pre", { detail: { context, options } }),
	);

	event.target.style.width = `${options.width.call(context)}px`;
	event.target.style.float = "left";
	event.target.style.clear = "left";
	event.target.dataset.row = row_idx;
	event.target.classList.add("row");
	if (options.classes.row) {
		event.target.classList.add(options.classes.row);
	}

	// biome-ignore lint/complexity/noForEach: <explanation>
	range(options.column).forEach((col_idx) => {
		const elem = document.createElement("div");

		event.target.appendChild(elem);

		elem.addEventListener("board:block:init", block_init);
		elem.addEventListener("board:block:resize", block_resize);

		elem.dispatchEvent(
			new CustomEvent("board:block:init", {
				detail: {
					context,
					options,
					col_idx,
					size,
				},
			}),
		);
	});

	event.target.dispatchEvent(
		new CustomEvent("board:row:init:post", { detail: { context, options } }),
	);
}

function row_resize(event) {
	const { context, options, size } = event.detail;

	event.target.dispatchEvent(
		new CustomEvent("board:row:resize:pre", { detail: { context, options } }),
	);

	event.target.style.width = `${options.width.call(context)}px`;

	// biome-ignore lint/complexity/noForEach: <explanation>
	event.target.querySelectorAll(".block").forEach((block) => {
		block.dispatchEvent(
			new CustomEvent("board:block:resize", {
				detail: { context, options, size },
			}),
		);
	});

	event.target.dispatchEvent(
		new CustomEvent("board:row:resize:post", { detail: { context, options } }),
	);
}

function board_init(event) {
	const { options } = event.detail;

	event.target.dispatchEvent(
		new CustomEvent("board:init:pre", {
			detail: { context: event.target, options },
		}),
	);

	// biome-ignore lint/complexity/noForEach: <explanation>
	range(options.row).forEach((row_idx) => {
		const elem = document.createElement("div");
		const br = document.createElement("br");
		br.style.clear = "both";

		event.target.appendChild(elem);
		event.target.appendChild(br);

		elem.addEventListener("board:row:init", row_init);
		elem.addEventListener("board:row:resize", row_resize);
		elem.dispatchEvent(
			new CustomEvent("board:row:init", {
				detail: {
					context: event.target,
					options,
					row_idx,
					size: block_size(event.target, options),
				},
			}),
		);
	});

	event.target.dispatchEvent(
		new CustomEvent("board:init:post", {
			detail: { context: event.target, options },
		}),
	);
}

function board_resize(event) {
	const { options } = event.detail;

	event.target.dispatchEvent(
		new CustomEvent("board:resize:pre", {
			detail: { context: event.target, options },
		}),
	);

	// biome-ignore lint/complexity/noForEach: <explanation>
	event.target.querySelectorAll(".row").forEach((row) => {
		row.dispatchEvent(
			new CustomEvent("board:row:resize", {
				detail: {
					context: event.target,
					options,
					size: block_size(event.target, options),
				},
			}),
		);
	});

	event.target.dispatchEvent(
		new CustomEvent("board:resize:post", {
			detail: { context: event.target, options },
		}),
	);
}

function board_get_block(event) {
	const { x, y, callback } = event.detail;

	callback.call(
		event.target.querySelectorAll(".row")[y].querySelectorAll(".block")[x],
	);
}

function board_list_block(event) {
	const { list, callback } = event.detail;

	list.map((coordinates) => {
		return callback.call(
			event.target
				.querySelectorAll(".row")
				[last(coordinates)].querySelectorAll(".block")[first(coordinates)],
		);
	});
}

export default function grid_maker(selectors, user_options) {
	const options = {
		width: () => window.innerWidth,
		height: () => window.innerHeight,
		row: 10,
		column: 10,
		margin_px: 1,
		border_px: 1,
		border_color: "#CCC",
		classes: { row: "", block: "" },
		...user_options,
	};
	const elem = document.querySelector(selectors);

	elem.addEventListener("board:init", board_init);
	elem.addEventListener("board:resize", board_resize);
	elem.addEventListener("board:block:get", board_get_block);
	elem.addEventListener("board:block:list", board_list_block);

	elem.dispatchEvent(new CustomEvent("board:init", { detail: { options } }));

	window.addEventListener(
		"resize",
		debounce((event) =>
			elem.dispatchEvent(
				new CustomEvent("board:resize", { detail: { options } }),
			),
		),
	);
}
