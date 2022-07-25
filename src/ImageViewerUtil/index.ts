function registerEvent(dom, name: string, fn) {
    if (dom.attachEvent) {
        dom.attachEvent('on' + name, fn)
    } else {
        dom.addEventListener(name, fn, false)
    }
}

function unregisterEvent(dom, name: string, fn) {
    if (dom.detachEvent) {
        dom.detachEvent('on' + name, fn)
    } else {
        dom.removeEventListener(name, fn, false)
    }
}

function loadImagePromise(url: string) {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => {
            resolve(image)
        }
        image.onerror = reject
        image.src = url
    })
}

function parseNumber(n: number, l = 1) {
    let a = parseFloat(`${n}`)
    a = isNaN(a) ? 0 : a
    const b = a.toFixed(l)
    return parseFloat(b)
}

function isFunction(fn) {
    return typeof fn === 'function'
}

const styleUtil = {
    updateTransform: (dom: HTMLDivElement | HTMLImageElement, opt: IImagerViewerStyle) => {
        if (!dom || !dom?.style || !opt) {
            return
        }
        const transfromInfo = dom.style.transform || ''
        const transfromList = transfromInfo.split(' ')
        for (let key in opt) {
            const value = opt[key]
            if (typeof value !== 'number') {
                continue
            }
            const index = transfromList.findIndex((v) => v.indexOf(key) > -1)
            if (index > -1) {
                transfromList.splice(index, 1)
            }
            let str = ''
            switch (key) {
                case 'scale':
                    str = `scale(${(opt.scale, opt.scale)})`
                    break
                case 'translateX':
                    str = `translateX(${opt.translateX}px)`
                    break
                case 'translateY':
                    str = `translateY(${opt.translateY}px)`
                    break
                case 'rotateZ':
                    str = `rotateZ(${opt.rotateZ}deg)`
                default:
                    break
            }
            if (key) {
                transfromList.push(str)
            }
        }
        dom.style.transform = transfromList.join(' ')
    },

    parseImageDragMoveLimitSize(imageNode: HTMLImageElement, scale: number) {
        const { clientWidth, clientHeight } = imageNode
        const { offsetLeft, offsetTop } = imageNode
        const width = scale * clientWidth + offsetLeft
        const height = scale * clientHeight + offsetTop
        const w = scale > 1 ? parseNumber((width - clientWidth) / 2 / scale, 2) : 0
        const h = scale > 1 ? parseNumber((height - clientHeight) / 2 / scale, 2) : 0
        const minLeft = -w
        const maxLeft = w
        const minTop = -h
        const maxTop = h
        return { minLeft, maxLeft, minTop, maxTop }
    },
}

const logUtil = {
    log: (...args) => {
        return console.log.apply(console, args)
    },
    warn: (...args) => {
        return console.warn.apply(console, args)
    },
    info: (...args) => {
        return console.info.apply(console, args)
    },
    error: (...args) => {
        return console.error.apply(console, args)
    },
}

interface IImagerViewerStyle {
    scale?: number
    translateX?: number
    translateY?: number
    rotateZ?: number
}

interface IImageViewerParams {
    imageContainerNode: HTMLDivElement
    imageNode: HTMLImageElement
    onLoadStart?: (url: string) => void
    onLoad?: (image: HTMLImageElement) => void
    onLoadError?: (err) => void
    onStyleChange?: (opts: IImagerViewerStyle) => void
}

interface IImageViewerConfig {
    isDebug: false
    imageStyle: {
        scale: {
            defaultValue: number
            value: number // 当前缩放比例
            per: number
            min: number
            max: number
        }
        rotate: {
            defaultValue: number
            value: number // 当前旋转角度
            per: number
            min: number
            max: number
        }
        translate: {
            x: number
            y: number
            prevX: number // 上一次鼠标弹起后的x
            prevY: number // 上一次鼠标弹起后的y
            touchType: string // 触发类型
        }
    }
    timeout: number
    onLoadStart?: (url: string) => void
    onLoad?: (image: HTMLImageElement) => void
    onLoadError?: (err) => void
    onStyleChange?: (opts: IImagerViewerStyle) => void
}

