<template>
  <div>
    <h2>Unused</h2>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const unusedLog = () => {
  console.log('Unused log')
}

onMounted(() => {
  unusedLog()
})
</script>