import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileDropzoneProps {
    sendFiles: (files: File[]) => void;
    isMinimal?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ sendFiles, isMinimal = false }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length) sendFiles(acceptedFiles);
    }, [sendFiles]);

    const { getInputProps, getRootProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            "image/*": [],
            "video/*": [],
        },
    });

    return (
        <div style={{ width: "100%" }}>
            <div {...getRootProps()}
                className={`
                    w-full text-center cursor-pointer transition-colors duration-200 outline-none
                    ${isMinimal 
                        ? 'p-8' 
                        : 'p-10 border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-300'
                    }
                    ${isDragActive ? 'bg-indigo-50 border-indigo-400' : ''}
                `}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className='text-indigo-500 font-medium'>Drop the files here ...</p>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                        {!isMinimal && (
                            <div className="p-3 bg-zinc-100 rounded-full text-zinc-400 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            </div>
                        )}
                        <p className={`${isMinimal ? 'text-zinc-400 text-sm' : 'text-zinc-600 font-medium'}`}>
                            {isMinimal ? "Click to add photos or videos" : "Drag 'n' drop media here, or click to select"}
                        </p>
                        {!isMinimal && <p className="text-xs text-zinc-400">Select one or more images or videos</p>}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FileDropzone
