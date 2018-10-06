<template>
  <group class="mt0">
    <transition name="drawer">
      <component :is="view" :options="list" :value="value" @on-change="change" label-position="left" class="indent"></component>
      <!--<component :is="view" :options="list" @on-change="change" label-position="left" class="indent" v-else></component>-->
    </transition>
  </group>
</template>

<script>
  import { Group, Radio, Checklist } from 'vux'

  export default {
    name: 'drawer',
    components: { Group, Radio, Checklist },
    computed: {
      view: function () {
        return this.selector === 'radio' ? 'radio' : 'checklist'
      }
    },
    props: {
      list: {
        type: Array,
        required: true,
        validator: function (value) {
          if (value.length === 0) return true
          return value.every(item => item.key && item.value)
        }
      },
      selector: {
        type: String,
        default: 'radio',
        validator: function (value) {
          return ['radio', 'checkbox'].indexOf(value) !== -1
        }
      },
      value: [String, Array, null],
      name: {
        type: String,
        required: true
      }
    },
    methods: {
      change (value, label) {
        this.$emit('selectChanged', { label, value, name: this.name })
      }
    }
  }
</script>

<style scoped>
  .mt0 >>> .weui-cells{
    margin-top: 0;
    background-color: #f4f4f4;
  }
  /*无效果*/
  .drawer-enter, .drawer-leave-to{
    opacity: 0;
    height: 0;
  }
  .drawer-enter-active, .drawer-leave-active{
    transition: all .5s ease;
  }
</style>
