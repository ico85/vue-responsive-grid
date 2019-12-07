<template>
  <div ref="item"
       class="vue-grid-item"
       :class="classObj"
       :style="style"
  >
    <slot></slot>
    <span v-if="resizable" ref="handle" :class="resizableHandleClass"></span>
    <!--<span v-if="draggable" ref="dragHandle" class="vue-draggable-handle"></span>-->
  </div>
</template>
<style>
  .vue-grid-item {
    transition: all 200ms ease;
    transition-property: left, top, right, transform;
    left: 0;
    right: auto;
  }

  .vue-grid-item.no-touch {
    -ms-touch-action: none;
    touch-action: none;
  }

  .vue-grid-item.resizing {
    opacity: 0.6;
    z-index: 3;
  }

  .vue-grid-item.vue-draggable-dragging {
    transition: none;
    z-index: 3;
  }

  .vue-grid-item.vue-grid-placeholder {
    background: red;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }

  .vue-grid-item > .vue-resizable-handle {
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

  .vue-grid-item.disable-userselect {
    user-select: none;
  }
</style>
<script>
  import {setTransform} from '../helpers/utils';
  import {getControlPosition, createCoreData} from '../helpers/draggableUtils';

  let interact = require("interactjs");

  export default {
    name: "GridItem",
    props: {
      /*cols: {
       type: Number,
       required: true
       },
       margin: {
       type: Array,
       required: true
       },*/
      isDraggable: {
        type: Boolean,
        required: false,
        default: null
      },
      isResizable: {
        type: Boolean,
        required: false,
        default: null
      },
      minH: {
        type: Number,
        required: false,
        default: 1
      },
      minW: {
        type: Number,
        required: false,
        default: 1
      },
      maxH: {
        type: Number,
        required: false,
        default: Infinity
      },
      maxW: {
        type: Number,
        required: false,
        default: Infinity
      },
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      },
      w: {
        type: Number,
        required: true
      },
      h: {
        type: Number,
        required: true
      },
      i: {
        required: true
      },
      dragIgnoreFrom: {
        type: String,
        required: false,
        default: 'a, button'
      },
      dragAllowFrom: {
        type: String,
        required: false,
        default: null
      },
      resizeIgnoreFrom: {
        type: String,
        required: false,
        default: 'a, button'
      },
    },
    inject: ["eventBus"],
    data: function () {
      return {
        margin: [10, 10],
        draggable: null,
        resizable: null,

        isDragging: false,
        dragging: null,
        isResizing: false,
        resizing: null,
        lastX: NaN,
        lastY: NaN,
        lastW: NaN,
        lastH: NaN,
        style: {},

        dragEventSet: false,
        resizeEventSet: false,

        previousW: null,
        previousH: null,
        previousX: null,
        previousY: null,
        innerX: this.x,
        innerY: this.y,
        innerW: this.w,
        innerH: this.h
      }
    },
    created() {
      let self = this;

      self.compactHandler = function (layout) {
        self.compact(layout);
      };

      self.setDraggableHandler = function (isDraggable) {
        if (self.isDraggable === null) {
          self.draggable = isDraggable;
        }
      };

      self.setResizableHandler = function (isResizable) {
        if (self.isResizable === null) {
          self.resizable = isResizable;
        }
      };

      self.directionchangeHandler = () => {
        this.compact();
      };

      this.eventBus.$on('compact', self.compactHandler);
      this.eventBus.$on('setDraggable', self.setDraggableHandler);
      this.eventBus.$on('setResizable', self.setResizableHandler);
    },
    beforeDestroy: function () {
      let self = this;
      //Remove listeners
      this.eventBus.$off('compact', self.compactHandler);
      this.eventBus.$off('setDraggable', self.setDraggableHandler);
      this.eventBus.$off('setResizable', self.setResizableHandler);
      this.interactObj.unset() // destroy interact intance
    },
    mounted: function () {
      this.margin = this.$parent.margin !== undefined ? this.$parent.margin : [10, 10];
      if (this.isDraggable === null) {
        this.draggable = this.$parent.isDraggable;
      } else {
        this.draggable = this.isDraggable;
      }
      if (this.isResizable === null) {
        this.resizable = this.$parent.isResizable;
      } else {
        this.resizable = this.isResizable;
      }
      this.createStyle();
    },
    watch: {
      isDraggable: function () {
        this.draggable = this.isDraggable;
      },
      draggable: function () {
        this.tryMakeDraggable();
      },
      isResizable: function () {
        this.resizable = this.isResizable;
      },
      resizable: function () {
        this.tryMakeResizable();
      },
      "$parent.rowHeight": function () {
        this.createStyle();
      },
      "$parent.lastColCount": function () {
        this.tryMakeResizable();
        this.createStyle();
      },
      "$parent.width": function () {
        this.tryMakeResizable();
        this.createStyle();
      },
      x: function (newVal) {
        this.innerX = newVal;
        this.createStyle();
      },
      y: function (newVal) {
        this.innerY = newVal;
        this.createStyle();
      },
      h: function (newVal) {
        this.innerH = newVal
        this.createStyle();
      },
      w: function (newVal) {
        this.innerW = newVal;
        this.createStyle();
      },
      minH: function () {
        this.tryMakeResizable();
      },
      maxH: function () {
        this.tryMakeResizable();
      },
      minW: function () {
        this.tryMakeResizable();
      },
      maxW: function () {
        this.tryMakeResizable();
      }
    },
    computed: {
      classObj() {
        return {
          'vue-resizable': this.resizable,
          'resizing': this.isResizing,
          'vue-draggable-dragging': this.isDragging,
          'disable-userselect': this.isDragging,
          'no-touch': this.isAndroid && this.draggableOrResizable
        }
      },
      draggableOrResizable() {
        return (this.draggable || this.resizable);
      },
      isAndroid() {
        return navigator.userAgent.toLowerCase().indexOf("android") !== -1;
      },
      resizableHandleClass() {
        return 'vue-resizable-handle';
      }
    },
    methods: {
      createStyle: function () {
        if (this.x + this.w > this.$parent.lastColCount) {
          this.innerX = 0;
          this.innerW = (this.w > this.$parent.lastColCount) ? this.$parent.lastColCount : this.w
        } else {
          this.innerX = this.x;
          this.innerW = this.w;
        }
        let pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);

        if (this.isDragging) {
          pos.top = this.dragging.top;
          pos.left = this.dragging.left;
        }
        if (this.isResizing) {
          pos.width = this.resizing.width;
          pos.height = this.resizing.height;
        }

        this.style = setTransform(pos.top, pos.left, pos.width, pos.height);

      },
      handleResize: function (event) {
        const position = getControlPosition(event);
        // Get the current drag point from the event. This is used as the offset.
        if (position == null) return; // not possible but satisfies flow
        const {x, y} = position;

        const newSize = {width: 0, height: 0};
        let pos;
        switch (event.type) {
          case "resizestart": {
            this.previousW = this.innerW;
            this.previousH = this.innerH;
            pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
            newSize.width = pos.width;
            newSize.height = pos.height;
            this.resizing = newSize;
            this.isResizing = true;
            break;
          }
          case "resizemove": {
//                        console.log("### resize => " + event.type + ", lastW=" + this.lastW + ", lastH=" + this.lastH);
            const coreEvent = createCoreData(this.lastW, this.lastH, x, y);
            newSize.width = this.resizing.width + coreEvent.deltaX;
            newSize.height = this.resizing.height + coreEvent.deltaY;

            ///console.log("### resize => " + event.type + ", deltaX=" + coreEvent.deltaX + ", deltaY=" + coreEvent.deltaY);
            this.resizing = newSize;
            break;
          }
          case "resizeend": {
            //console.log("### resize end => x=" +this.innerX + " y=" + this.innerY + " w=" + this.innerW + " h=" + this.innerH);
            pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
            newSize.width = pos.width;
            newSize.height = pos.height;
//                        console.log("### resize end => " + JSON.stringify(newSize));
            this.resizing = null;
            this.isResizing = false;
            break;
          }
        }

        // Get new WH
        pos = this.calcWH(newSize.height, newSize.width);
        if (pos.w < this.minW) {
          pos.w = this.minW;
        }
        if (pos.w > this.maxW) {
          pos.w = this.maxW;
        }
        if (pos.h < this.minH) {
          pos.h = this.minH;
        }
        if (pos.h > this.maxH) {
          pos.h = this.maxH;
        }

        if (pos.h < 1) {
          pos.h = 1;
        }
        if (pos.w < 1) {
          pos.w = 1;
        }

        this.lastW = x;
        this.lastH = y;

        if (this.innerW !== pos.w || this.innerH !== pos.h) {
          this.$emit("resize", this.i, pos.h, pos.w, newSize.height, newSize.width);
        }
        if (event.type === "resizeend" && (this.previousW !== this.innerW || this.previousH !== this.innerH)) {
          this.$emit("resized", this.i, pos.h, pos.w, newSize.height, newSize.width);
        }
        this.eventBus.$emit("resizeEvent", event.type, this.i, this.innerX, this.innerY, pos.h, pos.w);
      },
      handleDrag(event) {
        if (this.isResizing) return;

        const position = getControlPosition(event);

        // Get the current drag point from the event. This is used as the offset.
        if (position === null) return; // not possible but satisfies flow
        const {x, y} = position;

        // let shouldUpdate = false;
        let newPosition = {top: 0, left: 0};
        switch (event.type) {
          case "dragstart": {
            this.previousX = this.innerX;
            this.previousY = this.innerY;

            let parentRect = event.target.offsetParent.getBoundingClientRect();
            let clientRect = event.target.getBoundingClientRect();
            newPosition.left = clientRect.left - parentRect.left;
            newPosition.top = clientRect.top - parentRect.top;
            this.dragging = newPosition;
            this.isDragging = true;
            break;
          }
          case "dragend": {
            if (!this.isDragging) return;
            let parentRect = event.target.offsetParent.getBoundingClientRect();
            let clientRect = event.target.getBoundingClientRect();
            newPosition.left = clientRect.left - parentRect.left;
            newPosition.top = clientRect.top - parentRect.top;
//                        console.log("### drag end => " + JSON.stringify(newPosition));
//                        console.log("### DROP: " + JSON.stringify(newPosition));
            this.dragging = null;
            this.isDragging = false;
            // shouldUpdate = true;
            break;
          }
          case "dragmove": {
            const coreEvent = createCoreData(this.lastX, this.lastY, x, y);
            newPosition.left = this.dragging.left + coreEvent.deltaX;
            newPosition.top = this.dragging.top + coreEvent.deltaY;
//                        console.log("### drag => " + event.type + ", x=" + x + ", y=" + y);
//                        console.log("### drag => " + event.type + ", deltaX=" + coreEvent.deltaX + ", deltaY=" + coreEvent.deltaY);
//                        console.log("### drag end => " + JSON.stringify(newPosition));
            this.dragging = newPosition;
            break;
          }
        }

        // Get new XY
        let pos;
        pos = this.calcXY(newPosition.top, newPosition.left);

        this.lastX = x;
        this.lastY = y;

        if (this.innerX !== pos.x || this.innerY !== pos.y) {
          this.$emit("move", this.i, pos.x, pos.y);
        }
        if (event.type === "dragend" && (this.previousX !== this.innerX || this.previousY !== this.innerY)) {
          this.$emit("moved", this.i, pos.x, pos.y);
        }
        this.eventBus.$emit("dragEvent", event.type, this.i, pos.x, pos.y, this.innerH, this.innerW);
      },
      calcPosition: function (x, y, w, h) {
        const colWidth = this.calcColWidth();
        return {
          left: Math.round(colWidth * x + (x + 1) * this.margin[0]),
          top: Math.round(this.$parent.rowHeight * y + (y + 1) * this.margin[1]),
          // 0 * Infinity === NaN, which causes problems with resize constriants;
          // Fix this if it occurs.
          // Note we do it here rather than later because Math.round(Infinity) causes deopt
          width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
          height: h === Infinity ? h : Math.round(this.$parent.rowHeight * h + Math.max(0, h - 1) * this.margin[1])
        };

      },
      /**
       * Translate x and y coordinates from pixels to grid units.
       * @param  {Number} top  Top position (relative to parent) in pixels.
       * @param  {Number} left Left position (relative to parent) in pixels.
       * @return {Object} x and y in grid units.
       */
      calcXY(top, left) {
        const colWidth = this.calcColWidth();

        let x = Math.round((left - this.margin[0]) / (colWidth + this.margin[0]));
        let y = Math.round((top - this.margin[1]) / (this.$parent.rowHeight + this.margin[1]));

        x = Math.max(Math.min(x, this.$parent.lastColCount - this.innerW), 0);

        return {x, y};
      },

      calcColWidth() {
        const colWidth = (this.$parent.width - (this.margin[0] * (this.$parent.lastColCount + 1))) / this.$parent.lastColCount;
        // console.log("### COLS=" + this.$parent.lastColCount + " COL WIDTH=" + colWidth + " MARGIN " + this.margin[0]);
        return colWidth;
      },

      /**
       * Given a height and width in pixel values, calculate grid units.
       * @param  {Number} height Height in pixels.
       * @param  {Number} width  Width in pixels.
       * @return {Object} w, h as grid units.
       */
      calcWH(height, width) {

        const colWidth = this.calcColWidth();

        // width = colWidth * w - (margin * (w - 1))
        // ...
        // w = (width + margin) / (colWidth + margin)
        let w = Math.round((width + this.margin[0]) / (colWidth + this.margin[0]));
        let h = Math.round((height + this.margin[1]) / (this.$parent.rowHeight + this.margin[1]));

        // Capping
        w = Math.max(Math.min(w, this.$parent.lastColCount - this.innerX), 0);
        return {w, h};
      },
      compact: function () {
        this.createStyle();
      },
      tryMakeDraggable: function () {
        const self = this;
        if (this.interactObj === null || this.interactObj === undefined) {
          this.interactObj = interact(this.$refs.item);
        }
        if (this.draggable) {
          const opts = {
            ignoreFrom: this.dragIgnoreFrom,
            allowFrom: this.dragAllowFrom
          };
          this.interactObj.draggable(opts);
          /*this.interactObj.draggable({allowFrom: '.vue-draggable-handle'});*/
          if (!this.dragEventSet) {
            this.dragEventSet = true;
            this.interactObj.on('dragstart dragmove dragend', function (event) {
              self.handleDrag(event);
            });
          }
        } else {
          this.interactObj.draggable({
            enabled: false
          });
        }
      },
      tryMakeResizable: function () {
        const self = this;
        if (this.interactObj === null || this.interactObj === undefined) {
          this.interactObj = interact(this.$refs.item);
        }
        if (this.resizable) {
          let maximum = this.calcPosition(0, 0, this.maxW, this.maxH);
          let minimum = this.calcPosition(0, 0, this.minW, this.minH);

          // console.log("### MAX " + JSON.stringify(maximum));
          // console.log("### MIN " + JSON.stringify(minimum));

          const opts = {
            preserveAspectRatio: true,
            // allowFrom: "." + this.resizableHandleClass,
            edges: {
              left: false,
              right: "." + this.resizableHandleClass,
              bottom: "." + this.resizableHandleClass,
              top: false
            },
            ignoreFrom: this.resizeIgnoreFrom,
            restrictSize: {
              min: {
                height: minimum.height,
                width: minimum.width
              },
              max: {
                height: maximum.height,
                width: maximum.width
              }
            }
          };

          this.interactObj.resizable(opts);
          if (!this.resizeEventSet) {
            this.resizeEventSet = true;
            this.interactObj
              .on('resizestart resizemove resizeend', function (event) {
                self.handleResize(event);
              });
          }
        } else {
          this.interactObj.resizable({
            enabled: false
          });
        }
      },
    },
  }
</script>
