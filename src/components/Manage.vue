<template>
  <div class="hello">
    <div class="work-date">
      <span>制表日期: {{ this.workDate }}</span>
    </div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="内网账单" name="first">
        <div class="dev-box">
          <div class="action-btn">
            <el-upload
              class="upload-btn"
              action="https://jsonplaceholder.typicode.com/posts/"
              accept=".xlsx, .xls"
              :on-exceed="exceed"
              :limit="10"
              :on-remove="remove"
              :http-request="importPms"
              :show-file-list="false"
            >
              <el-button type="primary" icon="el-icon-document" size="mini">导入</el-button>
            </el-upload>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleRemoveRow()">删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-circle-close" @click="handleCleanPms()">清空</el-button>
          </div>
          <div class="search-btn">
            <!-- <span style="font-size: 12px">系统标识:&nbsp;</span> -->
            <el-input v-model="searchKeyWord" size="mini" placeholder="系统标识" style="width: 200px; margin: 0px 5px" clearable @input="handleSearchInputChage"></el-input>
            <el-button type="primary" size="mini" icon="el-icon-search">查询</el-button>
            <el-button type="info" size="mini" icon="el-icon-circle-close" @click="clearFilter">重置</el-button>
          </div>
          <pl-table
            row-key="id"
            :data="pmsTable.filter(data => !searchKeyWord || data.reference.toLowerCase().includes(searchKeyWord.toLowerCase()))"
            highlight-current-row
            stripe
            size="small"
            ref="filterTable"
            big-data-checkbox
            use-virtual
            :row-height="30"
            :excess-rows="10"
            :max-height="windowHeight - 140"
            :pagination-show="false"
            style="width: 100%; font-size: 12px; margin-top: 20px"
            :row-style="{ height: '8px' }"
            :cell-style="{ padding: '2px 0px' }"
            :header-cell-style="{ background: '#f8f8f8', color: '#222222', padding: '1px 0px' }"
            @selection-change="handleSelection"
            @filter-change="handleFilterChange"
            :row-class-name="personTableRowClassName"
          >
            <pl-table-column type="selection" width="40"></pl-table-column>
            <pl-table-column type="index" label="#"></pl-table-column>
            <pl-table-column prop="trnGroup" label="帐项大类" width="120" column-key="trnGroup" :filters="trnGroups" :filter-method="filterHandler"></pl-table-column>
            <pl-table-column prop="trnSub" label="帐项小类" width="90" column-key="trnSub" :filters="trnSubGroups" :filter-method="filterHandler"></pl-table-column>
            <pl-table-column prop="trnDesc" label="帐项描述" width="120"></pl-table-column>
            <!-- <pl-table-column prop="billNo" label="帐单号"></pl-table-column> -->
            <pl-table-column prop="billType" label="帐单类型" width="90" column-key="billType" :filters="billTypes" :filter-method="filterHandler"></pl-table-column>
            <pl-table-column prop="arrData" label="到店日期" width="140"></pl-table-column>
            <pl-table-column prop="depData" label="离店日期" width="140"></pl-table-column>
            <!-- <pl-table-column prop="bizDay" label="营业日" width="100px"></pl-table-column> -->
            <pl-table-column prop="amount" label="账单金额" width="100px" sortable></pl-table-column>
            <pl-table-column prop="serialNo" label="交易流水号"></pl-table-column>
            <pl-table-column prop="extNo" label="外部单号"></pl-table-column>
            <pl-table-column prop="trnType" label="账目类型" width="90px" column-key="trnType" :filters="trnTypes" :filter-method="filterHandler"> </pl-table-column>
            <pl-table-column type="expand" label="..." width="30px" column-key="id">
              <template slot-scope="props">
                <span>{{ props.row.reference }} </span> <span>{{ props.row.comment }}</span>
              </template>
            </pl-table-column>
            <!-- <pl-table-column prop="reference" label="系统标识" width="120px"></pl-table-column> -->
            <!-- <pl-table-column prop="comment" label="备注"></pl-table-column> -->
          </pl-table>
          <span class="total">共 {{ filterPmsList.length }} 条数据, 金额 {{ filterPmsList | amount }}</span>
        </div>
      </el-tab-pane>
      <el-tab-pane label="外网账单" name="second">
        <div class="dev-box">
          <div class="action-btn">
            <el-upload
              class="upload-btn"
              action="https://jsonplaceholder.typicode.com/posts/"
              accept=".xlsx, .xls"
              :on-exceed="exceed"
              :limit="10"
              :on-remove="remove"
              :http-request="importPbs"
              :show-file-list="false"
            >
              <el-button type="primary" icon="el-icon-document" size="mini">导入</el-button>
            </el-upload>
            <el-button type="warning" size="mini" icon="el-icon-circle-close" @click="handleCleanPbs()">清空</el-button>
          </div>
          <pl-table
            row-key="id"
            :data="pbsTable"
            highlight-current-row
            stripe
            size="small"
            ref="detialTable"
            use-virtual
            :row-height="30"
            :excess-rows="10"
            :max-height="windowHeight - 140"
            :pagination-show="false"
            style="width: 100%; font-size: 12px; margin-top: 20px"
            :row-style="{ height: '8px' }"
            :cell-style="{ padding: '2px 0px' }"
            :header-cell-style="{ background: '#f8f8f8', color: '#222222', padding: '1px 0px' }"
            :row-class-name="personTableRowClassName"
          >
            <pl-table-column type="index" label="#"></pl-table-column>
            <pl-table-column prop="hzOrder" label="华住订单号"></pl-table-column>
            <pl-table-column prop="hzSerial" label="华住交易单号"></pl-table-column>
            <pl-table-column prop="chOrder" label="渠道订单号"></pl-table-column>
            <pl-table-column prop="hotelId" label="酒店ID" width="110px"></pl-table-column>
            <pl-table-column prop="hotelNc" label="酒店NC编号" width="110px"></pl-table-column>
            <pl-table-column prop="bz" label="交易币种" width="80px"></pl-table-column>
            <pl-table-column prop="amount" label="交易金额" width="80px"></pl-table-column>
            <pl-table-column prop="paymentDate" label="交易时间" width="160px"></pl-table-column>
            <pl-table-column prop="paymentType" label="支付方式" width="110px"></pl-table-column>
            <pl-table-column prop="founded" label="匹配次数" width="100px" sortable></pl-table-column>
          </pl-table>
          <span class="total">共 {{ pbsTable.length }} 条数据, 金额 {{ pbsTable | amount }}</span>
        </div>
      </el-tab-pane>
      <el-tab-pane label="返款核对" name="third">
        <div class="dev-box">
          <div class="action-btn">
            <el-button type="success" icon="el-icon-upload" size="mini" style="margin-left: 10px" @click="exportVerifyList">导出</el-button>
          </div>
          <pl-table
            row-key="id"
            :data="verifyTable"
            highlight-current-row
            stripe
            size="small"
            ref="myTable"
            use-virtual
            :row-height="30"
            :excess-rows="10"
            :max-height="windowHeight - 140"
            :pagination-show="false"
            style="width: 100%; font-size: 12px; margin-top: 20px"
            :row-style="{ height: '8px' }"
            :cell-style="{ padding: '2px 0px' }"
            :header-cell-style="{ background: '#f8f8f8', color: '#222222', padding: '1px 0px' }"
          >
            <!-- <pl-table-column type="selection" width="45"></pl-table-column> -->
            <pl-table-column type="index" label="#"></pl-table-column>
            <pl-table-column prop="trnGroup" label="帐项大类" width="120"></pl-table-column>
            <pl-table-column prop="trnSub" label="帐项小类" width="90"></pl-table-column>
            <pl-table-column prop="trnDesc" label="帐项描述" width="120"></pl-table-column>
            <!-- <pl-table-column prop="billNo" label="帐单号"></pl-table-column> -->
            <pl-table-column prop="billType" label="帐单号类型" width="90"></pl-table-column>
            <pl-table-column prop="arrData" label="到店日期" width="160"></pl-table-column>
            <pl-table-column prop="depData" label="离店日期" width="160"></pl-table-column>
            <!-- <pl-table-column prop="bizDay" label="营业日" width="100px"></pl-table-column> -->
            <pl-table-column prop="amount" label="账单金额" width="80px"></pl-table-column>
            <pl-table-column prop="serialNo" label="交易流水号"></pl-table-column>
            <pl-table-column prop="extNo" label="外部单号"></pl-table-column>
            <pl-table-column prop="trnType" label="账目类型" width="80px"></pl-table-column>
            <!-- <pl-table-column prop="reference" label="系统标识" width="120"></pl-table-column> -->
            <!-- <pl-table-column prop="comment" label="备注"></pl-table-column> -->
          </pl-table>
          <span class="total">共 {{ verifyTable.length }} 条数据, 金额 {{ verifyTable | amount }}</span>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
