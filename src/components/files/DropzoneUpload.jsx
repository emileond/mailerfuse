import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'
import { Button } from '@nextui-org/react'
import toast from 'react-hot-toast'
import { useDarkMode } from '../../hooks/theme/useDarkMode'

const DropzoneUpload = () => {
  const [darkMode] = useDarkMode()

  const imgFolder = darkMode ? 'dark' : 'light'
  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles)
    // Handle the uploaded files here
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [], // Customize accepted file types
    },
    onDropRejected: () => {
      toast.error(
        'The file type you are trying to upload is not supported. Supported file types are: .csv,.txt,.xlsx,.xls'
      )
    },
  })

  return (
    <div
      {...getRootProps()}
      className={`min-h-60 flex flex-col items-center justify-center border-2 border-dashed border-default-200 rounded-lg p-6 cursor-pointer hover:bg-default-100 ${
        isDragActive ? 'bg-primary-200' : 'bg-content1'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="font-semibold text-lg">Drop it like it&apos;s hot!</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <img
              src={`/empty-states/${imgFolder}/upload.svg`}
              alt="upload"
              className="w-24 h-24 mx-auto"
            />
            <p className="font-medium text-default-500">
              Drag & drop some files here
            </p>
          </div>
          <Button color="primary" variant="ghost">
            Select Files
          </Button>
        </div>
      )}
    </div>
  )
}

export default DropzoneUpload
