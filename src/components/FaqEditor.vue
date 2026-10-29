<template><div class="faq-editor"><header><b>常见问题</b><button type="button" class="button secondary add" @click="add">＋ 新增问题</button></header><p class="field-hint">按需填写问题和回答；已有内容会保留。</p><div v-for="(item,index) in items" :key="index" class="faq-row"><div class="faq-head"><b>问题 {{ index + 1 }}</b><button type="button" @click="remove(index)">删除</button></div><input :value="item.question" placeholder="问题" @input="update(index,'question',$event.target.value)"/><textarea :value="item.answer" rows="2" placeholder="回答" @input="update(index,'answer',$event.target.value)"/></div></div></template>
<script setup>
const props=defineProps({items:{type:Array,default:()=>[]}}),emit=defineEmits(['update:items'])
function add(){emit('update:items',[...props.items,{question:'',answer:''}])}
function update(index,key,value){emit('update:items',props.items.map((item,i)=>i===index?{...item,[key]:value}:item))}
function remove(index){emit('update:items',props.items.filter((_,i)=>i!==index))}
</script>
<style scoped>
.faq-editor{grid-column:1/-1}.faq-editor>header,.faq-head{display:flex;justify-content:space-between;align-items:center}.faq-editor>header b{font-size:12px;color:#526b85}.faq-editor .add{padding:7px 10px;font-size:10px}.faq-row{padding:10px;margin-top:8px;border:1px solid var(--line);border-radius:9px}.faq-head{font-size:11px;color:#60758d;margin-bottom:6px}.faq-head button{color:#c86267}.faq-row input,.faq-row textarea{display:block;width:100%;margin-top:6px;padding:9px;border:1px solid var(--line);border-radius:8px;font-size:12px}.faq-row textarea{resize:vertical}
</style>
