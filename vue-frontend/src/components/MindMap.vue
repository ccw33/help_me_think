<template>
  <div class="mindmap-container">
    <!-- GoJS Diagram Container -->
    <div ref="diagramDiv" style="width:100%; height:100%; background-color: white;"></div>
    <button class="save-button" @click="saveMindMap">保存</button>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import axios from 'axios'
import * as go from 'gojs'

export default defineComponent({
  name: 'MindMap',
  setup() {
    const diagramDiv = ref(null)
    
    onMounted(() => {
      const $ = go.GraphObject.make
      
      const diagram = $(go.Diagram, diagramDiv.value, {
        initialContentAlignment: go.Spot.Center,
        'undoManager.isEnabled': true,
        allowZoom: true,
        maxScale: 2.0,
        minScale: 0.5,
        'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
        layout: $(go.TreeLayout, {
          angle: 0,  // 水平方向
          layerSpacing: 30,
          arrangement: go.TreeLayout.ArrangementHorizontal
        })
      })

      // 阻止画布区域的默认滚轮行为
      diagramDiv.value.addEventListener('wheel', (e) => {
        if (diagram.isMouseOver) {
          e.preventDefault()
        }
      }, { passive: false })

      diagram.nodeTemplate =
        $(go.Node, 'Horizontal',
          $(go.Shape, 'RoundedRectangle',
            { width: 10, height: 10, fill: '#00a1ff', stroke: null, margin: 5 },
            new go.Binding('fill', 'color')),
          $(go.TextBlock,
            { margin: 5, font: '14px sans-serif', stroke: '#333' },
            new go.Binding('text', 'text'))
        )

      diagram.linkTemplate =
        $(go.Link,
          { routing: go.Link.Orthogonal, corner: 5 },
          $(go.Shape, { strokeWidth: 1.5, stroke: '#999' }),
          $(go.Shape, { toArrow: 'Standard', stroke: '#999' }))
      
      // Sample data
      diagram.model = new go.GraphLinksModel([
        { key: 1, text: 'Main Idea', color: '#00a1ff' },
        { key: 2, text: 'Sub Idea 1', color: '#ff6b00' },
        { key: 3, text: 'Sub Idea 2', color: '#ff6b00' }
      ], [
        { from: 1, to: 2 },
        { from: 1, to: 3 }
      ])
    })

    const saveMindMap = async () => {
      try {
        const model = diagram.model.toJSON()
        await axios.post('/api/mindmaps', model)
        alert('保存成功')
      } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
      }
    }

    return { diagramDiv, saveMindMap }
  }
})
</script>

<style scoped>
.save-button {
  position: fixed;
  bottom: 30px;
  left: 30px;
  padding: 10px 20px;
  background-color: #00a1ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  z-index: 1000;
  font-size: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.mindmap-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
