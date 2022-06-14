import React from 'react'
import { CKEditor as CKE5React } from '@ckeditor/ckeditor5-react'
import CustomCKEditor from 'Components/CKEditor/CustomCKEditor'

type Props = {
  value: string
  onChange: (value: string) => void
}

const CKEditor = (props: Props) => {
  const handleChange = (_ev: any, editor: CustomCKEditor) => {
    props.onChange(editor.getData())
  }

  return (
    <CKE5React
      editor={CustomCKEditor}
      data={props.value}
      onChange={handleChange}
    />
  )
}

export default React.memo(CKEditor)
