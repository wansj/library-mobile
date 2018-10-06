<template>
  <view-box>
    <ApolloQuery v-for="child in children" :key="child.id"
      :query="require('../constants/graphql-queries').GetChildrenCategoriesQuery"
      :variables="{id: child.id}"
    >
      <template slot-scope="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>
        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occured</div>
        <!-- Result -->
        <div v-else-if="data && data.childrenCategories.length" class="result apollo bg-white mr3">
          <group-title>{{child.label}}</group-title>
          <grid :cols="3" :show-lr-borders="false" class="fixed-height">
            <grid-item v-for="category in data.childrenCategories" :key="category.id"
                       class="lh-title flex items-center justify-center" :link="{path: `/search?category=${[label, category.label].join('/')}`}">
              <span class="grid-center">{{category.label}}</span>
            </grid-item>
          </grid>
        </div>
        <div v-else-if="data && data.childrenCategories.length === 0">
          <group>
            <cell :title="child.label" inline-desc="没有更细的分类了" :link="{path: `/search?category=${[label, child.label].join('/')}`}">
              <span class="gold f5">进入</span>
            </cell>
          </group>
        </div>
        <div v-else></div>
      </template>
    </ApolloQuery>
  </view-box>
</template>

<script>
  import { Grid, GridItem, GroupTitle, ViewBox, Group, Cell } from 'vux'

  export default {
    name: 'category-details',
    props: {
      children: {
        type: Array,
        required: true
      },
      label: {
        type: String,
        required: true
      }
    },
    components: { Grid, GridItem, GroupTitle, ViewBox, Group, Cell }
  }
</script>

<style scoped>
  .grid-center {
    display: block;
    text-align: center;
    color: #666;
  }
  .fixed-height >>> a{
    height: 60px;
    padding: 0 10px;
  }
</style>
