<template>
  <div class="indent">
    <radio :options="list" :value="value" @on-change="change"></radio>
    <radio :options="children" v-if="children.length" class="child" @on-change="childChange"></radio>
  </div>
</template>

<script>
  import { Radio } from 'vux'
  import { GetChildrenByPathQuery } from '../constants/graphql-queries'

  export default {
    name: 'nested-drawer',
    data () {
      return {
        childrenByPath: [],
        paths: null,
        childrenSelected: false
      }
    },
    apollo: {
      childrenByPath: {
        query: GetChildrenByPathQuery,
        variables () {
          const path = this.paths ? this.paths.join('/') : this.path
          return { path }
        }
      }
    },
    components: {
      Radio
    },
    computed: {
      value: function () {
        if (this.childrenSelected && this.children.length) return ''
        return this.list[this.list.length - 1]
      },
      list: function () {
        return this.paths || this.path.split('/')
      },
      children: function () {
        return this.childrenByPath.map(({label}) => label)
      }
    },
    props: {
      path: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    methods: {
      change (value) {
        const i = this.list.indexOf(value)
        if (i > -1) {
          this.paths = this.list.slice(0, i + 1)
          this.childrenSelected = false
          const category = this.paths.join('/')
          this.$emit('selectChanged', { label: value, value: category, name: this.name })
        }
      },
      childChange (value) {
        this.childrenSelected = true
        this.paths = [...this.list, value]
        const category = this.paths.join('/')
        this.$emit('selectChanged', { label: value, value: category, name: this.name })
      }
    }
  }
</script>

<style scoped>
  .indent .child{
    text-indent: 2rem;
  }
</style>
