import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import devConfig from "./dev";
import prodConfig from "./prod";

import { UnifiedWebpackPluginV5 } from "weapp-tailwindcss/webpack";

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport = {
    projectName: "ai-chat",
    date: "2023-9-4",
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {},
    copy: {
      patterns: [
        {
          from: 'src/wemark',
          to: 'dist/wemark',
        },
      ],
      options: {
      }
    },
    framework: "react",
    compiler: {
      type: "webpack5",
    },
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    weapp: {
      compile: {
        exclude: [
          'src/wemark/remarkable.js',
        ]
      },
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024, // 设定转换尺寸上限
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
        chain.merge({
          plugin: {
            install: {
              plugin: UnifiedWebpackPluginV5,
              args: [
                {
                  appType: "taro",
                },
              ],
            },
          },
        });
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      output: {
        filename: "js/[name].[hash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].js",
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[hash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
            content: ["./public/index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
      },
    },
    rn: {
      appName: "taroDemo",
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
      output: {
        iosSourceMapUrl: "", // sourcemap 文件url
        iosSourcemapOutput: "../taro-native-shell/ios/main.map", // sourcemap 文件输出路径
        iosSourcemapSourcesRoot: "", // 将 sourcemap 资源路径转为相对路径时的根目录
        androidSourceMapUrl: "",
        androidSourcemapOutput:
          "../taro-native-shell/android/app/src/main/assets/index.android.map",
        androidSourcemapSourcesRoot: "",
        ios: "../taro-native-shell/ios/main.jsbundle",
        iosAssetsDest: "../taro-native-shell/ios",
        android:
          "../taro-native-shell/android/app/src/main/assets/index.android.bundle",
        androidAssetsDest: "../taro-native-shell/android/app/src/main/res",
      },
    },
  };
  if (process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
