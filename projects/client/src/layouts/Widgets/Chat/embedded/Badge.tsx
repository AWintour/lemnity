import { cn } from "@heroui/theme"

type BadgeProps = {
  badgeContent: number
}

const Badge = (props: BadgeProps) => {
  return (
    <>
      {props.badgeContent > 0 && (
        <div className='absolute top-0 right-0'>
          <span className='relative flex size-4.5'>
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full',
                'animate-ping bg-[#FF4646] opacity-75',
              )}
            />
            <span
              className={cn(
                'relative inline-flex size-4.5 rounded-full bg-[#FF4646]',
                'text-white text-xs items-center justify-center',
              )}
            >
              {props.badgeContent}
            </span>
          </span>
        </div>
      )}
    </>
  )
}

export default Badge
