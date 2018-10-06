<template>
  <div>
    <div v-transfer-dom><loading :show="loadingStatus.loading" text=""></loading></div>
    <x-header title="用户信息"></x-header>
    <group v-if="logedUser">
      <cell title="头像" :link="generateLink('avatar')" class="no-arrow">
        <img slot="child" class="right-0 w3 h3" :src="recoverPicture()">
      </cell>
      <cell title="昵称" :value="logedUser.username" :link="generateLink('username')"></cell>
      <cell title="电子邮件" :value="logedUser.email" :link="generateLink('email')"></cell>
      <cell title="单位" :value="logedUser.department" :link="generateLink('department')"></cell>
      <popup-radio title="角色" v-model="role" :options="roles"></popup-radio>
    </group>
    <group v-if="logedUser" title="借书权限">
      <cell title="每次可借" :value="formatDays(logedUser.role.maxBorrowDuration)"></cell>
      <cell title="最多可借" :value=formatCount(logedUser.role.maxHoldCount)></cell>
      <cell title="最多可续借" :value="formatTimes(logedUser.role.maxDelayTimes)"></cell>
      <cell title="每次可续借" :value="formatDays(logedUser.role.maxDelayDays)"></cell>
    </group>
  </div>
</template>

<script>
  import { XHeader, PopupRadio, Group, Cell, Loading } from 'vux'
  import { GetLogedUserQuery, GetAvailableRolesQuery } from '../constants/graphql-queries'
  import { EditUserMutation } from '../constants/graphql-mutations'
  import { GetLoadingStatusQuery } from '../store/LoadingStatus'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'user-details',
    data () {
      return {
        loadingStatus: null,
        logedUser: null,
        availableRoles: null,
        imgMap: new Map()
      }
    },
    computed: {
      role: {
        get: function () {
          if (this.logedUser) return this.logedUser.role.id
          return ''
        },
        set: function (value) {
          if (value !== this.logedUser.role.id) {
            this.$apollo.mutate({
              mutation: EditUserMutation,
              variables: {
                userId: this.logedUser.id,
                role: value
              }
            })
          }
        }
      },
      roles: function () {
        if (this.availableRoles) {
          return this.availableRoles.map(({id, name}) => ({key: id, value: name}))
        }
        return []
      }
    },
    components: {
      XHeader,
      PopupRadio,
      Group,
      Cell,
      Loading
    },
    apollo: {
      loadingStatus: {
        query: GetLoadingStatusQuery
      },
      logedUser: {
        query: GetLogedUserQuery
      },
      availableRoles: {
        query: GetAvailableRolesQuery
      }
    },
    methods: {
      generateLink (field) {
        return `/editUser?field=${field}&&value=${this.logedUser[field]}&&id=${this.logedUser.id}`
      },
      formatCount (count) {
        return `${count}本`
      },
      formatDays (val) {
        return `${val}天`
      },
      formatTimes (times) {
        return `${times}次`
      },
      recoverPicture () {
        if (this.logedUser && this.logedUser.photo) {
          if (this.imgMap.has(this.logedUser)) return this.imgMap.get(this.logedUser)
          else {
            const url = transformUploadToURL(this.logedUser.photo.file)
            this.imgMap.set(this.logedUser, url)
            return url
          }
        }
        return '../assets/me.png'
      }
    }
  }
</script>

<style scoped>
  .no-arrow >>> .weui-cell__ft:after{
    border-color: transparent;
  }
</style>
