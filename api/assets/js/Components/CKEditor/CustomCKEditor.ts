import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor'
// Plugins - sorted alphabetically by import
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment'
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold'
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic'
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough'
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript'
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript'
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline'
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard'
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials'
import Font from '@ckeditor/ckeditor5-font/src/font'
import Heading from '@ckeditor/ckeditor5-heading/src/heading'
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline'
import Link from '@ckeditor/ckeditor5-link/src/link'
import List from '@ckeditor/ckeditor5-list/src/list'
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties'
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph'
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice'
import Table from '@ckeditor/ckeditor5-table/src/table'
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption'
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties'
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize'
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties'
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar'

export default class CustomCKEditor extends ClassicEditor {}

// eslint-disable-next-line functional/immutable-data
ClassicEditor.builtinPlugins = [
  Alignment,
  BlockQuote,
  Bold,
  Clipboard,
  Essentials,
  Font,
  Heading,
  HorizontalLine,
  Italic,
  Link,
  List,
  ListProperties,
  Paragraph,
  PasteFromOffice,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  Underline,
]

// eslint-disable-next-line functional/immutable-data
ClassicEditor.defaultConfig = {
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'subscript',
      'superscript',
      'blockQuote',
      'alignment',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bulletedList',
      'numberedList',
      'insertTable',
      '|',
      'link',
      'horizontalLine',
      '|',
      'undo',
      'redo',
    ],
  },
  language: 'de',
  restrictedEditing: {
    // TODO allow all commands except RestrictedMode specific ones. get them via editor.commands in dev console
    allowedCommands: [
      'enter',
      'deleteForward',
      'forwardDelete',
      'delete',
      'selectAll',
      'shiftEnter',
      'input',
      'undo',
      'redo',
      'paragraph',
      'insertParagraph',
      'heading',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'subscript',
      'superscript',
    ],
    allowedAttributes: [],
  },
  table: {
    contentToolbar: [
      'toggleTableCaption',
      '|',
      'tableRow',
      'tableColumn',
      '|',
      'tableProperties',
      'tableCellProperties',
      '|',
      'mergeTableCells',
    ],
  },
  // @ts-ignore
  list: {
    properties: {
      styles: true,
      startIndex: true,
      reversed: true,
    },
  },
}
