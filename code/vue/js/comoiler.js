class Compiler {
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile(el) {
    // 获取 el 内的所有的子节点
    let childNodes = el.childNodes
    // childNodes 是一个 伪数组 利用 Array.from 转换成数组
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }
      // 判断 node 节点是否有子节点，如果有子节点，要递归调用 compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 编译文本节点 处理插值表达式
  compileText(node) {
    const reg = /\{\{(.+?)\}\}/
    // 获取文本节点的内容
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
      // 将插值表达式替换成data中定义的对应的属性
      node.textContent = value.replace(reg, this.vm[key])
      // 创建 watcher 对象，当数据改变更新视图
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }
  // 编译元素节点，处理指令
  compileElement(node) {
    // 编译所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name
      // 判断是否是指令
      if (this.isDirective(attrName)) {
        // 属性的值
        let key = attr.textContent
        // v-text -> text
        attrName = attrName.slice(2)
        if (attrName.startsWith('on')) {
          const event = attrName.replace('on:', '') // 获取事件名
          // 事件更新
          return this.eventUpdate(node, key, event)
        }
        this.update(node, attrName, key)
      }
    })
  }
  update(node, attrName, key) {
    let updateFn = this[`${attrName}Updater`]
    updateFn && updateFn.call(this, node, key, this.vm[key])
  }
  eventUpdate(node, key, event) {
    this.onUpdater(node, this.vm[key], key, event)
  }
  // 处理 v-text 指令
  textUpdater(node, key, val) {
    node.textContent = val
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
      node.textContent = newValue
    })
  }
  // 处理 v-model 指令
  modelUpdater(node, key, val) {
    node.value = val
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
      node.value = newValue
    })
    // 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  // 处理 v-html 指令
  htmlUpdater(node, key, val) {
    node.innerHTML = val
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
      node.innerHTML = newValue
    })
  }
  // 处理 v-on 指令
  onUpdater(node, value, key, eventType) {
    node.addEventListener(eventType, value)
    new Watcher(this.vm, key, newValue => {
      node.removeEventListener(eventType, value)
      node.addEventListener(eventType, newValue)
    })
  }
  // methods 中是否有对应的方法
  hasMethods(key) {
    const methods = this.vm.$options.methods
    if (!methods[key]) {
      console.error('no methods!!!')
      return false
    }
    return true
  }
  // 判断是否是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  // 判断是否是文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }
  // 判断是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
}
