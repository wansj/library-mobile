<template>
  <div>
    <x-header :left-options="{backText: ''}" :right-options="{showMore: true}" class="custom" @on-click-more="showLayout = true">
      <tab slot="overwrite-title" active-color="#ff9900">
        <tab-item :selected="isSelected('BORROWED')" @on-item-click="state='BORROWED'">正在读</tab-item>
        <tab-item :selected="isSelected('RETURNED')" @on-item-click="state='RETURNED'">已读完</tab-item>
      </tab>
    </x-header>
    <ApolloQuery v-if="state === 'BORROWED'"
      :query="require('../constants/graphql-queries').GetRecordsQuery"
      :variables="{ limit, skip: page * limit, filter: { userId: logedUser.id, state } }"
    >
      <template slot-scope="{ result: { loading, error, data } }">
        <!-- Loading -->
        <p class="tc" v-if="loading">
          <span class="v-mid dib f6">加载中  </span><inline-loading></inline-loading>
        </p>

        <!-- Error -->
        <div v-else-if="error" v-transfer-dom>
          <alert title="出错了" :content="error.message"></alert>
        </div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">
          <panel :type="layout" :list="addToList('reading', transformRecordsToList(data.records))" :footer="footer" @on-click-footer="loadMore" v-if="showReading"></panel>
        </div>
        <div class="no-result apollo" v-else></div>
      </template>
    </ApolloQuery>
    <template v-else>
      <ApolloQuery v-if="showRecent"
        :query="require('../constants/graphql-queries').GetRecordsQuery"
        :variables="{ limit, skip: skip * limit, filter: { userId: logedUser.id, state, from: monthAgo } }"
      >
        <template slot-scope="{ result: { loading, error, data } }">
          <!-- Loading -->
          <p class="tc" v-if="loading">
            <span class="v-mid dib f6">加载中  </span><inline-loading></inline-loading>
          </p>

          <!-- Error -->
          <div v-else-if="error" v-transfer-dom>
            <alert title="出错了" :content="error.message"></alert>
          </div>

          <!-- Result -->
          <div v-else-if="data" class="result apollo">
            <panel header="一个月内" :type="layout" :list="addToList('recent', transformRecordsToList(data.records))"
                   :footer="recentFooter" @on-click-footer="fetchMore"></panel>
          </div>

          <!-- No result -->
          <div v-else class="no-result apollo">No data</div>
        </template>
      </ApolloQuery>
      <ApolloQuery v-if="showEarlier"
        :query="require('../constants/graphql-queries').GetRecordsQuery"
        :variables="{ limit, skip: index * limit, filter: { userId: logedUser.id, state, to: monthAgo } }"
      >
        <template slot-scope="{ result: { loading, error, data } }">
          <!-- Loading -->
          <p class="tc" v-if="loading">
            <span class="v-mid dib f6">加载中  </span><inline-loading></inline-loading>
          </p>

          <!-- Error -->
          <div v-else-if="error" v-transfer-dom>
            <alert title="出错了" :content="error.message"></alert>
          </div>

          <!-- Result -->
          <div v-else-if="data" class="result apollo">
            <panel header="更早以前" :type="layout" :list="addToList('earlier', transformRecordsToList(data.records))"
                   @on-click-footer="subscribeMore" :footer="earlierFooter"></panel>
          </div>

          <!-- No result -->
          <div v-else class="no-result apollo"></div>
        </template>
      </ApolloQuery>
      <div class="no-result apollo pt6" v-if="!showEarlier&&!showRecent">
        <x-icon type="ios-information-outline" size="60"></x-icon>
        <div>还没有借书记录，快去借一本吧</div>
      </div>
    </template>
    <div v-if="!showReading && state === 'BORROWED'" class="tc pt6">
      <x-icon type="ios-information-outline" size="60"></x-icon>
      <div>没有正在读的书哦，快去借一本吧</div>
    </div>
    <div v-transfer-dom>
      <actionsheet :menus="menus" v-model="showLayout" @on-click-menu="click"></actionsheet>
    </div>
  </div>
</template>

