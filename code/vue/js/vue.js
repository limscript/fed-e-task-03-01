class Vue {
  constructor(options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把 data 中的成员转换成 getter 和 setter 注入到 vue 实例中
    this._proxyData(this.$data)
    // 3. 调用 observer 对象，监听数据变化
    new Observer(this.$options)
    // 4. 调用 compiler 对象，解析指令和插值表达式
    new Compiler(this)
  }

  _proxyData(data) {
    // 遍历 data 中的所有属性
    Object.keys(data).forEach(key => {
      // 把 data 中的属性注入到 vue 实例中
      // _proxyData 方法是在 Vue 的构造函数中通过 this 去调用的，所有这里的 this 就是 Vue 实例
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get() {
          return data[key]
        },
        set(newValue) {
          if (data[key] === newValue) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}
