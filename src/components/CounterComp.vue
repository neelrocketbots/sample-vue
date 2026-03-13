<template>
  <div>
    <h2>Counter</h2>
    <p>{{ count }}</p>
    <p>{{ doubleCount }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '../stores/counter'
import { storeToRefs } from 'pinia';

const counterStore = useCounterStore()
const { count, doubleCount } = storeToRefs(counterStore)
const { increment, decrement } = counterStore
</script>