interface IImageViewerStyleUpdateConfig {
    perScale?: number // 每次缩放比例
    minScale?: number // 最小缩放比例
    maxScale?: number // 最大缩放比例
    perRotate?: number // 每次旋转角度
    minRotate?: number // 最小旋转角度
    maxRotate?: number // 最大旋转角度
    translateTouchType?: 'mousewheel' | 'ctrl+mousewheel' | string // 滚轮缩放
}

class ImageViewerUtil {
    private imageContainerNode: HTMLDivElement
    private imageNode: HTMLImageElement // <img />
    private image: HTMLImageElement // new Image() 代理对象

    private imageEventX = 0 // 开始拖动图片时，鼠标的位置x
    private imageEventY = 0 // 开始拖动图片时，鼠标的位置y
    private canDragImage = 0 // 鼠标是在图片上，是否可以拖动
    private canMoveImage = 0 // 鼠标是在图片上按下，是否可以移动
    private keyCodeList: number[] = [] // 当前鼠标按下的keyCode

    private config: IImageViewerConfig = {
        isDebug: false,
        imageStyle: {
            scale: {
                defaultValue: 1,
                value: 1, // 当前缩放比例
                per: 0.15,
                min: 0.1,
                max: 20,
            },
            rotate: {
                defaultValue: 0,
                value: 0, // 当前旋转角度
                per: 90,
                min: 0,
                max: 360,
            },
            translate: {
                x: 0,
                y: 0,
                prevX: 0, // 上一次鼠标弹起后的x
                prevY: 0, // 上一次鼠标弹起后的y
                touchType: 'mousewheel',
            },
        },
        timeout: 0,
        onLoadStart: undefined,
        onLoad: undefined,
        onLoadError: undefined,
        onStyleChange: undefined,
    }

    constructor(params: IImageViewerParams) {
        this.updateDOMNode(params)
        this.updateImageCallback(params)
        this.bindEvent()
    }

    private log(type, ...args) {
        if (!this.config.isDebug) {
            return
        }
        switch (type) {
            case 1:
                logUtil.log.apply(logUtil, args)
                break
            case 2:
                logUtil.error.apply(logUtil, args)
                break
            default:
                logUtil.log.apply(logUtil, args)
                break
        }
    }

    private onDocumentMousewheel = (e) => {
        this.handleImageMousewheel(e)
    }

    private onDocumentMouseDown = (e) => {
        this.handleImageMouseDown(e)
    }

    private onDocumentMouseMove = (e) => {
        this.handleImageMouseMove(e)
    }

    private onDocumentMouseUp = (e) => {
        this.handleImageMouseUp(e)
    }

    private onDocumentKeyDown = (e) => {
        this.handleImageKeyDown(e)
    }

    private onDocumentKeyUp = (e) => {
        this.handleImageKeyUp(e)
    }

    private onImageMouseOver = (e) => {
        this.handleImageMouseOver(e)
    }

    private onImageMouseLeave = (e) => {
        this.handleImageMouseLeave(e)
    }

    private bindEvent() {
        window.onresize = (e) => {
            this.handleImageWindowResize(e)
        }
        registerEvent(document, 'mousewheel', this.onDocumentMousewheel)
        registerEvent(document, 'mousedown', this.onDocumentMouseDown)
        registerEvent(document, 'mousemove', this.onDocumentMouseMove)
        registerEvent(document, 'mouseup', this.onDocumentMouseUp)
        registerEvent(document, 'keydown', this.onDocumentKeyDown)
        registerEvent(document, 'keyup', this.onDocumentKeyUp)
        registerEvent(this.imageNode, 'mouseover', this.onImageMouseOver)
        registerEvent(this.imageNode, 'mouseleave', this.onImageMouseLeave)
    }

