import React from 'react'

type BrTagsOnNewlinesProps = {
  input: string
}

export const BrTagsOnNewlines = (props: BrTagsOnNewlinesProps) => {
  const lines = props.input.split('\n')

  return (
    <>
      {lines.map((line, index) => {
        if (index !== lines.length - 1 || index === 0) {
          return (
            <React.Fragment key={index}>
              <span>{line}</span><br/>
            </React.Fragment>
          )
        }
        else {
          return <span key={index}>{line}</span>
        }
      })}
    </>
  )
}