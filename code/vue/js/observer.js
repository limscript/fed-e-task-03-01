class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    // 判断 data 是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 遍历 data 中的所有属性并转换成 getter 和 setter
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive(obj, key, val) {
    let self = this
    // 负责收集依赖，并发送通知
    const dep = new Dep()
    // 如果 val 是对象，将对象内部的属性也转换成 getter 和 setter
    this.walk(val)
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set(newValue) {
        if (newValue === val) {
          return
        }
        val = newValue
        self.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}
