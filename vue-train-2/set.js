let s = new Set(['a'])
s.forEach(item => {
    s.delete(item)
    s.add(item)
})


// 使用了同一个地址导致的