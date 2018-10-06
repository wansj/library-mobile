<template>
  <div>
    <x-header title="关于我们"></x-header>
    <group title="开发者">
      <cell>
        <div slot="child" class="w-100 tc">
          <img src="../assets/my_avatar.jpeg" class="w3 h3">
        </div>
      </cell>
      <cell title="姓名" value="万书佳"></cell>
      <cell title="研究方向" value="Web全栈开发"></cell>
    </group>
    <group title="关键技术">
      <cell title="数据库" value="MongoDB"></cell>
      <cell title="前端技术" value="Vue"></cell>
      <cell title="后端架构" value="微服务架构：Micro"></cell>
      <cell title="网络连接" value="Graphql/Apollo"></cell>
    </group>
    <group title="联系我">
      <cell title="微信" value="mrryjrh_wsj"></cell>
      <cell title="QQ号" value="412414140"></cell>
      <cell title="邮箱" value="wsj-88488111@163.com"></cell>
    </group>
  </div>
</template>

<script>
  import { XHeader, Group, Cell } from 'vux'

  export default {
    name: 'about-me',
    components: {XHeader, Group, Cell}
  }
</script>

<style scoped>
  img{
    border-radius: 2rem;
  }
</style>
