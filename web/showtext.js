import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js"

app.registerExtension({
  name: "ComfyUIShowText",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === "ComfyUIShowText") {
      
      function populate(text) {
        // 1. 清理除第一个（通常是原始输入）之外的所有自定义 widgets
        if (this.widgets) {
            // 找到所有由我们动态添加的 widget 并移除
            // 建议通过 name 或者特定属性标记来删除，而不是简单的索引
            for (let i = this.widgets.length - 1; i >= 0; i--) {
                if (this.widgets[i].name === "text2") { // 匹配你下面创建的名字
                    this.widgets[i].onRemove?.();
                    this.widgets.splice(i, 1);
                }
            }
        }

        const values = Array.isArray(text) ? text : [text];
        
        // 2. 遍历添加新的内容
        for (const list of values) {
          if (!list) continue;
          
          const w = ComfyWidgets["STRING"](
            this,
            "text2", // 这是动态生成的 widget 名字
            ["STRING", { multiline: true }],
            app
          ).widget;
          
          w.inputEl.readOnly = true;
          w.inputEl.style.opacity = 0.6;
          w.value = list;
          w.serializeValue = async () => undefined; // 重点：防止这些动态 widget 被保存到 JSON 导致下次加载翻倍
        }

        // 3. 重新计算尺寸
        requestAnimationFrame(() => {
          const sz = this.computeSize();
          this.size[1] = Math.max(this.size[1], sz[1]);
          this.onResize?.(this.size);
          app.graph.setDirtyCanvas(true, false);
        });
      }

      // 劫持执行回调
      const onExecuted = nodeType.prototype.onExecuted;
      nodeType.prototype.onExecuted = function (message) {
        onExecuted?.apply(this, arguments);
        populate.call(this, message.text);
      };

      // 劫持配置加载回调
      const onConfigure = nodeType.prototype.onConfigure;
      nodeType.prototype.onConfigure = function () {
        onConfigure?.apply(this, arguments);
        if (this.widgets_values?.length) {
          // 这里的逻辑需要根据你后端的返回微调
          populate.call(this, this.widgets_values[0]); 
        }
      };
    }
  },
});