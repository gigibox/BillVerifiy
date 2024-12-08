<template>
  <div id="app">
    <subsidy-manager msg="线上支付账单核验" />
  </div>
</template>

<script>
import SubsidyManager from './components/Manage.vue'
const Electron = window.require('electron');
const remote = Electron.remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

export default {
  name: 'App',
  components: {
    SubsidyManager
  },
  data() {
    return {
      isShowMember: false,
      menu: null,
    }
  },
  created() {
    console.log(window.innerHeight)
    this.initMenu();
  },
  methods: {
    initMenu() {

      const menu = new Menu();
      const menu2 = new Menu();
      menu.append(new MenuItem({ label: '撤销', role: 'undo' }));
      // menu.append(new MenuItem({ label: '____', role: 'separator' }));
      // menu.append(new MenuItem({ label: '重做', role: 'redo' }));
      menu.append(new MenuItem({ label: '剪切', role: 'cut' }));
      menu.append(new MenuItem({ label: '复制', role: 'copy' }));
      menu.append(new MenuItem({ label: '粘贴', role: 'paste' }));
      // menu.append(new MenuItem({ role: 'pasteandmatchstyle' }));
      menu.append(new MenuItem({ label: '删除', role: 'delete' }));
      menu.append(new MenuItem({ label: '全选', role: 'selectall' }));

      menu2.append(new MenuItem({ label: '复制', role: 'copy' }));
      menu2.append(new MenuItem({ label: '全选', role: 'selectall' }));

      window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (this.isEleEditable(e.target)) {
          menu.popup(remote.getCurrentWindow());
        } else {
          //判断有文本选中
          let selectText = window.getSelection().toString();
          if (selectText.length) {
            menu2.popup(remote.getCurrentWindow());
          }
        }

      }, false)
    },
    /**
     * 判断点击区域可编辑
     * @param {*} e 
     */
    isEleEditable(e) {
      if (!e) {
        return false;
      }
      //为input标签或者contenteditable属性为true
      if (e.tagName == 'INPUT' || e.contentEditable == 'true') {
        return true;
      } else {
        //递归查询父节点
        return this.isEleEditable(e.parentNode)
      }
    }
  }
}
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    /* color: #2c3e50; */
    margin-top: 10px;
  }
</style>
