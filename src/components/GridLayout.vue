<template>
  <div ref="item" class="vue-grid-layout" :style="mergedStyle">
    <grid-item v-for="item in layout"
               :key="item.i"
               :x="item.x"
               :y="item.y"
               :w="item.w"
               :h="item.h"
               :i="item.i">
      {{item.i}}
    </grid-item>
    <grid-item class="vue-grid-placeholder"
               v-show="isDragging"
               :x="placeholder.x"
               :y="placeholder.y"
               :w="placeholder.w"
               :h="placeholder.h"
               :i="placeholder.i"></grid-item>
  </div>
</template>
<style>
  .vue-grid-layout {
    position: relative;
    transition: height 200ms ease;
  }
</style>
<script>
  import Vue from 'vue';

  var elementResizeDetectorMaker = require("element-resize-detector");

  import {
    bottom,
    compact,
    correctBounds,
    getLayoutItem,
    moveElement,
  } from '../helpers/utils';
  import {
    getBreakpointFromWidth,
    getColsFromBreakpoint,
  } from "../helpers/responsiveUtils";
  //var eventBus = require('./eventBus');

  import GridItem from './GridItem.vue'
  import {removeWindowEventListener} from "../helpers/DOM";

  export default {
    name: "GridLayout",
    provide() {
      return {
        eventBus: null
      }
    },
    components: {
      GridItem
    },
    props: {
      rowHeight: {
        type: Number,
        default: 35
      },
      // TODO make responsive
      margin: {
        type: Array,
        default: function () {
          return [10, 10];
        }
      },
      isDraggable: {
        type: Boolean,
        default: true
      },
      isResizable: {
        type: Boolean,
        default: true
      },
      responsiveLayouts: {
        type: Object,
        default: function () {
          return {};
        }
      },
      breakpoints: {
        type: Object,
        default: function () {
          return {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}
        }
      },
      cols: {
        type: Object,
        default: function () {
          return {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}
        },
      },
    },
    data: function () {
      return {
        width: null,
        mergedStyle: {},
        isDragging: false,
        placeholder: {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          i: -1
        },
        layouts: {}, // array to store all layouts from different breakpoints
        lastBreakpoint: null, // store last active breakpoint
        lastColCount: null, // store last column count
      };
    },
    created() {


      // Accessible refernces of functions for removing in beforeDestroy
      this.resizeEventHandler = (eventType, i, x, y, h, w) => {
        this.resizeEvent(eventType, i, x, y, h, w);
      };

      this.dragEventHandler = (eventType, i, x, y, h, w) => {
        this.dragEvent(eventType, i, x, y, h, w);
      };

      this._provided.eventBus = new Vue();
      this.eventBus = this._provided.eventBus;
      this.eventBus.$on('resizeEvent', this.resizeEventHandler);
      this.eventBus.$on('dragEvent', this.dragEventHandler);
      this.$emit('layout-created', this.layout);
      this.$on('add-layout', () => {

        let layout = {"x": 0, "y": 9999, "w": 2, "h": 2};

        layout["i"] = this.layout.length;

        let layoutEntries = Object.entries(this.layouts);

        for (let i = 0; i < layoutEntries.length; i++) {
          let items = layoutEntries[i][1];
          items.push(Object.assign({},layout));
        }

      });
    },
    beforeDestroy: function () {
      //Remove listeners
      this.eventBus.$off('resizeEvent', this.resizeEventHandler);
      this.eventBus.$off('dragEvent', this.dragEventHandler);
      this.eventBus.$destroy();
      removeWindowEventListener("resize", this.onWindowResize);
      this.erd.uninstall(this.$refs.item);
    },
    mounted: function () {

      this.layouts = Object.assign({}, this.responsiveLayouts);

      this.$nextTick(() => {

        this.onWindowResize();

        this.erd = elementResizeDetectorMaker({
          strategy: "scroll", //<- For ultra performance.
          // See https://github.com/wnr/element-resize-detector/issues/110 about callOnAdd.
          callOnAdd: false,
        });
        this.erd.listenTo(this.$refs.item, () => {
          this.onWindowResize();
        });
      });

    },
    computed: {
      layout: {
        get() {
          return this.layouts[this.lastBreakpoint] || [];
        },
        set(newLayout) {
          console.log("sedding nju layout");
          this.layouts[this.lastBreakpoint] = newLayout;
        }
      },
    },
    watch: {
      width: function (newWidth, oldWidth) {
        this.lastBreakpoint = getBreakpointFromWidth(this.breakpoints, newWidth);
        this.lastColCount = getColsFromBreakpoint(this.lastBreakpoint, this.cols);

        this.$nextTick(() => {
          if (oldWidth === null) {
            this.$nextTick(() => {

              this.$emit('layout-ready', this.layout);
            });
          }
          this.updateHeight();
        });
      },
      layout: function () {

        console.log("lastColCount", this.lastColCount);
        compact(correctBounds(this.layout, this.lastColCount));
        this.updateHeight();
      },
      isDraggable: function () {
        this.eventBus.$emit("setDraggable", this.isDraggable);
      },
      isResizable: function () {
        this.eventBus.$emit("setResizable", this.isResizable);
      },
    },
    methods: {
      updateHeight: function () {
        this.mergedStyle = {
          height: this.containerHeight()
        };
      },
      onWindowResize: function () {
        this.width = this.$refs.item.offsetWidth;
        this.eventBus.$emit("resizeEvent");
      },
      containerHeight: function () {
        return bottom(this.layout) * (this.rowHeight + this.margin[1]) + this.margin[1] + 'px';
      },
      dragEvent: function (eventName, id, x, y, h, w) {
        let l = getLayoutItem(this.layout, id);
        if (l === undefined || l === null) {
          l = {x: 0, y: 0}
        }

        if (eventName === "dragmove" || eventName === "dragstart") {
          this.placeholder.i = id;
          this.placeholder.x = l.x;
          this.placeholder.y = l.y;
          this.placeholder.w = w;
          this.placeholder.h = h;
          this.$nextTick(function () {
            this.isDragging = true;
          });
        } else {
          this.$nextTick(function () {
            this.isDragging = false;
          });
        }

        // Move the element to the dragged location.
        moveElement(this.layout, l, x, y, true);

        compact(correctBounds(this.layout, this.lastColCount));
        // needed because vue can't detect changes on array element properties
        this.eventBus.$emit("compact");
        this.updateHeight();
        if (eventName === 'dragend') this.$emit('layout-updated', this.layout);
      },
      resizeEvent: function (eventName, id, x, y, h, w) {
        let l = getLayoutItem(this.layout, id);
        //GetLayoutItem sometimes return null object
        if (l === undefined || l === null) {
          l = {h: 0, w: 0}
        }

        // Set new width and height.
        l.w = w;
        l.h = h;

        if (eventName === "resizestart" || eventName === "resizemove") {
          this.placeholder.i = id;
          this.placeholder.x = x;
          this.placeholder.y = y;
          this.placeholder.w = l.w;
          this.placeholder.h = l.h;

          this.$nextTick(function () {
            this.isDragging = true;
          });

        } else {
          this.$nextTick(function () {
            this.isDragging = false;
          });
        }

        compact(correctBounds(this.layout, this.lastColCount));
        this.eventBus.$emit("compact");
        this.updateHeight();

        if (eventName === 'resizeend') this.$emit('layout-updated', this.layout);
      },
    },
  }
</script>
