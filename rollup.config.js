import resolve from '@rollup/plugin-node-resolve';
import css from "rollup-plugin-import-css";

export default {
  input: 'src/app.js',
  output: [
    {
      format: 'esm',
      file: 'src/bundle.js'
    },
  ],
  plugins: [
    resolve(),
    css(),
  ]
};