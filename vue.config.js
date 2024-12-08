module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'subsidy.feiger.app',
        productName: '返款核对', //项目名，也是生成的安装文件名
        copyright: 'Copyright feiger© 2024', //版权信息
        directories: {
          output: './dist', //输出文件路径
        },
        win: {
          //win相关配置
          icon: './icon.ico', //图标，当前图标在根目录下
          target: [
            {
              target: 'nsis', //利用nsis制作安装程序
              arch: [
                'x64', //64位
                'ia32', //32位
              ],
            },
          ],
        },
        nsis: {
          oneClick: false, // 一键安装
          perMachine: true, // 是否开启安装时权限限制（此电脑或当前用户）
          allowElevation: false, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true, // 创建开始菜单图标
        },
      },
    },
  },
};
