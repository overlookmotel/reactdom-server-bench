/* --------------------
 * ReactDOM Server simple benchmark
 * ------------------*/

/* eslint-disable no-console */
'use strict';

// Put in production mode
process.env.NODE_ENV = 'production';

// Modules
const React = require('react'),
	Benchmark = require('benchmark');

// Load versions
const ReactDOMServer = require('./react builds/master/react-dom/server'),
	ReactDOMServerAmended = require('./react builds/amended/react-dom/server');

// Create element function
function createElement(numElements) {
	const args = ['div', null];

	for (let i = 0; i < numElements; i++) {
		args.push(React.createElement('div', null, i + ''));
	}

	const e = React.createElement.apply(React, args);
	return e;
}

// Run benchmark
const BASELINE = 'master';
const versions = {
	[BASELINE]: ReactDOMServer,
	amended: ReactDOMServerAmended
};

const variations = [10, 100, 1000, 10000];

let e;
const bench = new Benchmark.Suite();
bench.add(
	'warm up',
	() => {
		ReactDOMServer.renderToString(e);
		ReactDOMServerAmended.renderToString(e);
	},
	{onStart: () => e = createElement(1000)}
);

const results = [];
for (let numElements of variations) {
	const result = {numElements, means: {}};
	results.push(result);

	for (let name in versions) {
		const ReactDOMServer = versions[name];

		bench.add(
			`${name} (${numElements} elements)`,
			// eslint-disable-next-line no-loop-func
			() => ReactDOMServer.renderToString(e),
			{
				// eslint-disable-next-line no-loop-func
				onStart: () => e = createElement(numElements),
				onComplete: event => {
					//console.log(String(event.target));
					//console.log(event.target);
					result.means[name] = event.target.stats.mean;
				}
			}
		);
	}
}

bench.on('cycle', function(event) {
	console.log(String(event.target));
});

bench.on('complete', () => {
	for (let result of results) {
		for (let name in result.means) {
			if (name === BASELINE) continue;
			console.log(`${result.numElements} elements: ${name} faster by ${Math.round((result.means[BASELINE] / result.means[name] - 1) * 10000) / 100}%`);
		}
	}
});

bench.run({async: false});
