const path = require('path')
const { build } = require('esbuild')

const args = require('minimist')(process.argv.slice(2)); // 解析用户执行命令行的参数
// 这个是打包的模块是哪一个
const target = args._[0] || "reactivity";
const format = args.f || 'global';

const pkg = require(path.resolve(__dirname, `../packages/${target}/package.json`))

const outputFormat = format.startsWith('global') ?
    'iife' : format === 'cjs'
        ? 'cjs' : 'esm';

// reactivity.global.js
// reactivity.esm.js
// reactivity.cjs.js
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

build({
    entryPoints: [path.resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === "cjs" ? "node" : "browser",
    watch: {
        // 监控文件变化
        onRebuild(error) {
            if (!error) console.log(`rebuilt~~~~`);
        },
    },
}).then(() => {
    console.log("watching~~~");
});

