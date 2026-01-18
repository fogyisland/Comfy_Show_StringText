class ComfyUIShowText:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {"forceInput": True}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    INPUT_IS_LIST = True
    RETURN_TYPES = ("STRING",)  # 添加返回类型
    RETURN_NAMES = ("text",)    # 添加返回名称
    OUTPUT_IS_LIST = (True,)    # 输出也是列表
    FUNCTION = "show_Text"
    OUTPUT_NODE = True
    CATEGORY = "TextShow/Display"

    def show_Text(self, text, unique_id=None, extra_pnginfo=None):
         # 确保 text 是列表
        if not isinstance(text, list):
            text = [text]
            
        # 只处理第一个文本元素，避免多次处理
        text_value = text[0] if text else ""
        
        # 处理 workflow 更新（只在第一次执行时）
        if unique_id is not None and extra_pnginfo is not None:
            # 确保 unique_id 是列表
            uid_list = unique_id if isinstance(unique_id, list) else [unique_id]
            
            # 只处理第一个 unique_id
            uid = uid_list[0] if uid_list else None
            
            if uid is not None and extra_pnginfo is not None:
                # 确保 extra_pnginfo 是列表
                epi_list = extra_pnginfo if isinstance(extra_pnginfo, list) else [extra_pnginfo]
                
                if epi_list and isinstance(epi_list[0], dict) and "workflow" in epi_list[0]:
                    workflow = epi_list[0]["workflow"]
                    
                    # 查找对应的节点
                    node = next(
                        (x for x in workflow["nodes"] if str(x["id"]) == str(uid)),
                        None,
                    )
                    if node:
                        # 只更新一次，使用第一个文本值
                        node["widgets_values"] = [text_value]
        
        # 返回与输入相同数量的输出，但避免重复处理
        return {"ui": {"text": text}, "result": (text,)}