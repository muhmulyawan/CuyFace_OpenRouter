"use client"
import React, { useRef, useState, useEffect, useMemo } from 'react'
import Webcam from 'react-webcam'
import { FiBookOpen } from "react-icons/fi";

function usePotrait() {
    const [potrait, setPotrait] = useState(false);

    useEffect(() => {
        const screenMedia = window.matchMedia("(orientation: portrait)")

        const onChange = () => setPotrait(screenMedia.matches)
        onChange()
        screenMedia.addEventListener?.("change", onChange);
        return () => screenMedia.removeEventListener?.("change", onChange)
    }, [])

    return potrait
}

function Camera() {
    const webcamRef = useRef(null)
    const resultRef = useRef(null)
    const canvasRef = useRef(null)

    // const [state, formAction] = React.useActionState(_,{
    //     ok: false, 
    //     html: "",
    //     rid: ""
    // });

    const ridRef = useRef("")
    const ridInputRef = useRef(null);

    const [photoDataUrl, setPhotoDataUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isPortrait = usePotrait(); // 9:16 => 16:9 (untuk rensponsive dari camera nya)
    console.log(isPortrait)
    const videoConstrains = useMemo(
        () => ({
            facingMode: "user",
            width: { ideal: isPortrait ? 720 : 1280 }, 
            height: { ideal: isPortrait ? 1280 : 720 },
            frameRate: { ideal: 30, max: 60 }
        }), [isPortrait]
    );

    function capturePhoto() {
        const video = webcamRef.current?.video; // => data nya gaada dia akan menjadi undefined
        const canvas = canvasRef.current;

        console.log({video, canvas})
        
        if(!video || !canvas || video.videoWidth) {
            setErrorMessage("Kamera Belum siap, coba ditunggu sebentar brow!");
        }

        const vw = video.videoWidth, vh = video.videoHeight;

        const targetW = isPortrait ? 720 : 1280;
        const targetH = isPortrait ? 1280 : 720;
        
        const srcAspect = vw / vh, dstAspect = targetW / targetH;
        
        let sx = 0, sy = 0, sw = vw, sh = vh;

        if(srcAspect > dstAspect) { 
            sh = vh;
            sw = Math.round(vh * dstAspect); 
            sx = Math.round((vw - sw) / 2);
        } else {
            sw = vw;
            sh = Math.round(vw / dstAspect);
            sy = Math.round((vh - sh) / 2);
        }
        
        canvas.width = targetW;
        canvas.height = targetH;

        const context = canvas.getContext("2d")
        context.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);

        const result = canvas.toDataURL("image/jpeg", 0.9)
        console.log(result)
        setPhotoDataUrl(result)
    }
  return (
    <div>
        <div className='relative w-full rounded-2xl overflow-hidden bg-black'>
            <Webcam 
                ref={webcamRef}
                audio={false}
                videoConstraints={videoConstrains}
                className={'w-full ${isPortrait ? "aspect-[9/16]" : "aspect-video"} object-cover'}
                mirrored
                screenshotFormat='image/jpeg'
                screenshotQuality={0.9}
            />

            <div className="absolute bottom-2 left-1/2 -translate-1/2 flex items-center gap-3">
                {!photoDataUrl ? (
                    <button
                        onClick={capturePhoto}
                        className='flex items-center justify-center shadow w-14 h-14 rounded-full bg-white text-gray-900'
                        title='Ambil foto'
                    >
                        Foto
                    </button> 
                ) : (
                    <button
                        onClick={capturePhoto}
                        className='flex items-center justify-center shadow w-14 h-14 rounded-full bg-white text-gray-900'
                        title='Ambil foto'
                    >

                    </button> 
                )}

                <form>
                    <input type='hidden' name='image' value={photoDataUrl} />
                    <input ref={ridInputRef} type='hidden' name='rid' defaultValue={""} />
                    
                    <button 
                        type='submit'
                        disabled={!photoDataUrl || isLoading}
                        className={`px-4 h-14 rounded-xl text-white shadow transition ${
                            !photoDataUrl || isLoading ? "bg-gray-400" : "bg-emerald-700 hover:bg-emerald-800" 
                        }`}
                        title='Analisis & Ramalan'
                    >
                        {isLoading ? "Memproses..." : "Ramalkan"}
                    </button>
                </form>
            </div>
            {errorMessage && (<p className='text-red-500'>{errorMessage}</p>)}
            <canvas ref={canvasRef} className='hidden' />

        </div>
        <section ref={resultRef} className='w-full'>

            <div className='bg-gray-800 p-6 mt-8 rounded-xl shadow border border-gray-700'>
                <div className='flex items-center gap-2 mb-3 text-xl text-yellow-400'>
                    <FiBookOpen />  Hasil Ramalan
                </div>
                <div>loading...</div>
                <div>content</div>
            </div>
        </section>
    </div>
  )
}

export default Camera