import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript'
// import dts from 'rollup-plugin-dts'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import pkg from './package.json'
import postcss from 'rollup-plugin-postcss'

// babel配置
const babelOptions = {
    presets: ['@babel/preset-env'],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'],
    exclude: '**/node_modules/**',
    runtimeHelpers: true,
}

const umdGlobals = {
    react: 'React',
    'react-dom': 'ReactDOM',
}

const commonPlugins = [
    peerDepsExternal(),
    resolve(), // 查找和打包node_modules中的第三方模块
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    typescript(), // 解析TypeScript
    babel(babelOptions),
]

// sass打包
const processScss = function (context) {
    return new Promise((resolve, reject) => {
        sass.compile(
            {
                file: context,
            },
            function (err, result) {
                if (!err) {
                    resolve(result)
                } else {
                    reject(result)
                }
            }
        )
        sass.compile(context, {}).then(
            function (output) {
                if (output && output.css) {
                    resolve(output.css)
                } else {
                    reject({})
                }
            },
            function (err) {
                reject(err)
            }
        )
    })
}

export default [
    {
        input: 'src/index.js',
        output: {
            file: pkg.main,
            format: 'cjs', // umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
            // name: 'named',
            globals: umdGlobals,
        },
        external: Object.keys(umdGlobals),
        plugins: [
            postcss({
                extract: true,
                process: processScss,
            }),
            ...commonPlugins,
        ],
    },
    {
        input: 'src/index.js',
        output: {
            file: pkg.module,
            format: 'es', // umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
            globals: umdGlobals,
        },
        external: Object.keys(umdGlobals),
        plugins: [
            postcss({
                extract: true,
                process: processScss,
            }),
            ...commonPlugins,
        ],
    },
    {
        input: 'src/index.js',
        output: {
            file: pkg.brower,
            format: 'umd', // umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
            name: 'ReactImageViewer',
            globals: umdGlobals,
        },
        external: Object.keys(umdGlobals),
        plugins: [
            postcss({
                extract: true,
                process: processScss,
            }),
            ...commonPlugins,
        ],
    },
    {
        input: 'src/ImageViewerUtil/index.ts',
        output: {
            file: 'dist/ImageViewerUtil.js',
            format: 'umd', // umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
            name: 'ImageViewerUtil',
        },
        plugins: [...commonPlugins],
    },
]