<script>
  import { Tab, TabItem, XHeader, Panel, dateFormat, Actionsheet, Alert } from 'vux'
  import { GetLogedUserQuery } from '../constants/graphql-queries'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'borrow-history',
    data () {
      return {
        logedUser: null,
        layout: '1',
        showLayout: false,
        menus: {
          menu1: '图文简介',
          menu2: '文字简介',
          menu3: '标题列表',
          menu4: '文字详述',
          menu5: '图文详述'
        },
        state: 'BORROWED',
        footer: { title: '加载更多' },
        recentFooter: { title: '加载更多' },
        earlierFooter: { title: '加载更多' },
        showReading: true,
        showEarlier: false,
        earlierLoaded: false, // earlier数据是否加载过
        showRecent: true,
        monthAgo: new Date(new Date().valueOf() - 86400000 * 30),
        skip: 0, // 已读完Tab中一个月以内借书记录的页码
        index: 0, // 已读完Tab中更早以前借书记录的页码
        limit: 5,
        page: 0, // 正在读Tab的页码
        reading: [],
        recent: [], // 最近一个月的借书记录
        earlier: [], // 更早以前的借书记录
        imgMap: new Map()
      }
    },
    components: {
      Tab,
      TabItem,
      XHeader,
      Panel,
      Actionsheet,
      Alert
    },
    methods: {
      isSelected (state) {
        return state === this.state
      },
      recoverPicture (pic) {
        if (pic && pic.file) {
          if (this.imgMap.has(pic.file)) return this.imgMap.get(pic.file)
          else {
            const url = transformUploadToURL(pic.file)
            this.imgMap.set(pic.file, url)
            return url
          }
        }
        return require('../assets/nophoto.gif')
      },
      authorIntro (authors) {
        const append = authors.length > 1 ? '等' : ''
        return `${authors[0]}${append}著`
      },
      dateIntro (opt) {
        if (opt.deadline) return `${dateFormat(new Date(opt.deadline), 'YYYY年MM月DD日')}到期`
        if (opt.date && opt.returnDate) {
          const from = dateFormat(new Date(opt.date), 'YYYY年MM月DD日')
          const to = dateFormat(new Date(opt.returnDate), 'YYYY年MM月DD日')
          return `阅读于:${from}--${to}`
        }
      },
      transformRecordsToList (records) {
        return records.map(record => {
          const { date, deadline, returnDate } = record
          const opts = this.state === 'BORROWED' ? { deadline } : { date, returnDate }
          return {
            id: record.id,
            src: this.recoverPicture(record.book.picture),
            title: record.book.title,
            desc: record.book.summary,
            url: {
              path: `/books/${record.book.id}`,
              replace: false
            },
            meta: {
              source: this.authorIntro(record.book.authors),
              other: this.dateIntro(opts)
            }
          }
        })
      },
      addToList (listName, added) {
        if (added.length === 0 && listName === 'reading') {
          if (this.reading.length) this.footer = { title: '没有更多数据了' }
          else if (this.showReading) {
            this.showReading = false
          }
        }
        if (added.length === 0 && listName === 'recent') {
          // 如果要添加的recent数据为空，而且earlier数据尚未加载，就暂时把recentFooter显示为空，随后如果earlier面板不显示的话，还会修改recentFooter为'没有更多数据了'
          if (this.recentFooter.title && !this.earlierLoaded) this.recentFooter.title = ''
          // 如果recent数据为空，就不显示recent面板
          if (this.showRecent && this.recent.length === 0) this.showRecent = false
          // 如果recent数据已经加载完了（即added长度为0）,且earlier数据还未加载，就加载earlier数据
          if (!this.earlierLoaded) {
            this.showEarlier = true
            this.earlierLoaded = true
          }
        }
        if (added.length === 0 && listName === 'earlier') {
          // 如果earlier数据为空，不显示earlier面板
          if (this.showEarlier && this.earlier.length === 0) this.showEarlier = false
          // 如果earlier数据为空，而recent数据不为空，就把'没有更多数据了'显示在recent面板上，因为此时earlier面板是不显示的
          if (!this.showEarlier && this.showRecent) {
            this.recentFooter = { title: '没有更多数据了' }
          }
          // 如果显示earlier面板，但要添加的数据（added）为空,说明earlier数据加载完了，把'没有更多数据了'显示在earlier面板上
          if (this.showEarlier) this.earlierFooter = { title: '没有更多数据了' }
        }
        const exclude = added.filter(record => !this.contains(listName, record))
        // 如果要添加的数据在list中没有，才修改list，不加这个判断会导致无限循环（因为即使added是空数组仍然修改list，而修改list会导致页面刷新，刷新又会导致使用空数组调用此方法）
        if (exclude.length) this[listName] = this[listName].concat(exclude)
        return this[listName]
      },
      contains (listName, record) {
        return this[listName].some(({ id }) => id === record.id)
      },
      loadMore () {
        if (this.footer.title !== '没有更多数据了') this.page ++
      },
      fetchMore () {
        if (this.recentFooter.title !== '没有更多数据了') this.skip ++
      },
      subscribeMore () {
        if (this.earlierFooter.title !== '没有更多数据了') this.index ++
      },
      click (key) {
        this.layout = key.replace('menu', '')
      }
    },
    apollo: {
      logedUser: {
        query: GetLogedUserQuery
      }
    }
  }
</script>

<style scoped>
  .vux-header{
    background-color: #fff;
  }
  .custom >>> .vux-header-title-area{
    height: 50px;
  }
  .apollo >>> .weui-panel .weui-panel__ft{
    text-align: center;
  }
  .no-result{
    text-align: center;
  }
</style>
