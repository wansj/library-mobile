<template>
  <group class="absolute shadow-1 w5 z-999 wrapper">
    <sticky slot="title" class="flex justify-between items-end pt3 ph3">
      <span class="b f5">筛选</span>
      <span class="f6 blue" v-if="showClearAll" @click="clearFilters">全部清除</span>
    </sticky>
    <cell title="图书类别" :inline-desc="categoryDesc" :arrow-direction="arrowDirection('categories')" @click.native="toggleDrawer('categories')" is-link></cell>
    <nested-drawer :path="category" name="categories" v-show="opened === 'categories'" @selectChanged="propagateUp"></nested-drawer>
    <cell title="排序" :inline-desc="sortBy" :arrow-direction="arrowDirection('sort')" @click.native="toggleDrawer('sort')" is-link></cell>
    <drawer :list="sort" name="sort" :value="sortDrawerVal" @selectChanged="propagateUp" v-show="opened === 'sort'"></drawer>
    <cell title="作者" :inline-desc="selectedAuthors" :arrow-direction="arrowDirection('authors')" @click.native="toggleDrawer('authors')" is-link></cell>
    <ApolloQuery :query="require('../constants/graphql-queries').GetPopularAuthorsQuery" :variables="{category}" v-if="opened === 'authors'">
      <template slot-scope="{ result: { data } }">
        <drawer :list="data.popularAuthors.map(name => ({key: name, value: name}))" selector="checkbox" name="authors"
                :value="authorsDrawerVal" @selectChanged="propagateUp" v-if="data"></drawer>
      </template>
    </ApolloQuery>
    <cell title="出版社" :inline-desc="publisherDesc" :arrow-direction="arrowDirection('publisher')" @click.native="toggleDrawer('publisher')" is-link></cell>
    <ApolloQuery :query="require('../constants/graphql-queries').GetPublishersQuery" :variables="{category}" v-if="opened === 'publisher'">
      <template slot-scope="{ result: { data } }">
        <drawer :list="data.publishers.map(name => ({key: name, value: name}))" name="publisher"
                :value="publishersDrawerVal" @selectChanged="propagateUp" v-if="data"></drawer>
      </template>
    </ApolloQuery>
    <cell title="在库状况" :inline-desc="stockDesc" :arrow-direction="arrowDirection('stock')" @click.native="toggleDrawer('stock')" is-link></cell>
    <drawer :list="[{key: '只显示有库存图书', value: '只显示有库存图书'}]" selector="checkbox" name="stock" :value="stockDrawerVal"
            @selectChanged="propagateUp" v-show="opened === 'stock'"></drawer>
  </group>
</template>

