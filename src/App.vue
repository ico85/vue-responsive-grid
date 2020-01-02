<template>
  <div id="app">

    <grid-layout :current-layout.sync="currentLayout"
                 ref="gridLayout"
                 :last-breakpoint.sync="lastBreakpoint"
                 :responsiveLayouts="responsiveLayouts"
                 :breakpoints.sync="breakpoints">

      <grid-item v-for="item in currentLayout" ref="gridItem"
                 :key="item.i"
                 :x="item.x"
                 :y="item.y"
                 :w="item.w"
                 :h="item.h"
                 :i="item.i">
      </grid-item>

    </grid-layout>

    <button @click="addGridItem()">ADD</button>
  </div>
</template>

<script>

import GridLayout from './components/GridLayout.vue';
import GridItem from './components/GridItem.vue';

export default {
  name: 'app',
  data() {
    return {
      lastBreakpoint: null,
      currentLayout: [],
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 320},
      responsiveLayouts: {"lg":[{"x":2,"y":4,"w":2,"h":2,"i":0,"moved":false},{"x":1,"y":2,"w":2,"h":2,"i":1,"moved":false},{"x":0,"y":0,"w":2,"h":2,"i":2,"moved":false}],"md":[{"x":8,"y":0,"w":4,"h":4,"i":0,"moved":false},{"x":0,"y":2,"w":8,"h":2,"i":1,"moved":false},{"x":0,"y":0,"w":8,"h":2,"i":2,"moved":false}],"sm":[{"x":2,"y":0,"w":2,"h":2,"i":0,"moved":false},{"x":0,"y":0,"w":2,"h":1,"i":1,"moved":false},{"x":4,"y":0,"w":2,"h":1,"i":2,"moved":false}],"xs":[{"x":0,"y":0,"w":4,"h":1,"i":0,"moved":false},{"x":2,"y":1,"w":2,"h":1,"i":1,"moved":false},{"x":0,"y":1,"w":2,"h":1,"i":2,"moved":false}],"xxs":[{"x":1,"y":1,"w":1,"h":1,"i":0,"moved":false},{"x":1,"y":0,"w":1,"h":1,"i":1,"moved":false},{"x":0,"y":0,"w":1,"h":2,"i":2,"moved":false}]}
    }
  },

  mounted() {
  },
  methods: {
    addGridItem() {
      this.$refs.gridLayout.$emit("add-item");
    }
  },
  watch: {
    currentLayout() {

    }
  },
  components: {GridLayout, GridItem}
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  /*** EXAMPLE ***/
  #content {
    width: 100%;
    margin-top:10px;
  }

  .vue-grid-layout {
    background: #eee;
  }

  .layoutJSON {
    background: #ddd;
    border: 1px solid black;
    margin-top: 10px;
    padding: 10px;
  }

  .eventsJSON {
    background: #ddd;
    border: 1px solid black;
    margin-top: 10px;
    padding: 10px;
    height: 100px;
    overflow-y: scroll;
  }

  .columns {
    -moz-columns: 120px;
    -webkit-columns: 120px;
    columns: 120px;
  }



  .vue-resizable-handle {
    z-index: 5000;
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=');
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
  }

  .vue-grid-item:not(.vue-grid-placeholder) {
    background: #ccc;
    border: 1px solid black;
  }

  .vue-grid-item.resizing {
    opacity: 0.9;
  }

  .vue-grid-item.static {
    background: #cce;
  }

  .vue-grid-item .text {
    font-size: 24px;
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: 100%;
    width: 100%;
  }

  .vue-grid-item .no-drag {
    height: 100%;
    width: 100%;
  }

  .vue-grid-item .minMax {
    font-size: 12px;
  }

  .vue-grid-item .add {
    cursor: pointer;
  }

  .vue-draggable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    left: 0;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#999999'/></svg>") no-repeat;
    background-position: bottom right;
    padding: 0 8px 8px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: pointer;
  }
}
</style>
