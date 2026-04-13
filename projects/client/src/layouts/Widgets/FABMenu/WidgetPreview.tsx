import FabMenuWidget from './FabMenuWidget'

const FABMenuPreview = () => {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className='flex flex-1'>
        <div className="relative flex h-full w-full flex-col bg-white">
          <div className="flex flex-col gap-3 text-indigo-200 absolute top-0 left-0">
            <span className="h-6 w-2/3 rounded-full bg-current" />
            <span className="h-3 w-11/12 rounded-full bg-current/70" />
            <span className="h-3 w-8/12 rounded-full bg-current/60" />
            <span className="h-3 w-7/12 rounded-full bg-current/60" />
          </div>

          <FabMenuWidget
            anchorBaseClassName="absolute bottom-4"
            anchorOffsetClassName={{ left: 'left-4', right: 'right-4' }}
            listClassName="max-w-[280px]"
            triggerClassName="h-16 w-16"
          />
        </div>
      </div>
    </div>
  )
}

export default FABMenuPreview
