
# react-image-viewers

一款React图片组件，基于ImageViewerUtil实现，包含：图片预览、放大、缩小、旋转、拖动功能


## 使用方式

```
yarn add react-image-viewers
```

```
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

- url: image url
- onLoadStart：image loading
- onLoad： image load
- onLoadError: image load error
- onStyleChange：image some attr change
- timeout：delay show image


### 2、ref
```
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

此类使用原生js实现，不依赖任何第三方库

包含：图片预览、放大、缩小、旋转、拖动功能

## 使用方式

### 1、html中使用
```
// 引入dist/ImageViewerUtil.js，详见：examples/purehtml/index.html
<script src="ImageViewerUtil.js"></script>
```

### 2、import方式
```
//
import { ImageViewerUtil } from 'react-image-viewers'
```


## API


### 1、初始化

```
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

```
const imageUrl = '图片地址'
imageViewerUtil.update({ url: imageUrl })
```

### 3、图片放大
```
imageViewerUtil.setLarge()
```

### 4、图片缩小
```
imageViewerUtil.setSmall()
```


### 5、图片还原
```
imageViewerUtil.setReset()
```


### 6、图片旋转
```
imageViewerUtil.setRotate()
```


### 7、销毁实例
```
imageViewerUtil.destory()
```

### 7、debug模式
```
imageViewerUtil.setDebug(true)
```

### 7、图片延迟加载
```
const timeout = 3000 // 3s后显示图片
imageViewerUtil.setTimeout(timeout)
```