    private unbindEvent() {
        unregisterEvent(document, 'mousewheel', this.onDocumentMousewheel)
        unregisterEvent(document, 'mousedown', this.onDocumentMouseDown)
        unregisterEvent(document, 'mousemove', this.onDocumentMouseMove)
        unregisterEvent(document, 'mouseup', this.onDocumentMouseUp)
        unregisterEvent(this.imageNode, 'mouseover', this.onImageMouseOver)
        unregisterEvent(this.imageNode, 'mouseleave', this.onImageMouseLeave)
    }

    private handleImageKeyDown(e) {
        const keyCode = e.keyCode as number
        const { keyCodeList } = this
        if (keyCode !== undefined && !keyCodeList.includes(keyCode)) {
            keyCodeList.push(keyCode)
        }
        this.keyCodeList = keyCodeList
    }

    private handleImageKeyUp(e) {
        const keyCode = e.keyCode as number
        const { keyCodeList } = this
        const index = keyCodeList.indexOf(keyCode)
        keyCodeList.splice(index, 1)
        this.keyCodeList = keyCodeList
    }

    private handleImageWindowResize(e) {
        this.updateImagePrevTransform({ x: 0, y: 0 })
    }

    private isPressDownShift() {
        // 是否按下了shift键
        return this.keyCodeList.includes(16)
    }

    private isPressDownCtrl() {
        // 是否按下了ctrl键
        return this.keyCodeList.includes(17)
    }

    private isPressDownAlt() {
        // 是否按下了alt键
        return this.keyCodeList.includes(18)
    }

    private isPressDownCtrlShift() {
        // 是否按下了ctrl+shift键
        return this.isPressDownCtrl() && this.isPressDownShift()
    }

    private isPressDownCtrlAlt() {
        // 是否按下了ctrl+shift键
        return this.isPressDownCtrl() && this.isPressDownAlt()
    }

    private handleImageMousewheel(e) {
        if (e?.target !== this.imageNode) {
            // 必须在图片内滚动滚轮
            return
        }
        const imageStyleConfig = this.getImageStyleConfig()
        const { translate } = imageStyleConfig

        const traslateImage = (e) => {
            if (e.wheelDelta >= 1) {
                // 放大
                this.large()
            } else {
                // 缩小
                this.small()
            }
        }
        switch (translate.touchType) {
            case 'mousewheel':
                traslateImage(e)
                break
            case 'shift+mousewheel':
                if (this.isPressDownShift()) {
                    // 鼠标按下shift键，滚动滚轮，缩放图片
                    traslateImage(e)
                }
                break
            case 'alt+mousewheel':
                if (this.isPressDownAlt()) {
                    traslateImage(e)
                }
                break
            case 'ctrl+shift+mousewheel':
                if (this.isPressDownCtrlShift()) {
                    traslateImage(e)
                }
                break
            case 'ctrl+alt+mousewheel':
                if (this.isPressDownCtrlAlt()) {
                    traslateImage(e)
                }
                break
            default:
                traslateImage(e)
                break
        }
    }

    private handleImageMouseOver(e) {
        this.canDragImage = 1
    }

    private handleImageMouseLeave(e) {
        e.preventDefault()
        this.canDragImage = 0
    }

    private handleImageMouseDown(e) {
        if (this.canDragImage) {
            this.canMoveImage = 1
            const event = window.event as any
            this.imageEventX = event.x
            this.imageEventY = event.y
            const imageStyleConfig = this.getImageStyleConfig()
            const { translate } = imageStyleConfig
            this.updateImagePrevTransform({ x: translate.x, y: translate.y })
        }
    }

    private handleImageMouseMove(e) {
        e.preventDefault()
        if (this.canMoveImage) {
            const event = window.event as any
            const eventX = event.x
            const eventY = event.y
            const imageStyleConfig = this.getImageStyleConfig()
            const { translate } = imageStyleConfig
            const { x: oldTranslateX, y: oldTranslateY, prevX, prevY } = translate
            const { value: scale } = imageStyleConfig.scale
            const imageNode = this.imageNode
            const moveLimitSize = styleUtil.parseImageDragMoveLimitSize(imageNode, scale)
            const { minLeft, maxLeft, minTop, maxTop } = moveLimitSize

            let translateX = prevX + eventX - this.imageEventX
            let translateY = prevY + eventY - this.imageEventY
            this.log(1, `ImageViewerUtil image move data=${JSON.stringify(moveLimitSize)}`)
            if ((translateX <= 0 && translateX < minLeft) || (translateX >= 0 && translateX > maxLeft)) {
                translateX = oldTranslateX
            }

            if ((translateY <= 0 && translateY < minTop) || (translateY >= 0 && translateY > maxTop)) {
                translateY = oldTranslateY
            }

            const opts = { translateX, translateY }
            this.updateTranslate(opts)
            this.updateImageTransform(opts)
        }
    }

