<template>
  <div>
    <x-header :left-options="{backText: headerTitle}" class="custom">
      <div slot="right" class="bn"><x-button :disabled="!canSave()" @click.native="save" class="light-green" plain mini>保存</x-button></div>
    </x-header>
    <div v-if="this.field === 'avatar'" class="w4 ml-auto mr-auto mt3">
      <div class="w-100 h4 ba b--white mb3 bg-white tc img-container">
        <img :src="imgSrc" class="w-100 h-100" v-if="imgSrc">
        <i class="iconfont vux-icon-lib-picture f1" v-else></i>
      </div>
      <x-button type="primary" @click.native="showSelectDlg">上传头像</x-button>
      <input type="file" accept="image/*;" class="dn" ref="upload" @change="uploadAvatar"/>
    </div>
    <group class="bt-0 ph3" v-else>
      <x-input :type="inputType" v-model="val" :is-type="validator" ref="input" @on-change="onChanged" show-clear class="bg-near-white"/>
    </group>
    <div v-transfer-dom>
      <alert v-model="showAlert">{{errMsg}}</alert>
    </div>
  </div>
</template>

<script>
  import { Alert, XButton, XInput, XHeader, Group } from 'vux'
  import { EditUserMutation, UploadFileMutation } from '../constants/graphql-mutations'
  import { GetFileByIDQuery, GetLogedUserQuery } from '../constants/graphql-queries'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'edit-user',
    data () {
      return {
        val: this.value,
        changed: false,
        showAlert: false,
        fileByID: null,
        errMsg: '修改成功'
      }
    },
    components: { Alert, XButton, XInput, XHeader, Group },
    computed: {
      imgSrc: function () {
        if (this.fileByID) {
          return transformUploadToURL(this.fileByID.file)
        }
        return ''
      },
      validator: function () {
        const fn = (str) => {
          if (str.trim().length > 0) return { valid: true }
          else return { valid: false, msg: '不能为空' }
        }
        return this.field === 'email' ? 'email' : fn
      },
      inputType: function () {
        return this.field === 'email' ? 'email' : 'text'
      },
      headerTitle: function () {
        switch (this.field) {
          case 'email':
            return '更改密保邮箱'
          case 'username':
            return '更改昵称'
          case 'department':
            return '更改单位'
          case 'avatar':
            return '更改头像'
        }
      }
    },
    methods: {
      canSave () {
        if (this.changed) {
          return this.field === 'avatar' || this.$refs.input.valid
        } else {
          return false
        }
      },
      save () {
        this.$apollo.mutate({
          mutation: EditUserMutation,
          variables: {
            userId: this.id,
            [this.field]: this.val
          },
          refetchQueries: [{query: GetLogedUserQuery}]
        }).then(() => (this.showAlert = true))
      },
      onChanged (value) {
        this.changed = value !== this.value
      },
      showSelectDlg () {
        this.$refs.upload.dispatchEvent(new MouseEvent('click'))
      },
      uploadAvatar () {
        const file = this.$refs.upload.files && this.$refs.upload.files[0]
        if (!file) return
        const isImg = /^image\//.test(file.type)
        const isLt1M = file.size / 1024 / 1024 < 1
        if (!isImg) {
          this.showAlert = true
          this.errMsg = '只能选择图片!'
        } else if (!isLt1M) {
          this.showAlert = true
          this.errMsg = '上传图片大小不能超过 1MB!'
        } else {
          this.$apollo.mutate({
            mutation: UploadFileMutation,
            variables: {
              file,
              tag: 'USER'
            }
          }).then(({data}) => {
            this.val = data.singleUpload.id // 由于val发生了变化，GetFileByIDQuery会响应变化
            this.changed = true
          })
        }
      }
    },
    mounted: function () {
      if (this.field !== 'avatar') this.$refs.input.focus()
      else {
        this.$apollo.addSmartQuery('fileByID', {
          query: GetFileByIDQuery,
          variables () {
            return { id: this.val }
          }
        })
      }
    },
    props: {
      field: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      id: {
        type: String,
        required: true
      }
    }
  }
</script>

<style scoped>
  .bn >>> button{
    border: none;
    font-size: 14px;
    padding: 0;
  }
  .custom.vux-header >>> .vux-header-right{
    height: 100%;
    top: 0;
    padding-top: 7px;
  }
  .bn >>> .light-green{
    color: green;
  }
  .bt-0 >>> .weui-cells:before{
    border-top: none;
  }
  .bt-0 >>> .weui-cells:after{
    border-bottom-color: lightgreen;
  }
  .img-container{
    line-height: 8rem;
  }
  .img-container >>> .f1{
    font-size: 3rem;
  }
</style>
