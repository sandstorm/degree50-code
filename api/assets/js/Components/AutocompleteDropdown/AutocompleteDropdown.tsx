// @ts-nocheck -- WHY: don't fix until clear if actually used
import React, { useState } from 'react'
import { useCombobox } from 'downshift'

import { VideoList, VideoListVariables } from './__generated__/VideoList'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const VIDEO_LIST = gql`
  query VideoList($title: String!) {
    videos(title: $title) {
      edges {
        node {
          _id
          title
        }
      }
    }
  }
`

export default function AutocompleteDropdown() {
  const [inputValue, setInputValue] = useState('')

  const { loading, data, error } = useQuery<VideoList, VideoListVariables>(
    VIDEO_LIST,
    {
      variables: { title: inputValue },
    }
  )

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: data?.videos?.edges || [],
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue)
    },
  })

  return (
    <>
      <label {...getLabelProps()}>Choose an element:</label>
      <div {...getComboboxProps()}>
        <input {...getInputProps()} />
        <button {...getToggleButtonProps()} aria-label={'toggle menu'}>
          &#8595;
        </button>
      </div>
      <ul {...getMenuProps()}>
        {isOpen &&
          data?.videos?.edges.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${item.node._id}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.node.title}
            </li>
          ))}
      </ul>
    </>
  )
}