    private handleImageMouseUp(e) {
        this.canMoveImage = 0
    }

    private updateDOMNode(params: IImageViewerParams) {
        const { imageContainerNode, imageNode } = params
        this.imageContainerNode = imageContainerNode
        this.imageNode = imageNode
    }

    private updateImageStyleConfig(opts: IImageViewerStyleUpdateConfig) {
        if (!opts) {
            return
        }
        this.updateImageStyleScaleConfig(opts)
        this.updateImageStyleRotateConfig(opts)
        this.updateImageStyleTranslateConfig(opts)
    }

    private updateImageStyleScaleConfig(opts: IImageViewerStyleUpdateConfig) {
        if (!opts) {
            return
        }
        const { perScale, minScale, maxScale } = opts
        const imageStyleConfig = this.getImageStyleConfig()

        if (typeof perScale === 'number' && !isNaN(perScale)) {
            imageStyleConfig.scale.per = perScale
        }

        if (typeof minScale === 'number' && typeof maxScale === 'number') {
            if (minScale > maxScale) {
                return
            }
        }
        if (typeof minScale === 'number' && !isNaN(minScale)) {
            imageStyleConfig.scale.min = minScale
        }

        if (typeof maxScale === 'number' && !isNaN(maxScale)) {
            imageStyleConfig.scale.max = maxScale
        }
    }

    private updateImageStyleRotateConfig(opts: IImageViewerStyleUpdateConfig) {
        if (!opts) {
            return
        }
        const { perRotate, minRotate, maxRotate } = opts
        const imageStyleConfig = this.getImageStyleConfig()

        if (typeof perRotate === 'number' && !isNaN(perRotate)) {
            imageStyleConfig.rotate.per = perRotate
        }

        if (typeof minRotate === 'number' && typeof maxRotate === 'number') {
            if (minRotate > maxRotate) {
                return
            }
        }
        if (typeof minRotate === 'number' && !isNaN(minRotate)) {
            imageStyleConfig.rotate.min = minRotate
        }

        if (typeof maxRotate === 'number' && !isNaN(maxRotate)) {
            imageStyleConfig.rotate.max = maxRotate
        }
    }

    private updateImageStyleTranslateConfig(opts: IImageViewerStyleUpdateConfig) {
        if (!opts) {
            return
        }
        const { translateTouchType } = opts
        const imageStyleConfig = this.getImageStyleConfig()
        if (typeof translateTouchType === 'string') {
            imageStyleConfig.translate.touchType = translateTouchType
        }
    }

    private updateImageCallback(params: IImageViewerParams) {
        const { onLoadStart, onLoad, onLoadError, onStyleChange } = params
        this.config.onLoadStart = onLoadStart
        this.config.onLoad = onLoad
        this.config.onLoadError = onLoadError
        this.config.onStyleChange = onStyleChange
    }

    private updateImageTransform(opts) {
        const { onStyleChange } = this.config
        typeof onStyleChange === 'function' && onStyleChange(opts)
        styleUtil.updateTransform(this.imageNode, opts)
    }

    private updateImagePrevTransform({ x, y }) {
        const imageStyleConfig = this.getImageStyleConfig()
        const { translate } = imageStyleConfig
        translate.prevX = x
        translate.prevY = y
    }

    private getImageStyleConfig() {
        return this.config.imageStyle
    }

    private large() {
        const imageStyleConfig = this.getImageStyleConfig()
        const { per: scalePer, max: maxScale, value } = imageStyleConfig.scale
        let scale = parseNumber(value + scalePer)
        scale = scale > maxScale ? maxScale : scale
        this.updateImagePrevTransform({ x: 0, y: 0 })
        this.updateScale(scale)
        this.updateImageTransform({ scale })
    }

