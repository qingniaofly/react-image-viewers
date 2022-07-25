import React, { useEffect, useImperativeHandle, useRef } from 'react'
import ImageViewerUtil from '../ImageViewerUtil'
import './index.scss'

export interface IReactImageViewStyleChangeProps {
    scale?: number
    translateX?: number
    translateY?: number
    rotateZ?: number
}

export interface IReactImageViewConfig {
    isDebug?: boolean
    timeout?: number
    onLoadStart?: (url: string) => void
    onLoad?: (image: HTMLImageElement) => void
    onLoadError?: (err) => void
    onStyleChange?: (opts: IReactImageViewStyleChangeProps) => void
}

export interface IReactImageViewerProps extends IReactImageViewConfig {
    className?: string
    url?: string
    config?: IImageViewerStyleUpdateConfig
}

export interface IReactImageViewInstance extends IReactImageViewConfig {
    imageViewerUtil: ImageViewerUtil
}

interface IImageViewerStyleUpdateConfig {
    perScale?: number // 每次缩放比例
    minScale?: number // 最小缩放比例
    maxScale?: number // 最大缩放比例
    perRotate?: number // 每次旋转角度
    minRotate?: number // 最小旋转角度
    maxRotate?: number // 最大旋转角度
    translateTouchType?: 'mousewheel' | 'shift+mousewheel' | 'alt+mousewheel' | 'ctrl+shift+mousewheel' | 'ctrl+alt+mousewheel' // 滚轮缩放触发类型
}

const ReactImageViewer = React.forwardRef((props: IReactImageViewerProps, ref: any) => {
    const { className = '', url: imageUrl, timeout = 0, isDebug = false, config } = props

    const imageContainerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const instance = useRef<IReactImageViewInstance>({ imageViewerUtil: null })
    instance.current.onLoadStart = props.onLoadStart
    instance.current.onLoad = props.onLoad
    instance.current.onLoadError = props.onLoadError
    instance.current.onStyleChange = props.onStyleChange

    useEffect(() => {
        const imageContainer = imageContainerRef.current
        const image = imageRef.current
        const { onLoadStart, onLoad, onLoadError, onStyleChange } = instance.current
        const config = {
            imageContainerNode: imageContainer,
            imageNode: image,
            onLoadStart,
            onLoad,
            onLoadError,
            onStyleChange,
        }
        const imageViewerUtil = new ImageViewerUtil(config as any)
        instance.current.imageViewerUtil = imageViewerUtil

        return () => {
            imageViewerUtil.destory()
        }
    }, [])

    useEffect(() => {
        const { imageViewerUtil } = instance.current
        imageViewerUtil.setConfig(config)
    }, [config])

    useEffect(() => {
        const { imageViewerUtil } = instance.current
        imageViewerUtil.setTimeout(timeout)
    }, [timeout])

    useEffect(() => {
        const { imageViewerUtil } = instance.current
        imageViewerUtil.setDebug(!!isDebug)
    }, [isDebug])

    useEffect(() => {
        const { imageViewerUtil } = instance.current
        imageViewerUtil.update({ url: imageUrl })
    }, [imageUrl])

    useImperativeHandle(ref, () => ({
        container: imageContainerRef.current,
        image: imageRef.current,
        setLarge: () => {
            instance.current.imageViewerUtil.setLarge()
        },
        setSmall: () => {
            instance.current.imageViewerUtil.setSmall()
        },
        setReset: () => {
            instance.current.imageViewerUtil.setReset()
        },
        setRotate: () => {
            instance.current.imageViewerUtil.setRotate()
        },
    }))

    return (
        <div className={`react-image-viewer-container ${className}`} ref={imageContainerRef}>
            <img ref={imageRef} className="react-image-viewer" />
        </div>
    )
})

export default ReactImageViewer
