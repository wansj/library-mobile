<template>
    <div>
      <x-header :left-options="{backText:'添加书友'}"></x-header>
      <group>
        <x-input placeholder="用户名/电子邮件" @on-enter="doSearch" v-model="search">
          <icon type="search" slot="label" class="mr3"></icon>
        </x-input>
      </group>
      <group title="查询结果" v-if="showResult">
        <cell v-if="findedUser">
          <h1 slot="title" class="lh-title f4 ml3 mv0 normal">{{findedUser.username}}</h1>
          <span slot="inline-desc" class="ml3 mt0">{{`单位: ${findedUser.department}`}}</span>
          <img :src="recoverPicture(findedUser.photo)" slot="icon" class="w3 h3">
          <x-button type="primary" mini v-if="canAdd" :link="{path: `/validateFriend?friendId=${findedUser.id}`}">添加</x-button>
          <span class="silver" v-else>{{addState}}</span>
        </cell>
        <cell-box class="justify-center no-matched silver" v-else>未找到符合条件的书友</cell-box>
      </group>
    </div>
</template>

<script>
  import { XHeader, Group, XInput, Icon, Alert, Cell, CellBox, XButton } from 'vux'
  import { GetUserByNameOrEmailQuery } from '../constants/graphql-queries'
  // import { AddFriendMutation } from '../constants/graphql-mutations'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'add-friend',
    data () {
      return {
        showResult: false,
        findedUser: null,
        search: '',
        addStatus: '',
        imgMap: new Map()
      }
    },
    methods: {
      recoverPicture (pic) {
        if (pic && pic.file) {
          if (this.imgMap.has(pic.file)) return this.imgMap.get(pic.file)
          else {
            const url = transformUploadToURL(pic.file)
            this.imgMap.set(pic.file, url)
            return url
          }
        }
        return require('../assets/me.png')
      },
      async doSearch () {
        if (this.search.trim() !== '') {
          try {
            const {data} = await this.$apollo.query({
              query: GetUserByNameOrEmailQuery,
              variables: {search: this.search}
            })
            this.showResult = true
            if (data.userByNameOrEmail.friend) {
              this.findedUser = {...data.userByNameOrEmail.friend}
              this.addStatus = data.userByNameOrEmail.status
            } else {
              this.findedUser = null
            }
          } catch (e) {
            this.$vux.alert.show({
              title: '出错了',
              content: e.message
            })
          }
        } else {
          this.findedUser = null
        }
      }
    },
    computed: {
      canAdd: function () {
        return this.addStatus === 'None'
      },
      addState: function () {
        if (this.addStatus === 'Approved') return '已添加'
        else if (this.addStatus === 'Unapproved') return '等待验证'
      }
    },
    components: {
      XHeader,
      XInput,
      Group,
      Icon,
      Alert,
      Cell,
      CellBox,
      XButton
    }
  }
</script>

<style scoped>
  .no-matched{
    height: 90px;
  }
</style>