Date.prototype.Format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'H+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (let k in o) if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
  return fmt;
};

String.prototype.trim = function () {
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

import XLSX from 'xlsx';

export default {
  name: 'DeviceManager',
  props: {
    msg: String
  },
  data() {
    return {
      CBtnLoading: false,
      pmsTable: [], // 内网账单
      pmsFilterTable: [],
      filterPmsList: [],
      verifyTable: [], // 核验账单
      pbsTable: [], // 外网账单
      pbsFilter1Map: {},
      psbFilter2Map: {},
      trnGroups: [],
      trnSubGroups: [],
      billTypes: [],
      trnTypes: [],
      searchKeyWord: '',
      filterColumnMap: new Map(),
      multipleSelection: [],
      activeName: 'first',
      workDate: this.getThisMonthStr(),
      searchMonthValue: this.getThisMonthStr(),
      statisticsMonth: this.getThisMonthStr(),
      windowHeight: 770
    };
  },
  filters: {
    amount(table) {
      if (!Array.isArray(table)) {
        console.error('Input must be an array');
        return '0.00'; // 返回字符串，保持一致性
      }
      const total = table.reduce((sum, item) => {
        const amount = parseFloat(item.amount) || 0;
        return sum + amount; // 累加每个 item 的 amount
      }, 0);

      return total.toFixed(2); // 保留两位小数
    }
  },
  mounted() {
    // this.selectedMonth = [this.getThisMonthStr, this.getThisMonthStr];
    this.getWindowHeight();
    window.addEventListener('resize', this.getWindowHeight);
  },
  methods: {
    handleSearchInputChage() {
      this.handleFilterChange({});
    },
    handleFilterChange(filters) {
      for (let key in filters) {
        this.filterColumnMap.set(key, filters[key]);
      }
      console.log(this.filterColumnMap);
      // 获取筛选后的数据
      console.log('filters', filters);
      let arry = this.pmsTable.filter(row => {
        // 遍历筛选条件并检查每一列数据是否符合条件
        return Array.from(this.filterColumnMap.entries()).every(([key, values]) => {
          // 如果某字段的筛选条件为空数组，则忽略该条件
          if (!values || values.length === 0) {
            return true; // 不限制该字段
          }
          // 检查行数据是否符合筛选条件
          return values.includes(row[key]);
        });
      });

      arry = arry.filter(data => !this.searchKeyWord || data.reference.toLowerCase().includes(this.searchKeyWord.toLowerCase()));
      if (arry.length) {
        this.filterPmsList = arry;
      } else {
        this.filterPmsList = this.pmsTable;
      }

      console.log('filterPmsList', this.filterPmsList.length);
    },
    sumPmsTable() {
      return this.ref.filterTable.data.length;
    },
    clearFilter() {
      this.searchKeyWord = null;
      this.$refs.filterTable.clearFilter();
      this.filterColumnMap = new Map();
      this.handleFilterChange({});
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    handleCleanPms() {
      this.clearFilter();
      this.pmsTable = [];
      this.filterPmsList = [];
    },
    handleCleanPbs() {
      this.pbsTable = [];
    },
    getWindowHeight() {
      this.windowHeight = window.innerHeight;
      // console.log(this.windowHeight)
    },
    personTableRowClassName({ row }) {
      return parseInt(row.id) % 2 === 0 ? 'even-row' : 'odd-row'; // 偶数行和奇数行
    },
    handleTabClick(tab) {
      this.searchMonthValue = this.workDate;
      this.statisticsMonth = this.workDate;
      if (tab.name === 'first') {
        // this.getPersonList();
      } else if (tab.name === 'second') {
        // this.getSubsidyDetail();
      } else if (tab.name == 'third') {
        this.verifyBillList();
      }
    },
    handleSelection(val) {
      this.multipleSelection = val;
    },
    handleRemoveRow() {
      if (!this.multipleSelection.length) {
        this.$message({
          type: 'warning',
          message: '请选择要删除的记录'
        });
        return;
      }
      this.$confirm('提示：确定删除所选的记录吗？', {
        center: true,
        cancelButtonClass: 'comfirm-class-cancle',
        confirmButtonClass: 'comfirm-class-sure'
      })
        .then(() => {
          this.multipleSelection.forEach(async row => {
            const index = this.pmsTable.findIndex(item => item.id === row.id);
            if (index !== -1) {
              this.pmsTable.splice(index, 1); // 删除找到的记录
              // console.log(`已删除记录: ${row.id}`);
            }
            // console.log(row);
          });

          this.$message.success('删除成功');
          this.handleFilterChange();
        })
        .catch(err => {
          console.log(err);
        });
    },
    importPms(params) {
      console.log('导入pms账单:' + params.file.name);
      this.CBtnLoading = true;

      const _file = params.file;
      const fileReader = new FileReader();

      fileReader.onload = async ev => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: 'binary'
          });

          let successCount = 0,
            failCount = 0,
            sheetIdx = 0;
          for (let sheet in workbook.Sheets) {
            //循环读取每个文件
            const sheetArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

            //若当前sheet没有数据，则continue, 只处理一个sheet
            if (sheetArray.length == 0 || sheetIdx > 0) {
              continue;
            }
            sheetIdx++;

            this.pmsTable = [];
            let trnGroupMap = new Map();
            let trnSubMap = new Map();
            let billTypeMap = new Map();
            let trnTypeMap = new Map();

            let prevTrnGroupVal,
              prevTrnSubVal,
              prevTrnCodeVal,
              prevTrnDescVal = '';
            for (let item in sheetArray) {
              let bill = {
                id: item,
                trnGroup: sheetArray[item]['Trn.Group帐项大类'] || '',
                trnSub: sheetArray[item]['Trn.Sub帐项小类'] || '',
                trnCode: sheetArray[item]['Trn. Code账项代码'] || '',
                trnDesc: sheetArray[item]['Trn.Desc帐项描述'] || '',
                billNo: sheetArray[item]['Bill No.帐单号'] || '',
                billType: sheetArray[item]['Bill No. Type帐单号类型'] || '',
                resNo: sheetArray[item]['Res.No.预订单号'] || '',
                arrData: sheetArray[item]['Arr.Date 到店日期'] || '',
                depData: sheetArray[item]['Dep.Date离店日期'] || '',
                bizDay: sheetArray[item]['BizDay营业日'] || '',
                amount: parseFloat(sheetArray[item]['Credit贷方']),
                createTime: sheetArray[item]['Create Time创建时间'] || '',
                roomNo: sheetArray[item]['Room No.房号'] || '',
                name: sheetArray[item]['Name姓名'] || '',
                Operator: sheetArray[item]['Operator操作人'] || '',
                shift: sheetArray[item]['Shift班次'] || '',
                serialNo: sheetArray[item]['SerialNo交易流水号'] || '',
                extNo: sheetArray[item]['External Ref. No. 外部单号'] || '',
                trnType: sheetArray[item]['Trn.Type 账目类型'] || '',
                reference: sheetArray[item]['Reference系统标识'] || '',
                comment: sheetArray[item]['Comment 备注'] || ''
              };

              if (sheetArray[item]['SerialNo交易流水号'] != undefined) {
                bill.filter2 = sheetArray[item]['SerialNo交易流水号'] + '_' + sheetArray[item]['Trn.Type 账目类型'].trim();
              }
              if (sheetArray[item]['External Ref. No. 外部单号'] != undefined) {
                bill.filter1 = sheetArray[item]['External Ref. No. 外部单号'] + '_' + sheetArray[item]['Trn.Type 账目类型'].trim();
              }

              if (bill.trnType != '') {
                trnTypeMap.set(bill.trnType, bill.trnType);
              } else {
                // console.log("skip", sheetArray[item])

                continue;
              }

              if (bill.trnGroup != '') {
                trnGroupMap.set(bill.trnGroup, bill.trnGroup);
                prevTrnGroupVal = bill.trnGroup;
              } else {
                bill.trnGroup = prevTrnGroupVal;
              }

              if (bill.trnSub != '') {
                trnSubMap.set(bill.trnSub, bill.trnSub);
                prevTrnSubVal = bill.trnSub;
              } else {
                bill.trnSub = prevTrnSubVal;
              }

              if (bill.trnCode != '') {
                prevTrnCodeVal = bill.trnCode;
              } else {
                bill.trnCode = prevTrnCodeVal;
              }

              if (bill.trnDesc != '') {
                prevTrnDescVal = bill.trnDesc;
              } else {
                bill.trnDesc = prevTrnDescVal;
              }

              if (bill.billType != '') {
                billTypeMap.set(bill.billType, bill.billType);
              }

              successCount++;

              this.pmsTable.push(bill);
            }

            this.trnGroups = Array.from(trnGroupMap, ([key, value]) => ({ text: key, value: value }));
            this.trnSubGroups = Array.from(trnSubMap, ([key, value]) => ({ text: key, value: value }));
            this.billTypes = Array.from(billTypeMap, ([key, value]) => ({ text: key, value: value }));
            this.trnTypes = Array.from(trnTypeMap, ([key, value]) => ({ text: key, value: value }));
            console.log('导入外网账单: 导入 ' + this.pmsTable.length + ' 条数据');
          }
          this.clearFilter();

          this.$message.success('导入完成 ' + '成功 ' + successCount + ' 失败 ' + failCount);
        } catch (e) {
          this.CBtnLoading = true;
          this.$message.warning('文件类型不正确');
          console.log('导入文件失败 ' + e);
        }
      };
      fileReader.readAsBinaryString(_file);
    },
    importPbs(params) {
      console.log('导入pbs账单:' + params.file.name);
      this.CBtnLoading = true;

      const _file = params.file;
      const fileReader = new FileReader();

      let _this = this;
      fileReader.onload = async ev => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: 'binary'
          });

          let successCount = 0,
            failCount = 0;
          _this.pbsFilter1Map = {};
          _this.pbsFilter2Map = {};
          for (let sheet in workbook.Sheets) {
            //循环读取每个文件
            const sheetArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
            //若当前sheet没有数据，则continue
            if (sheetArray.length == 0) {
              continue;
            }
            _this.pbsTable = [];

            for (let item in sheetArray) {
              let bill = {
                id: item,
                hzOrder: sheetArray[item]['华住订单号'],
                hzSerial: sheetArray[item]['华住交易单号'],
                chOrder: sheetArray[item]['渠道订单号'],
                hotelId: sheetArray[item]['酒店ID'],
                hotelNc: sheetArray[item]['酒店NC编号'],
                bz: sheetArray[item]['交易币种'],
                amount: parseFloat(sheetArray[item]['交易金额']),
                paymentDate: sheetArray[item]['交易时间'],
                paymentType: sheetArray[item]['支付方式'],
                founded: 0
              };

              if (sheetArray[item]['华住订单号'] != undefined) {
                bill.filter1 = (sheetArray[item]['华住订单号'] + '_' + (parseFloat(sheetArray[item]['交易金额']) > 0 ? '入账' : '退款')).trim();
                _this.pbsFilter1Map[bill.filter1] = item;
              } else {
                // console.log(sheetArray[item])
              }

              if (sheetArray[item]['华住交易单号'] != undefined) {
                bill.filter2 = (sheetArray[item]['华住交易单号'] + '_' + (parseFloat(sheetArray[item]['交易金额']) > 0 ? '入账' : '退款')).trim();
                _this.pbsFilter2Map[bill.filter2] = item;
              } else {
                // console.log(sheetArray[item])
              }

              successCount++;
              _this.pbsTable.push(bill);
            }

            console.log('导入内网账单: 导入 ' + this.pbsTable.length + ' 条数据');
          }

          this.$message.success('导入完成 ' + '成功 ' + successCount + ' 失败 ' + failCount);
        } catch (e) {
          this.CBtnLoading = true;
          this.$message.warning('文件类型不正确');
          console.log('导入文件失败 ' + e);
        }
      };
      fileReader.readAsBinaryString(_file);
    },
    verifyBillList() {
      this.CBtnLoading = true;
      this.verifyTable = [];
      if (this.pbsTable.length == 0) {
        return;
      }
      for (let i = 0; i < this.pbsTable.length; i++) {
        this.pbsTable[i]['founded'] = 0;
      }
      this.pmsTable.forEach(element => {
        if (this.pbsFilter1Map[element.filter1]) {
          this.setPbsVerify(this.pbsFilter1Map[element.filter1]);
          return;
        }

        if (this.pbsFilter2Map[element.filter2]) {
          this.setPbsVerify(this.pbsFilter2Map[element.filter2]);
          return;
        }

        this.verifyTable.push(element);
      });

      this.CBtnLoading = false;
    },
    setPbsVerify(id) {
      for (let i = 0; i < this.pbsTable.length; i++) {
        if (this.pbsTable[i].id == id) {
          // this.$set(this.pbsTable[i], "founded", this.pbsTable[i]["founded"] += 1)
          // this.pbsTable[i] = { ...this.pbsTable[i], "founded": this.pbsTable[i]["founded"] + 1 };
          this.pbsTable.splice(i, 1, { ...this.pbsTable[i], founded: this.pbsTable[i]['founded'] + 1 });
          // console.log("founded", this.pbsTable[i])

          break;
        }
      }
    },
    exportVerifyList() {
      //数据表格
      let table = [];
      table.push({
        A: 'Trn.Group帐项大类',
        B: 'Trn.Sub帐项小类',
        C: 'Trn. Code账项代码',
        D: 'Trn.Desc帐项描述',
        E: 'Bill No.帐单号',
        F: 'Bill No. Type帐单号类型',
        G: 'resNoRes.No.预订单号',
        H: 'Arr.Date 到店日期',
        I: 'Dep.Date离店日期',
        J: 'BizDay营业日',
        K: 'Credit贷方',
        L: 'Create Time创建时间',
        M: 'Room No.房号',
        N: 'Name姓名',
        O: 'Operator操作人',
        P: 'Shift班次',
        Q: 'SerialNo交易流水号',
        R: 'External Ref. No. 外部单号',
        S: 'Trn.Type 账目类型',
        T: 'Reference系统标识',
        U: 'Comment 备注'
      });

      this.verifyTable.forEach(item => {
        let row = {
          A: item.trnGroup,
          B: item.trnSub,
          C: item.trnCode,
          D: item.trnDesc,
          E: item.billNo,
          F: item.billType,
          G: item.resNo,
          H: item.arrData,
          I: item.depData,
          J: item.bizDay,
          K: item.amount,
          L: item.createTime,
          M: item.roomNo,
          N: item.name,
          O: item.Operator,
          P: item.shift,
          Q: item.serialNo,
          R: item.extNo,
          S: item.trnType,
          T: item.reference,
          U: item.comment
        };

        table.push(row);
      });
      //创建book
      let wb = XLSX.utils.book_new();
      //json转sheet
      let ws = XLSX.utils.json_to_sheet(table, { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'], skipHeader: true });
      //设置列宽
      ws['!cols'] = [
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 22 },
        { width: 10 },
        { width: 24 },
        { width: 24 },
        { width: 24 },
        { width: 13 },
        { width: 12 },
        { width: 24 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 35 },
        { width: 35 },
        { width: 12 },
        { width: 25 },
        { width: 25 }
      ];
      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, 'sheet1');
      //输出
      XLSX.writeFile(wb, '线上支付返款核对-' + new Date().Format('yyyy-MM-dd-HH-mm') + '.xlsx');
    },
    exceed() {
      this.$message.error('最多只能上传1个xls文件');
    },
    //删除文件
    remove() {},

    getThisMonthStr() {
      return new Date().Format('yyyy-MM-dd');
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
  .hello {
    text-align: left;
  }

  .work-date {
    /* color: rgb(252, 98, 9); */

    position: absolute;
    right: 1%;
    font-size: 14px;
    /* font-weight: 600; */
    top: 3%;
  }

  i {
    cursor: pointer;
  }

  .upload-btn {
    display: inline-block;
    margin: 0px 10px;
  }

  .dev-box {
    min-width: 700px;
    height: 592px;
    border: 1px solid #e4e7ed;
    border-top: 0px;
    padding: 5px;
  }

  legend {
    font-size: 14px;
  }
  .control {
    margin-top: 10px;
    min-width: 700px;
    border: 1px solid #d2d0d0;
    padding: 10px;
  }

  .action-btn,
  .search-btn {
    margin-top: -5px;
    margin-bottom: 5px;
  }

  .action-btn {
    float: left;
  }
  .search-btn {
    float: right;
  }
  .el-form-item {
    margin-bottom: 0px;
  }
  .el-dialog .el-dialog__header {
    background-color: #ececec !important;
  }
  .el-dialog .el-dialog__title {
    font-size: 15px !important;
  }
  .el-table .warning-row {
    background: rgb(248, 221, 209);
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
  .total {
    margin-top: 10px;
    float: right;
    font-size: 12px;
    position: relative;
    margin-right: 10px;
    /* top: 10px; */
  }

  .log-box {
    margin: 5px;
    margin-left: 2px;
    border: 1px solid #e2e1e1;
    border-top: 0px;
    height: 600px;
    overflow: auto;
  }

  .import-log {
    font-size: 14px;
    margin: 0px 10px;
  }

  .plTableBox {
    overflow: hidden !important;
  }

  .even-row {
    background-color: #d4e9f3 !important; /* 设置偶数行背景色 */
  }

  .odd-row {
    background-color: #ffffff; /* 设置奇数行背景色 */
  }
</style>
