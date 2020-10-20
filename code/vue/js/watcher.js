class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    // data 中的属性名称
    this.key = key
    // 回调函数，更新视图
    this.cb = cb
    // 将自己赋值给 Dep 的 target
    Dep.target = this
    // 调用 this.vm[this.key] 的时候就会触发了 observer中 defineReactive 的 get ,触发了 get ，这个时候 Dep.target 上就是 当前的 watcher
    // Dep 就会调用 addSub 将它添加到 观察者数组 subs 中
    this.oldValue = this.vm[this.key]
    // 释放 Dep.target , 避免重复添加
    Dep.target = null
  }
  // 当数据发生变化时更新视图
  update() {
    // 当调用 update 的时候，数据已经发生了变化，这个时候通过 vm 和 key 拿到的就是最新的值
    let newValue = this.vm[this.key]
    if (newValue === this.oldValue) {
      return
    }
    // 更新视图
    this.cb(newValue)
  }
}
