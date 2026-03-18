import { useQuery } from '@tanstack/react-query'

const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader
  reader.onerror = reject
  reader.onload = () => {
      resolve(reader.result)
  }
  reader.readAsDataURL(blob)
})

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

const useUrlImage = (url: string | undefined) => {
  const {
    data: base64Image,
    error,
    isLoading,
  } = useQuery({
    queryKey: [url],
    queryFn: () =>
      fetch(url ?? noBackgroundImageUrl)
        .then((result) => result.blob())
        .then(convertBlobToBase64)
  })

  return { base64Image, error, isLoading }
}

export default useUrlImage
