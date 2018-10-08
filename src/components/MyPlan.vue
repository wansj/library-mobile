<template>
  <div class="h-100">
    <p class="tc" v-if="$apollo.queries.readPlans.loading">
      <span class="v-mid f6 dib">加载中&nbsp;&nbsp;</span><inline-loading></inline-loading>
    </p>
    <div v-else-if="readPlans && (readPlans.length > 0) && !editing" class="h-100 overflow-hidden">
      <div v-transfer-dom>
        <popup v-model="showRight" position="right">
          <div class="bg-white w5 pa3 h-100">
            <h3>我的读书计划</h3>
            <ul class="list mt3">
              <li v-for="(readplan, i) in readPlans" :key="readplan.id" @click="active = i" class="mv2 flex">
                <span class="truncate flex-auto">{{`${i + 1}、${readplan.title}`}}</span>
                <icon type="success-no-circle" v-if="i === active" class="flex-none"></icon>
              </li>
            </ul>
            <grid class="fixed bottom-1 btn">
              <grid-item label="创建读书计划" class="add-btn" @on-item-click="editing=true"></grid-item>
              <grid-item label="删除所选" @on-item-click="delReadPlan"></grid-item>
            </grid>
          </div>
        </popup>
      </div>
      <x-header title="我的读书计划" :right-options="{showMore: true}" @on-click-more="showRight = true"></x-header>
      <div class="autoscroll-container">
        <h2 class="tc mt3 normal">{{activePlan.title}}</h2>
        <flow orientation="vertical" :style="styles">
          <template v-for="(plan, i) in activePlan.plans">
            <flow-state :state="i+1" :is-done="plan.process > 0" class="nl6">
              <template slot="title">
                <h4>{{plan.book.title}}</h4>
                <p>{{formatDate(plan.timespan)}}</p>
              </template>
            </flow-state>
            <flow-line :is-done="plan.process > 0" v-if="isNotLast(i, activePlan.plans.length)" :line-span="getLineSpan(plan.timespan)" :process-span="plan.process" class="nl6"></flow-line>
          </template>
        </flow>
      </div>
    </div>
    <div v-else-if="!readPlans || (readPlans.length === 0) || editing">
      <x-header title="我的读书计划">
        <a slot="right" class="header-btn"><x-button mini plain :disabled="!canSave" @click.native="save">保存</x-button></a>
      </x-header>
      <group title="重要提示">
        <cell>
          <div slot="title" class="silver">1.请提前将要读的书添加到收藏夹中</div>
        </cell>
        <cell>
          <div slot="title" class="silver">2.必须按阅读的先后顺序添加图书</div>
        </cell>
      </group>
      <group title="制定读书计划">
        <x-input v-model="title" title="计划名称" placeholder="2018年读书计划" text-align="right"></x-input>
        <popup-picker title="选择图书" v-model="selectedBookId" :data="books" :display-format="format" placeholder="从收藏中选"></popup-picker>
        <x-switch title="可以选择读过的图书" v-model="includeRead"></x-switch>
        <date-range-calendar :key="key" ref="calendar" disable-past :start-date="startOfDate" title="设置完成期限" placeholder="指定日期范围"
                             :value="selectedDates" @on-change="onChange" @on-show="onInlineCalendarShow" :display-format="formatDate"></date-range-calendar>
        <x-switch title="从上个计划结束日开始选择日期" v-model="setLastEndDateAsStart" v-if="readPlans"></x-switch>
      </group>
      <div class="pa3">
        <x-button @click.native="addToPlan" type="primary" :disabled="!canAdd">加入读书计划</x-button>
        <toast v-model="showToast" text="添加成功" :time="1000"></toast>
        <toast v-model="showToast2" text="创建读书计划成功"></toast>
      </div>
    </div>
  </div>
</template>

