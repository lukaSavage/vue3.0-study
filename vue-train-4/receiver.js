let person = {
    name: 'jw',
    get aliasName() { // this = person
        return '**' + this.name + '**'
    }
}

let proxy = new Proxy(person, {
    get(target, key, receiver) {
        console.log(key)
        return Reflect.get(target, key, receiver); // person.alianame
    },
    set(target, key, value, receiver) {

        return Reflect.set(target, key, value, receiver);;
    },
})
// 这样我们只监控到了aliasName 的取值  name的取值操作监控不到
console.log(proxy.aliasName); // 取aliasName的时候 触发了获取 name的操作  2