<template>
  <div>
    <x-header title="书友验证" class="custom-right">
      <div slot="overwrite-left" @click="$router.back()">取消</div>
      <!--<x-button slot="right" class="green" @click.native="addFriend" :disabled="!canSend" mini plain>发送</x-button>-->
      <a @click="addFriend" slot="right" :class="{enabled: canSend, disabled: !canSend}">发送</a>
    </x-header>
    <msg :title="msgTitle" :description="msgDescription" :icon="msgIcon" v-if="showMsg">
      <template slot="buttons">
        <x-button type="primary" link="/friends">返回</x-button>
      </template>
    </msg>
    <group title="你需要发送验证申请，等对方通过" v-else>
      <x-input required v-model="validateMessage"></x-input>
    </group>
  </div>
</template>

<script>
  import { XHeader, Group, XInput, XButton, Msg } from 'vux'
  import { GetLogedUserQuery } from '../constants/graphql-queries'
  import { AddFriendMutation } from '../constants/graphql-mutations'
  import { FriendApprovedSubscription } from '../constants/graphql-subscriptions'

  export default {
    name: 'validate-friend',
    data () {
      return {
        validateMessage: '',
        showMsg: false,
        optErr: '',
        msgDesc: '',
        logedUser: null
      }
    },
    apollo: {
      logedUser: { query: GetLogedUserQuery },
      $subscribe: {
        friendApproved: {
          query: FriendApprovedSubscription,
          variables () {
            return { userId: this.logedUser.id }
          },
          result ({ data }) {
            if (data.friendApproved && this.showMsg && !this.optErr) {
              this.msgDesc = '对方已经通过了您的好友申请，开始聊天吧'
            }
          }
        }
      }
    },
    computed: {
      canSend: function () {
        return this.validateMessage.trim().length > 0
      },
      msgTitle: function () {
        return this.optErr ? '操作失败' : '发送成功'
      },
      msgDescription: function () {
        return this.optErr || this.msgDesc
      },
      msgIcon: function () {
        return this.optErr ? 'warn' : 'success'
      }
    },
    methods: {
      addFriend () {
        if (!this.canSend) return
        this.$apollo.mutate({
          mutation: AddFriendMutation,
          variables: {
            friend: this.friendId,
            validateMessage: this.validateMessage
          }
        }).then(() => {
          this.showMsg = true
          this.msgDesc = '等待对方通过验证'
        }).catch(e => {
          this.showMsg = true
          this.optErr = e.message
        })
      }
    },
    components: { XHeader, Group, XInput, XButton, Msg },
    props: {
      friendId: {
        type: String,
        required: true
      }
    }
  }
</script>

<style scoped>
  .vux-header .vux-header-right a.enabled{
    color: limegreen;
  }
  .vux-header .vux-header-right a.disabled{
    color: rgba(0,128,0,.7);
  }
</style>