<script>
  import { Group, Cell, Sticky } from 'vux'

  export default {
    name: 'filter-popup',
    components: {
      Group,
      Cell,
      Sticky,
      'drawer': () => import('./Drawer.vue').then(m => m.default),
      'nested-drawer': () => import('./NestedDrawer.vue').then(m => m.default)
    },
    data () {
      return {
        sort: [{key: 'clicked', value: '人气'}, {key: 'score', value: '用户评分'}, {key: 'pubDate', value: '出版日期'}],
        filters: {},
        opened: '',
        sortBy: '人气',
        selectedAuthors: '',
        stockDesc: '',
        publisherDesc: '',
        categoryDesc: this.category.split('/').pop(),
        stockLoaded: false,
        authorsLoaded: false
      }
    },
    computed: {
      showClearAll: function () {
        return this.filterCount || (this.sortBy !== '人气')
      },
      filterCount: function () {
        return Object.keys(this.filters).length
      },
      sortDrawerVal: function () {
        return this.sort.filter(({ value }) => value === this.sortBy).pop().key
      },
      authorsDrawerVal: function () {
        // 初始值不能设为空数组，因为空数组[]转换为Boolean的值是true,会导致checklist自动触发on-change事件，而我们不想在checklist初始化时发出change事件
        if (!this.selectedAuthors && !this.authorsLoaded) {
          this.authorsLoaded = true
          return null
        }
        return this.selectedAuthors ? this.selectedAuthors.split(',') : []
      },
      stockDrawerVal: function () {
        // 初始值不能设为空数组，因为空数组[]转换为Boolean的值是true,会导致checklist自动触发on-change事件，而我们不想在checklist初始化时发出change事件
        // 但是如果不是第一次加载并且stockDesc为空字符串的话，就不能传递null给checklist了，因为这会导致如下的错误：
        // checklist的checkbox绑定了currentValue属性，取消选中，会修改checklist的currentValue为[]-->currentValue被watch了，所以会触发checklist的on-change事件-->触发Drawer的selectChanged事件
        // -->修改FilterPopup的stockDesc为''-->自动计算FilterPopup的stockDrawerVal(如果还传递null的话)-->传递新的value(null)给Drawer-->传递新的value(null)给checklist
        // -->value被watch了，只要value和currentValue不一样就把value给currentValue（null当然不会等于[])-->导致null.map的错误（在checklist的getFullValue中使用了this.currentValue.map）
        if (!this.stockDesc && !this.stockLoaded) {
          this.stockLoaded = true
          return null
        }
        return this.stockDesc ? [this.stockDesc] : []
      },
      publishersDrawerVal: function () {
        return this.publisherDesc || ''
      }
    },
    props: {
      category: {
        type: String,
        required: true
      }
    },
    methods: {
      arrowDirection (name) {
        return this.opened === name ? 'up' : 'down'
      },
      propagateUp (obj) {
        const oldFilters = { ...this.filters }
        switch (obj.name) {
          case 'sort':
            this.sortBy = obj.label
            this.$emit('sortChanged', this.filters, null, obj.value)
            break
          case 'authors':
            this.selectedAuthors = obj.label.length > 1 ? obj.label.join(',') : obj.label[0]
            let { authors, ...rest } = this.filters
            rest = rest || {}
            this.filters = obj.label.length ? { ...rest, authors: obj.label } : rest
            this.$emit('filterChanged', this.filters, oldFilters, this.sortDrawerVal)
            break
          case 'stock':
            let { count, ...other } = this.filters
            other = other || {}
            this.filters = obj.label.length ? { ...other, count: 1 } : other
            this.$emit('filterChanged', this.filters, oldFilters, this.sortDrawerVal)
            this.stockDesc = obj.label[0]
            break
          case 'publisher':
            this.publisherDesc = obj.label
            this.filters = { ...this.filter, publisher: obj.label }
            this.$emit('filterChanged', this.filters, oldFilters, this.sortDrawerVal)
            break
          case 'categories':
            this.categoryDesc = obj.label
            this.filters = { ...this.filter, category: obj.value }
            this.$emit('filterChanged', this.filters, oldFilters, this.sortDrawerVal)
            break
        }
      },
      toggleDrawer (name) {
        if (this.opened !== name) this.opened = name
        else this.opened = ''
      },
      clearFilters () {
        this.$emit('filterChanged', {}, this.filters, this.sortDrawerVal)
        this.sortBy = '人气'
        this.selectedAuthors = ''
        this.stockDesc = ''
        this.publisherDesc = ''
        this.categoryDesc = this.category.split('/').pop()
        this.opened = ''
        this.filters = {}
      }
    }
  }
</script>

<style scoped>
  .wrapper{
    top: 4rem;
    right: .5rem;
    background-color: #f4f4f4;
  }
  .wrapper >>> .vux-no-group-title{
    overflow-y: auto;
    max-height: 400px;
  }
  .wrapper:before{
    position: absolute;
    display: block;
    top: -32px;
    right: 16px;
    z-index: 9999;
    content: ' ';
    width:0;
    height:0;
    overflow:hidden;
    font-size: 0;
    line-height: 0;
    border-width: 16px;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent silver transparent;
  }
  .wrapper:after{
    position: absolute;
    display: block;
    top: -28px;
    right: 18px;
    z-index: 9999;
    content: ' ';
    width:0;
    height:0;
    overflow:hidden;
    font-size: 0;
    line-height: 0;
    border-width: 14px;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent #f4f4f4 transparent;
  }
</style>
