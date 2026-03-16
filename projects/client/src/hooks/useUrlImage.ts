import { useQuery } from '@tanstack/react-query'

const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader
  reader.onerror = reject
  reader.onload = () => {
      resolve(reader.result)
  }
  reader.readAsDataURL(blob)
})

const useUrlImage = (url: string | undefined) => {
  const {
    data: base64Image,
    error,
    isLoading,
  } = useQuery({
    queryKey: [url],
    queryFn: () =>
      url && fetch(url)
      .then((result) => result.blob())
      .then(convertBlobToBase64)
  })

  return { base64Image, error, isLoading }
}

export default useUrlImage
