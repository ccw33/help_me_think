<template>
  <div id="app">
    <h1>Interactive Mind Map</h1>
    <MindMap />
    <ChatPanel />
  </div>
</template>

<script>
import MindMap from './components/MindMap.vue'
import ChatPanel from './components/ChatPanel.vue'

export default {
  name: 'App',
  components: {
    MindMap,
    ChatPanel
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  padding: 20px;
  position: relative;
  min-height: 100vh;
}
</style>
