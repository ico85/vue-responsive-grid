<template>
  <div id="app">

    <input type="number" class="cclt__grid-margin cclt__controls-input"
           v-model.lazy.number="currentColCount"/>

    {{ maxColCount }}

    <grid-layout :current-layout.sync="currentLayout"
                 v-if="dataready"
                 :layouts.sync="layouts"
                 ref="gridLayout"
                 :margin.sync="margin"
                 @mounted-and-resized="gridMountedAndResized"
                 :cols.sync="cols"
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
        currentColCount: 2,
        margin: {lg: 10, md: 10, sm: 10, xs: 10, xxs: 10},
        cols: null,
        currentLayout: null,
        breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 320},
        layouts: null,
        maxColCount: -1,
        dataready: false,
      }
    },

    mounted() {

      console.log("mounted app");

      this.breakpoints = {lg: 1300, md: 996, sm: 768, xs: 480, xxs: 320};
      setTimeout(() => {
        this.dataready = true;
      }, 4000);
    },
    methods: {
      gridMountedAndResized() {
        console.log("mounted and resized yoar");
        console.log(this.currentLayout);
      },
      addGridItem() {
        this.$refs.gridLayout.$emit("add-item");
      }
    },
    watch: {

      currentColCount() {

        let cols = Object.assign({}, this.cols);
        let maxColCount = this.$refs.gridLayout.maxCols["lg"];
        console.log("maxColcount", maxColCount);

        if (this.currentColCount > maxColCount) {
          this.currentColCount = maxColCount + 1;
        }

        cols["lg"] = this.currentColCount;

        this.cols = cols;

      },
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
      margin-top: 10px;
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