<script>
  import { XHeader, XButton, XInput, Flow, FlowState, FlowLine, Group, PopupPicker, Icon, Cell, Toast, Popup, Grid, GridItem, XSwitch, dateFormat } from 'vux'
  import { GetReadPlansQuery, GetCollectedBooksQuery, GetLogedUserQuery } from '../constants/graphql-queries'
  import { CreateReadPlanMutation, DeleteReadPlanMutation } from '../constants/graphql-mutations'
  import DateRangeCalendar from './DateRangeCalendar'

  export default {
    name: 'my-plan',
    data () {
      return {
        active: 0,
        editing: false,
        readPlans: null,
        plans: [],  // PlanInput
        collection: [], // 用户已收藏的图书
        logedUser: null,
        selectedDates: [],
        selectedBookId: [],
        title: '',
        startDate: '', // Calendar组件可选的起始日期
        showToast: false,
        showToast2: false,
        showRight: false,
        includeRead: false, // 是否可选择已读过的图书
        setLastEndDateAsStart: true, // 是否自动设置上个计划的结束日期为本计划的开始日期
        delaySwitchToDate: null,
        format: function (value, name) {
          return name
        }
      }
    },
    components: { XHeader, XButton, XInput, Flow, FlowState, FlowLine, Group, PopupPicker, DateRangeCalendar, Icon, Cell, Toast, Popup, Grid, GridItem, XSwitch },
    apollo: {
      readPlans: {
        query: GetReadPlansQuery
      },
      logedUser: {
        query: GetLogedUserQuery,
        result ({ data }) {
          if (data && data.logedUser) {
            this.$apollo.addSmartQuery('collection', {
              query: GetCollectedBooksQuery,
              variables () {
                return { userId: data.logedUser.id, skip: 0, limit: 0 }
              }
            })
          }
        }
      }
    },
    computed: {
      startOfDate: {
        get: function () {
          if (this.readPlans && (this.readPlans.length > 0) && this.setLastEndDateAsStart) {
            const [lastReadPlan] = this.readPlans
            const lastPlan = lastReadPlan.plans[lastReadPlan.plans.length - 1]
            let lastDate = new Date(lastPlan.timespan[1])
            const fmtDate = dateFormat(lastDate, 'YYYY-MM-DD')
            lastDate = new Date(lastDate.getTime() + 86400000)
            // 如果当前日期与上个计划的结束日期（年/月）不同，记录下来，在calendar显示时切换到记录的日期显示
            if (dateFormat(new Date(), 'YYYY-MM') !== dateFormat(lastDate, 'YYYY-MM')) {
              this.delaySwitchToDate = lastDate
            }
            return fmtDate
          }
          return this.startDate
        },
        set: function (val) {
          this.startDate = val
        }
      },
      activePlan: function () {
        return this.readPlans[this.active]
      },
      // 为DateRangeCalendar指定key阻止组件重用，否则组件会记录上次选中的日期。不能对DateRangeCalendar使用v-model，会导致死循环
      key: function () {
        return this.selectedBookId[0]
      },
      canAdd: function () {
        return this.selectedBookId.length === 1 && this.selectedDates.length === 2
      },
      canSave: function () {
        return this.plans.length >= 3 && this.title.trim()
      },
      selectedIds: function () {
        return this.plans.map(({bookId}) => bookId)
      },
      booksAlreadyRead: function () {
        if (!this.readPlans) return []
        return this.readPlans.reduce((memo, {plans}) => {
          plans.forEach(({book}) => {
            memo.add(book.id)
          })
          return memo
        }, new Set())
      },
      books: function () {
        // 注意不能返回[[]]，而应该返回[]，否则会出错
        if (this.collection.length === 0) return []
        return [this.collection.filter(({id}) => {
          const available = this.selectedIds.indexOf(id) === -1
          return this.includeRead ? available : (available && !this.booksAlreadyRead.has(id))
        }).map(({id, title}) => ({name: title, value: id}))]
      },
      totalSpan: function () {
        return this.activePlan.plans.reduce((memo, { timespan }, i) => {
          if (i < this.activePlan.plans.length - 1) {
            memo = memo + this.getSpan(timespan)
          }
          return memo
        }, 0)
      },
      styles: function () {
        const height = (this.activePlan.plans.length - 1) * 100
        return { height: `${height}px` }
      }
    },
    methods: {
      // 在打开calendar Popup时根据需要切换到可以直接选择的月份
      onInlineCalendarShow () {
        if (this.delaySwitchToDate) {
          this.$refs.calendar.switchViewToMonth(this.delaySwitchToDate.getFullYear(), this.delaySwitchToDate.getMonth() + 1)
        }
      },
      getSpan (timespan) {
        return Math.ceil((timespan[1] - timespan[0]) / (24 * 3600 * 1000))
      },
      getLineSpan (timespan) {
        return this.getSpan(timespan) / this.totalSpan * 100
      },
      isNotLast (i, len) {
        return i < len - 1
      },
      addToPlan () {
        const [bookId] = this.selectedBookId
        const timespan = this.selectedDates.map(str => new Date(str))
        this.plans.push({bookId, timespan})
        this.startDate = dateFormat(new Date(timespan[1].getTime() + 86400000), 'YYYY-MM-DD')
        this.setLastEndDateAsStart = false
        this.selectedDates = []
        this.selectedBookId = []
        this.showToast = true
      },
      formatDate (timespan) {
        return timespan.map(dateStr => dateFormat(new Date(dateStr), 'M月DD日')).join('——')
      },
      onChange (val) {
        this.selectedDates = [...val]
      },
      save () {
        this.$apollo.mutate({
          mutation: CreateReadPlanMutation,
          variables: { plans: this.plans, title: this.title.trim() },
          refetchQueries: [{query: GetReadPlansQuery}]
        }).then(() => (this.showToast2 = true)).catch(err => {
          this.$vux.alert.show({
            title: '出错了',
            content: err.message
          })
        })
      },
      delReadPlan () {
        this.$apollo.mutate({
          mutation: DeleteReadPlanMutation,
          variables: {id: this.readPlans[this.active].id},
          refetchQueries: [{query: GetReadPlansQuery}]
        }).then(() => {
          this.active = 0
        }).catch(err => {
          this.$vux.alert.show({
            title: '出错了',
            content: err.message
          })
        })
      }
    }
  }
</script>

<style scoped>
  .header-btn >>> button.weui-btn{
    color: limegreen;
    padding: 0;
    border: none;
    line-height: 1.5;
  }
  .header-btn >>> button.weui-btn.weui-btn_plain-disabled{
    color: rgba(50, 205, 50, .5);
  }
  .weui-grids.fixed{
    position: fixed;
    width: 14rem;
  }
  .btn >>> .weui-grid{
    padding: 10px;
  }
  .add-btn{
    background-color: #1AAD19;
  }
  .add-btn >>> .weui-grid__label{
    color: white;
  }
  .autoscroll-container{
    height: calc(100% - 46px);
    overflow-y: auto;
  }
</style>
