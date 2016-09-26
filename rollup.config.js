import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
let pkg = require('./package.json');

let isProduction = process.env.production === 'true';

export default {
	entry: 'src/modal.js',
	dest: isProduction ? 'dist/modal.min.js' : 'dist/modal.js',
	format: 'umd',
	moduleName: 'Modal',
	external: [ 'jquery' ],
	globals: {
		jquery: '$'
	},
	banner: `/**
* @name Modal
* @version ${pkg.version}
* @author Victor Bastos <victorwpbastos@gmail.com>
* @license MIT
*/`,
	plugins: isProduction ? [ buble(), uglify({
		output: {
			comments(node, comment) {
				let text = comment.value;

				return /@name/.test(text);
			}
		}
	}) ] : [ buble() ]
}