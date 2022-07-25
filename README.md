# react-image-viewers

一款 React 图片组件，基于 ImageViewerUtil 实现，包含：图片预览、放大、缩小、旋转、拖动功能

## 使用方式

```bash
yarn add react-image-viewers
```

```bash
import ReactImageViewer from 'react-image-viewers'
import 'react-image-viewers/lib/esm/index.css'


const reactImageViewerRef = useRef(null)
const [loading, setLoading] = useState(false)

<ReactImageViewer
    ref={reactImageViewerRef}
    url={imageUrl}
    timeout={5000}
    onLoadStart={(url) => {
        console.log(`ReactImageViewer Image LoadStart:: url=${url}`)
        setLoading(true)
    }}
    onLoad={(image) => {
        const { width, height } = image
        console.log(`ReactImageViewer Image Load:: width=${width},height=${height}`)
        setLoading(false)
    }}
    onLoadError={(err) => {
        console.error(`ReactImageViewer Image LoadError:: error=${JSON.stringify(err)}`)
        setLoading(false)
    }}
    onStyleChange={(opts) => {
        console.log(`ReactImageViewer Image StyleChange:: options=${JSON.stringify(opts)}`)
    }}
/>
```

## API

### 1、属性

-   [url]: image url
-   [onLoadStart]：image loading
-   [onLoad]： image load
-   [onLoadError]: image load error
-   [onStyleChange]：image some attr change
-   [timeout]：delay show image
-   [config]:
    perScale?: number // 每次缩放比例
    minScale?: number // 最小缩放比例
    maxScale?: number // 最大缩放比例
    perRotate?: number // 每次旋转角度
    minRotate?: number // 最小旋转角度
    maxRotate?: number // 最大旋转角度
    translateTouchType?: 'mousewheel' | 'shift' | 'alt' | 'shift+mousewheel' | 'ctrl+shift+mousewheel' | 'ctrl+alt+mousewheel' // 滚轮缩放触发类型

### 2、ref

```bash
<button
    onClick={() => {
        reactImageViewerRef.current.setLarge()
    }}
>
    放大
</button>
<button
    onClick={() => {
        reactImageViewerRef.current.setSmall()
    }}
>
    缩小
</button>
<button
    onClick={() => {
        reactImageViewerRef.current.setReset()
    }}
>
    还原
</button>
<button
    onClick={() => {
        reactImageViewerRef.current.setRotate()
    }}
>
    旋转
</button>
```

# ImageViewerUtil

此类使用原生 js 实现，不依赖任何第三方库

包含：图片预览、放大、缩小、旋转、拖动功能

## 使用方式

### 1、html 中使用

```bash
# 引入dist/ImageViewerUtil.js，详见：examples/purehtml/index.html
<script src="ImageViewerUtil.js"></script>
```

### 2、import 方式

```bash
import { ImageViewerUtil } from 'react-image-viewers'
```

## API

### 1、初始化

```bash
const imageContainer = '<img /> 外层dom元素'
const image = '<img /> dom元素'
const config = {
    imageContainerNode: imageContainer,
    imageNode: image,
    onLoadStart: () => {
        // 图片加载中，loading
    },
    onLoad: () => {
        // 图片加载完成，loading 取消
    },
    onLoadError: () => {
        // 图片加载出错
    },
    onStyleChange: () => {
        // 图片放大、缩小、旋转、拖动回调
    },
}
const imageViewerUtil = new ImageViewerUti(config)
```

### 2、加载图片

切换上一张、下一张图片均自己控制

```bash
const imageUrl = '图片地址'
imageViewerUtil.update({ url: imageUrl })
```

### 3、图片放大

```bash
imageViewerUtil.setLarge()
```

### 4、图片缩小

```bash
imageViewerUtil.setSmall()
```

### 5、图片还原

```bash
imageViewerUtil.setReset()
```

### 6、图片旋转

```bash
imageViewerUtil.setRotate()
```

### 7、销毁实例

```bash
imageViewerUtil.destory()
```

### 7、debug 模式

```bash
imageViewerUtil.setDebug(true)
```

### 7、图片延迟加载

```bash
const timeout = 3000 // 3s后显示图片
imageViewerUtil.setTimeout(timeout)
```

### 8、更新 config

```bash
imageViewerUtil.setConfig({
    # perScale: 3, // 每次缩放比例
    # minScale: 2, // 最小缩放比例
    # maxScale: 7, // 最大缩放比例
    # perRotate: 10, // 每次旋转角度
    # minRotate: 0, // 最小旋转角度
    # maxRotate: 180, // 最大旋转角度
    # translateTouchType: 'shift+mousewheel', // 'mousewheel' | 'shift+mousewheel' | 'alt+mousewheel' | 'ctrl+shift+mousewheel' | 'ctrl+alt+mousewheel' // 滚轮缩放触发类型，默认mousewheel
})
```
