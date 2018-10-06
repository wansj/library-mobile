<template>
  <div>
    <x-header>我的兴趣</x-header>
    <p class="tc" v-if="$apollo.queries.interests.loading || $apollo.queries.logedUser.loading">
      <span class="v-mid f6 dib">加载中&nbsp;&nbsp;</span><inline-loading></inline-loading>
    </p>
    <v-chart
      :data="chartData"
      :padding="[20, 'auto']"
      v-else-if="interests.length > 0 && logedUser"
      ref="chartComponent">
      <v-tooltip disabled />
      <v-scale y :options="yOptions" />
      <v-pie :radius="0.85" :inner-radius="0.7" series-field="category" :colors="colors" />
      <v-legend :options="legendOptions" />
      <v-guide type="html" :position="[ '50%', '45%' ]" :html="html" />
    </v-chart>
    <msg icon="info" title="暂无内容" description="由于您没有阅读记录，系统无法推断出您的读书兴趣" v-else></msg>
  </div>
</template>

<script>
  import { VChart, VScale, VTooltip, VLegend, VPie, VGuide, XHeader, Msg } from 'vux'
  import { GetInterestsQuery, GetLogedUserQuery } from '../constants/graphql-queries'

  export default {
    name: 'my-interests',
    components: { VChart, VScale, VTooltip, VLegend, VPie, VGuide, XHeader, Msg },
    data () {
      return {
        interests: [],
        chartData: [],
        logedUser: null,
        legendOptions: {
          position: 'right',
          itemFormatter: (val) => {
            return val + '  ' + this.map[val]
          }
        },
        yOptions: {
          formatter (val) {
            return val * 100 + '%'
          }
        }
      }
    },
    computed: {
      html: function () {
        return `
                <div style="width: 250px;height: 40px;text-align: center;">
                  <div class="f5">读书总数</div>
                  <div class="f3">${this.readCount}本</div>
                </div>
              `
      },
      colors: function () {
        const colors = ['#FE5D4D', '#3BA4FF', '#737DDE', '#22FE59', '#54FEDE', '#FEED23']
        return colors.slice(0, this.interests.length)
      },
      readCount: function () {
        return this.logedUser.statistics.readCount
      },
      map: function () {
        return this.interests.reduce((memo, item) => {
          memo = { ...memo, [item.category]: `${item.percent}%` }
          return memo
        }, {})
      }
    },
    apollo: {
      interests: {
        query: GetInterestsQuery,
        result ({ data }) {
          if (data && data.interests) {
            this.chartData = data.interests.map(({ category, count, percent }) => ({ category, count, percent }))
          }
        }
      },
      logedUser: { query: GetLogedUserQuery }
    }
  }
</script>

<style scoped>

</style>
