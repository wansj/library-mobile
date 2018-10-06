<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import '~vux/src/styles/1px.less';

.vux-1px-b-active {
  &:after {
    .setBottomLine(#19a974);
  }
}

html{
  height: 100%;
  background-color: #f4f4f4;
  overflow-x: hidden;
}
body, #app{
  overflow-x: hidden;
  height: 100%;
}
.b--line{
  border-color: #D9D9D9;
}
</style>