    private small() {
        const imageStyleConfig = this.getImageStyleConfig()
        const { per: scalePer, min: minScale, value } = imageStyleConfig.scale
        let scale = parseNumber(value - scalePer)
        scale = scale < minScale ? minScale : scale
        this.updateImagePrevTransform({ x: 0, y: 0 })
        let translateX
        let translateY
        if (scale < 1) {
            translateX = 0
            translateY = 0
        }
        this.updateScale(scale)
        this.updateImageTransform({ scale, translateX, translateY })
    }

    private updateScale(scale) {
        const imageStyleConfig = this.getImageStyleConfig()
        imageStyleConfig.scale.value = scale
        this.log(1, `ImageViewerUtil image scale=${scale}`)
    }

    private updateRotate(rotate) {
        const imageStyleConfig = this.getImageStyleConfig()
        imageStyleConfig.rotate.value = rotate
        this.log(1, `ImageViewerUtil image rotate=${rotate}`)
    }

    private updateTranslate(opts) {
        const { translateX, translateY } = opts
        const imageStyleConfig = this.getImageStyleConfig()
        imageStyleConfig.translate.x = translateX
        imageStyleConfig.translate.y = translateY
        this.log(1, `ImageViewerUtil image translate=${JSON.stringify(opts)}`)
    }

    private reset() {
        const imageStyleConfig = this.getImageStyleConfig()
        const scale = imageStyleConfig.scale.defaultValue
        this.updateScale(scale)
        const rotate = imageStyleConfig.rotate.defaultValue
        this.updateRotate(rotate)
        this.updateImageTransform({ scale, translateX: 0, translateY: 0 })
    }

    private rotate() {
        const { per: rotatePer, min: minRotate, max: maxRotate, value } = this.config.imageStyle.rotate
        let rotate = value + rotatePer
        if (rotate >= maxRotate) {
            rotate = minRotate
        }
        this.updateRotate(rotate)
        this.updateImageTransform({ rotateZ: rotate })
    }

    private onLoadImage(url) {
        const { onLoadStart } = this.config
        typeof onLoadStart === 'function' && onLoadStart(url)
        loadImagePromise(url)
            .then((image: any) => {
                const { onLoad, timeout = 0 } = this.config
                const fn = () => {
                    typeof onLoad === 'function' && onLoad(image as HTMLImageElement)
                    this.updateImageUrl(url)
                    this.updateImage(image)
                }
                if (typeof timeout === 'number') {
                    setTimeout(fn, timeout)
                } else {
                    fn()
                }
            })
            .catch((err) => {
                const { onLoadError } = this.config
                typeof onLoadError === 'function' && onLoadError(err)
            })
    }

    private updateImageUrl(url) {
        this.imageNode.setAttribute('src', url)
    }

    private updateImage(image) {
        this.image = image
    }

    private updateTimeout(timeout) {
        this.config.timeout = timeout
        this.log(1, `ImageViewerUtil image timeout=${timeout}`)
    }

    private updateDebug(debug) {
        this.config.isDebug = debug
        this.log(1, `ImageViewerUtil image debug=${debug}`)
    }

    update({ url }) {
        this.reset()
        this.onLoadImage(url)
    }

    setConfig(opts) {
        this.updateImageStyleConfig(opts)
    }

    preload(url: string) {
        return loadImagePromise(url)
    }

    setDebug(debug = false) {
        this.updateDebug(debug)
    }

    setTimeout(timeout = 0) {
        this.updateTimeout(timeout)
    }

    setLarge() {
        // 放大
        this.large()
    }

    setSmall() {
        // 缩小
        this.small()
    }

    setReset() {
        // 重置
        this.reset()
    }

    setRotate() {
        // 旋转
        this.rotate()
    }

    destory() {
        this.imageContainerNode = null
        this.imageNode = null
        this.unbindEvent()
    }
}
export default ImageViewerUtil
