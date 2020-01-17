<template>
  <div ref="item" class="vue-grid-layout" :style="mergedStyle">
    <slot></slot>
    <grid-item class="vue-grid-placeholder"
               v-show="isDragging"
               :x="placeholder.x"
               :y="placeholder.y"
               :w="placeholder.w"
               :h="placeholder.h"
               :i="placeholder.i">

    </grid-item>
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
    moveElement
  } from '../helpers/utils';
  import {
    sortBreakpoints
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
      layouts: null,
      itemRatio: {
        type: Number,
        default: 1,
      },
      isDraggable: {
        type: Boolean,
        default: true
      },
      isResizable: {
        type: Boolean,
        default: true
      },
      breakpoints: {
        type: Object,
        default: function () {
          return {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}
        }
      },
      margin: {
        type: Object,
        default: function () {
          return {lg: 10, md: 10, sm: 10, xs: 10, xxs: 10}
        }
      }
    },
    data() {
      return {
        cols: {},
        rowHeight: 60,
        width: null,
        mergedStyle: {},
        isDragging: false,
        currentColCount: null,
        currentMargin: null,
        lastBreakpoint: null,
        layout: [],
        placeholder: {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          i: -1
        },
      };
    },
    created() {

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
      this.$on('add-item', (itemId) => {

        let item = {"x": 0, "y": 9999, "w": 2, "h": 2};

        item["i"] = itemId !== undefined ? itemId : this.layout.length;

        let layoutEntries = Object.entries(this.layouts);

        for (let i = 0; i < layoutEntries.length; i++) {
          let items = layoutEntries[i][1];
          let item_to_add = Object.assign({}, item);
          items.push(item_to_add);
        }

        this.$emit('item-added', itemId);

      });

      this.eventBus.$on('removeItem', (itemId) => {

        let layoutsClone = Object.assign({}, this.layouts);

        let layoutEntries = Object.entries(layoutsClone);

        for (let i = 0; i < layoutEntries.length; i++) {
          let items = layoutEntries[i][1];

          items.some((item, i) => {
            if (item.i == itemId) {
              items.splice(i, 1);
            }
          });
        }

        this.$emit("update:layouts", layoutsClone);

        this.$emit('itemRemoved', itemId);

      });
    },
    beforeDestroy: function () {
      //Remove listeners
      this.eventBus.$off('resizeEvent', this.resizeEventHandler);
      this.eventBus.$off('dragEvent', this.dragEventHandler);
      this.eventBus.$off('removeItem');
      this.eventBus.$destroy();
      removeWindowEventListener("resize", this.onWindowResize);
      this.erd.uninstall(this.$refs.item);
    },
    mounted: function () {

      if(!this.layouts) {
        let breakpointEntries = Object.entries(this.breakpoints);
        let layouts = {};

        for (let i = 0; i < breakpointEntries.length; i++) {
          let breakpointKey = breakpointEntries[i][0];
          layouts[breakpointKey] = [];
        }

        this.$emit("update:layouts", layouts);
      }

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
    watch: {

      margin() {
        this.resizeEvent();
      },
      breakpoints() {

        // Delete old breakpoints from layouts-Object
        let layouts = Object.assign({}, this.layouts);
        let margin = Object.assign({}, this.margin);
        let layoutEntries = Object.entries(layouts);
        let breakpointEntries = Object.entries(this.breakpoints).sort((a, b) => a[1] - b[1]);

        for (let i = 0; i < layoutEntries.length; i++) {

          let breakpointKey = layoutEntries[i][0];

          if (!this.breakpoints[breakpointKey]) {
            delete layouts[breakpointKey];
            delete margin[breakpointKey];
          }
        }

        for (let i = 0; i < breakpointEntries.length; i++) {

          let breakpointKey = breakpointEntries[i][0];

          if (i - 1 >= 0) {

            let previousBreakpointKey = breakpointEntries[i - 1][0];

            if (!layouts[breakpointKey]) {
              let layout = JSON.parse(JSON.stringify(layouts[previousBreakpointKey]));
              layouts[breakpointKey] = layout;
              margin[breakpointKey] = this.margin[previousBreakpointKey];
            }

          }
        }

        this.$emit("update:layouts", layouts);
        this.$emit("update:margin", margin);

        this.resizeEvent();
      },
      width: function (newWidth, oldWidth) {

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

        compact(correctBounds(this.layout, this.currentColCount));
        this.$emit("update:currentLayout", this.layout);
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

      getLastBreakpoint() {

        const sorted = sortBreakpoints(this.breakpoints);
        let matching = sorted[0];
        for (let i = 1, len = sorted.length; i < len; i++) {
          const breakpointName = sorted[i];
          if (this.width >= this.breakpoints[breakpointName])
            matching = breakpointName;
        }
        return matching;
      },
      calcColWidths() {

        const minColWidth = 60;

        let breakpointEntries = Object.entries(this.breakpoints);
        let margin = this.currentMargin;
        let cols = {};

        for (let i = 0; i < breakpointEntries.length; i++) {

          let colsCount = 40;
          let colWidth = 0;

          let breakpointLabel = breakpointEntries[i][0];
          let breakpointSize = breakpointEntries[i][1];

          while (colWidth < minColWidth && colsCount >= 2) {
            colsCount--;
            colWidth = (breakpointSize - (margin * (colsCount + 1))) / colsCount;
          }

          if (colsCount % 2 !== 0 && colsCount % 3 !== 0 && colsCount > 2) {
            colsCount--;
          }

          cols[breakpointLabel] = colsCount;
        }

        this.cols = cols;

      },

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
        return bottom(this.layout) * (this.rowHeight + this.currentMargin) + this.currentMargin + 'px';
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

        compact(correctBounds(this.layout, this.currentColCount));
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

        let currentBreakpoint = this.lastBreakpoint;

        this.lastBreakpoint = this.getLastBreakpoint();
        this.currentMargin = this.margin[this.lastBreakpoint];
        this.layout = this.layouts[this.lastBreakpoint];

        this.calcColWidths();

        this.currentColCount = this.cols[this.lastBreakpoint];
        this.rowHeight = ((this.width - (this.currentMargin * (this.currentColCount + 1))) / this.currentColCount) * this.itemRatio;
        compact(correctBounds(this.layout, this.currentColCount));
        this.eventBus.$emit("compact");
        this.updateHeight();


        if(currentBreakpoint !== this.lastBreakpoint) {
          this.$emit("breakpoint-change", {
            currentColCount: this.currentColCount,
            rowHeight: this.rowHeight,
            lastBreakpoint: currentBreakpoint,
            currentBreakpoint: this.lastBreakpoint,
            currentMargin: this.currentMargin,
            layout: this.layout,
            cols: this.cols
          });
        }

        this.$emit("data-updated", {
          currentColCount: this.currentColCount,
          rowHeight: this.rowHeight,
          lastBreakpoint: currentBreakpoint,
          currentBreakpoint: this.lastBreakpoint,
          currentMargin: this.currentMargin,
          layout: this.layout,
          cols: this.cols
        });
        if (eventName === 'resizeend') this.$emit('layout-updated', this.layout);
      },
    },
  }
</script>
