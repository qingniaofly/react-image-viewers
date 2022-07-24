import React, { useEffect, useImperativeHandle, useRef } from 'react'
import ImageViewerUtil from '../ImageViewerUtil'
import './index.scss'

export interface IReactImageViewStyleChangeProps {
    scale?: number
    translateX?: number
    translateY?: number
    rotateZ?: number
}

export interface IReactImageViewCallback {
    isDebug?: boolean
    timeout?: number
    onLoadStart?: (url: string) => void
    onLoad?: (image: HTMLImageElement) => void
    onLoadError?: (err) => void
    onStyleChange?: (opts: IReactImageViewStyleChangeProps) => void
}

export interface IReactImageViewerProps extends IReactImageViewCallback {
    className?: string
    url?: string
}

export interface IReactImageViewInstance extends IReactImageViewCallback {
    imageViewerUtil: ImageViewerUtil
}

const ReactImageViewer = React.forwardRef((props: IReactImageViewerProps, ref: any) => {
    const { className = '', url: imageUrl, timeout = 0, isDebug = false } = props

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
