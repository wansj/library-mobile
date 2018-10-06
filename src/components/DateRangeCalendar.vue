<template>
  <div class="vux-calendar">
    <cell
      :title="title"
      primary="content"
      @click.native="onClick">
      <span class="vux-cell-placeholder" v-if="shouldShowPlaceholder">{{ placeholder }}</span>
      <span class="vux-cell-value" v-if="!shouldShowPlaceholder">{{ displayFormat(value, getType(value)) }}</span>
    </cell>
    <div v-transfer-dom>
      <popup
        v-model="show"
        @on-show="onPopupShow"
        @on-hide="onPopupHide">

        <popup-header
          @on-click-left="onClickLeft"
          @on-click-right="onClickRight"
          :title="popupHeaderTitle"
          left-text="取消"
          right-text="重置"></popup-header>

        <slot name="popup-before-calendar"></slot>

        <inline-calendar
          ref="inlineCalendar"
          v-model="currentValue"
          @on-change="onCalendarValueChange"
          :render-month="renderMonth"
          :start-date="startDate"
          :end-date="endDate"
          :show-last-month="showLastMonth"
          :show-next-month="showNextMonth"
          :highlight-weekend="highlightWeekend"
          :return-six-rows="returnSixRows"
          :hide-header="hideHeader"
          :hide-week-list="hideWeekList"
          :replace-text-list="replaceTextList"
          :weeks-list="weeksList"
          :render-function="renderFunction"
          :render-on-value-change="renderOnValueChange"
          :disable-past="disablePast"
          :disable-future="disableFuture"
          :marks="marks"
          :disable-weekend="disableWeekend"
          :disable-date-function="disableDateFunction"
        ></inline-calendar>

      </popup>
    </div>
  </div>
</template>

<script>
  import { InlineCalendar, Popup, Cell, PopupHeader, dateFormat } from 'vux'
  import props from 'vux/src/components/inline-calendar/props'

  const getType = (value) => {
    if (typeof value === 'string') {
      return 'string'
    }
    if (Object.prototype.toString.call(value) === '[object Array]') {
      return 'array'
    }
  }

  const pure = function (value) {
    const type = getType(value)
    if (type === 'string') {
      return value
    } else if (type === 'array') {
      return JSON.parse(JSON.stringify(value))
    }
  }

  const Props = {
    ...props(),
    title: {
      type: String,
      required: true
    },
    placeholder: String,
    popupHeaderTitle: String,
    displayFormat: {
      type: Function,
      default: (value) => {
        return typeof value === 'string' ? value : value.join(', ')
      }
    }
  }

  export default {
    name: 'date-range-calendar',
    components: {
      InlineCalendar,
      Popup,
      PopupHeader,
      Cell
    },
    computed: {
      shouldShowPlaceholder () {
        if (getType(this.value) === 'array' && !this.value.length) {
          return true
        }
        return false
      }
    },
    created () {
      if (this.value === 'TODAY') {
        this.currentValue = dateFormat(new Date(), 'YYYY-MM-DD')
        this.$emit('input', this.currentValue)
      } else {
        if (this.getType(this.value) === 'string') {
          this.currentValue = this.value
        } else {
          this.currentValue = pure(this.value)
        }
      }
    },
    props: Props,
    methods: {
      onPopupShow () {
        this.$emit('on-show')
      },
      onPopupHide () {
        this.$emit('on-hide')
        // reset value to show value
        this.currentValue = pure(this.value)
      },
      getType,
      onClickLeft () {
        this.show = false
        this.currentValue = pure(this.value)
      },
      onClickRight () {
        this.currentValue = []
      },
      onClick () {
        this.show = true
      },
      onCalendarValueChange (val) {
        if (val instanceof Array && val.length > 1) {
          this.show = false
          this.$emit('on-change', val.slice(-2).sort((a, b) => new Date(a) > new Date(b)))
        }
      },
      switchViewToMonth (year, month) {
        this.$refs.inlineCalendar.switchViewToMonth(year, month)
      }
    },
    data () {
      return {
        show: false,
        currentValue: this.value || []
      }
    }
  }
</script>

<style lang="less">
  @import '~vux/src/styles/1px.less';
  .vux-calendar {
    position: relative;
    &:before {
      .setTopLine(#D9D9D9);
      left: 15px;
    }
  }
</style>
